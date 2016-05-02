# 1. function create_object_links() gets a bucket path and returns a list of 
#    the link of each .img file
# 2. s3://azavea-datahub/emr/bootstrap.sh:  install python2.7: sudo yum install -y python27; 
#                                           install gdal; 
#                                           install gdal_retile.py: sudo yum install -y gdal-python.x86_64;
# 3. change spark conf file in the master node: 
#       sudo sed -i '$ a export PYSPARK_PYTHON=/usr/bin/python2.7' /usr/lib/spark/conf/spark-env.sh

# usage: nohup /usr/lib/spark/bin/spark-submit translate.py /path/of/raw/tiles /path/of/workspace jobId &
# example: nohup /usr/lib/spark/bin/spark-submit translate.py s3://azavea-datahub/raw/ned-13arcsec/ s3://osm-elevation/chunk/geotiff emr-test-job-full &

 
#!/usr/bin/env python
import os
import sys
import json
import errno
import shutil
import zipfile
import tempfile
import traceback
from urlparse import urlparse
from collections import namedtuple
from subprocess import call, check_output

APP_NAME = "OSM Elevation Data Conversion"

def create_tmp_directory(prefix):
    tmp = tempfile.mktemp(prefix=prefix, dir=os.path.join(os.environ['PWD'], "translate-temp"))
    return makedirs_p(tmp)

def makedirs_p(d):
    if not os.path.exists(d):
        os.makedirs(d)
    return d

def get_local_copy(uri, local_dir):
    parsed = urlparse(uri)
    local_path = tempfile.mktemp(dir=local_dir)
    if parsed.scheme == "s3":
        cmd = ["aws", "s3", "cp", uri, local_path]
    elif parsed.scheme == "https":
        cmd = ["wget", "-O", local_path, uri]
    else:
        cmd = ["cp", uri, local_path]

    c = call(cmd)

    return local_path

def create_object_links(bucket):
    cmd = ["aws", "s3", "ls", bucket]
    ls = check_output(cmd)
    lines = ls.splitlines()
    links = []
    for line in lines:
        obj = line.split()[-1]
        if ".img" in obj:
            links.append(bucket+obj)
    return links

def unzip(source_path):
    unzipped_dir = source_path + "-unzipped"
    with zipfile.ZipFile(source_path) as zf:
        zf.extractall(unzipped_dir)
    names = zf.namelist()
    extensions = ['.flt', '.hdr']
    unzipped_paths = {}
    for name in names:
        for extension in extensions:
            if extension in name:
                unzipped_paths[extension] = unzipped_dir+'/'+name
    return unzipped_paths

def upload_to_working(local_src, dest):
    parsed = urlparse(dest)

    if parsed.scheme == "s3":
        cmd = ["aws", "s3", "cp",
               local_src, dest]
    else:
        d = os.path.dirname(dest)
        if not os.path.exists(d):
            os.makedirs(d)
        cmd = ["cp", local_src, dest]

    call(cmd)

    return dest

def get_filename(uri):
    p = urlparse(uri)
    return os.path.splitext(os.path.join(p.netloc, p.path[1:]))[0]

def mkdir_p(dir):
    try:
        os.makedirs(dir)
    except OSError as exc: # Python >2.5
        if exc.errno == errno.EEXIST and os.path.isdir(dir):
            pass
        else: raise

UriSet = namedtuple('UriSet', 'source_uri workspace_target workspace_source_uri image_folder order')
    
def vsi_curlify(uri):
    """
    Creates a GDAL-readable path from the given URI
    """
    parsed = urlparse(uri)
    result_uri = ""
    if not parsed.scheme:
        result_uri = uri
    else:
        if parsed.scheme == "s3":
            result_uri = "/vsicurl/http://%s.s3.amazonaws.com%s" % (parsed.netloc, parsed.path)
        elif parsed.scheme.startswith("http"):
            result_uri = "/vsicurl/%s" % uri
        else:
            raise Exception("Unsupported scheme: %s" % parsed.schem)

    return result_uri

def process_flt(source_uri, order, workspace_uri):
    # Download the file and retile
    results = []
    workspace_prefix = get_filename(source_uri)

    local_dir = create_tmp_directory(workspace_prefix)
    try :
        MAX_HEIGHT = 1024 * 2
        MAX_WIDTH = 1024 * 2

        local_path = get_local_copy(source_uri, local_dir)
        unzipped_paths = unzip(local_path)

        # make sure gdal can recognize flt files
        hdr = unzipped_paths['.hdr']
        flt = unzipped_paths['.flt']
        cmd1 = ["gdalinfo"] + [hdr]
        cmd2 = ["gdalinfo"] + [flt]
        call(cmd1)
        call(cmd2)

        local_path = flt

        # translate
        translated_path = local_path + "-translated.tif"
        cmd = ["gdal_translate"] + ["-of", "GTiff",
                              "-co", "compress=deflate",
                              "-co", "predictor=3",
                              "-co", "tiled=yes",
                              "-co", "blockxsize=512",
                              "-co", "blockysize=512",
                              local_path,
                              translated_path]
        call(cmd)

        # retile
        tiled_dir = local_path + "-tiled"
        os.mkdir(tiled_dir)
        cmd = ["gdal_retile.py"] + ["-co", "compress=deflate",
                                    "-co", "predictor=3",
                                    "-ps", 
                                    str(MAX_WIDTH), 
                                    str(MAX_HEIGHT),
                                    "-targetDir",
                                    tiled_dir,
                                    translated_path]
        call(cmd)

        tile_filenames = os.listdir(tiled_dir)
        workspace_basename = os.path.basename(workspace_prefix)
        translated_path_name = os.path.splitext(os.path.basename(translated_path))[0]

        # upload
        for tile_filename in tile_filenames:
            workspace_key = os.path.splitext(os.path.join(workspace_prefix, tile_filename.replace(translated_path_name, workspace_basename)))[0]
            workspace_target = os.path.join(workspace_uri, workspace_key + "-working.tif")
            upload_to_working(os.path.join(tiled_dir, tile_filename), workspace_target)

            workspace_source_uri = vsi_curlify(workspace_target)

            image_folder = os.path.join(workspace_uri, workspace_key)

            uri_set = UriSet(source_uri = source_uri,
                             workspace_target = workspace_target,
                             workspace_source_uri = workspace_source_uri,
                             image_folder = image_folder,
                             order = order)

            results.append(uri_set)

        shutil.rmtree(local_dir)
    finally:
        if local_dir:
            shutil.rmtree(local_dir, ignore_errors=True)

    return results

def process_img(source_uri, order, workspace_uri):
    # Download the file and retile
    results = []
    workspace_prefix = get_filename(source_uri)

    local_dir = create_tmp_directory(workspace_prefix)
    try :
        MAX_HEIGHT = 1024 * 2
        MAX_WIDTH = 1024 * 2

        local_path = get_local_copy(source_uri, local_dir)

        # translate
        translated_path = local_path + "-translated.tif"
        cmd = ["gdal_translate"] + ["-of", "GTiff",
                              "-co", "compress=deflate",
                              "-co", "predictor=3",
                              "-co", "tiled=yes",
                              "-co", "blockxsize=512",
                              "-co", "blockysize=512",
                              local_path,
                              translated_path]
        call(cmd)

        # retile
        tiled_dir = local_path + "-tiled"
        os.mkdir(tiled_dir)
        cmd = ["gdal_retile.py"] + ["-co", "compress=deflate",
                                    "-co", "predictor=3",
                                    "-ps", 
                                    str(MAX_WIDTH), 
                                    str(MAX_HEIGHT),
                                    "-targetDir",
                                    tiled_dir,
                                    translated_path]
        call(cmd)

        tile_filenames = os.listdir(tiled_dir)
        workspace_basename = os.path.basename(workspace_prefix)
        translated_path_name = os.path.splitext(os.path.basename(translated_path))[0]

        # upload
        for tile_filename in tile_filenames:
            workspace_key = os.path.splitext(os.path.join(workspace_prefix.split("/")[-2], tile_filename.replace(translated_path_name, workspace_basename)))[0]
            workspace_target = os.path.join(workspace_uri, workspace_key + ".tif")
            upload_to_working(os.path.join(tiled_dir, tile_filename), workspace_target)

            workspace_source_uri = vsi_curlify(workspace_target)

            image_folder = os.path.join(workspace_uri, workspace_key)

            uri_set = UriSet(source_uri = source_uri,
                             workspace_target = workspace_target,
                             workspace_source_uri = workspace_source_uri,
                             image_folder = image_folder,
                             order = order)

            results.append(uri_set)

        shutil.rmtree(local_dir)
    finally:
        if local_dir:
            shutil.rmtree(local_dir, ignore_errors=True)

    return results

if __name__ == '__main__':
    from pyspark import SparkConf, SparkContext

    bucket = sys.argv[1]
    source_uris = create_object_links(bucket)
    workspace = sys.argv[2]
    jobId = sys.argv[3]
    conf = SparkConf().setAppName(APP_NAME)
    sc = SparkContext(conf=conf)

    uri_sets = sc.parallelize(enumerate(source_uris)).flatMap(lambda (o, i): process_img(i, o, workspace))
    source_tile_count = uri_sets.cache().count()

    print "Done."