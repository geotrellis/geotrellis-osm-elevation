package geotrellis.osme.ingest

import org.scalatest._

import geotrellis.raster._
import geotrellis.raster.histogram._
import geotrellis.spark._
import geotrellis.spark.io._
import geotrellis.spark.io.s3._
import geotrellis.vector._
import geotrellis.spark.util.SparkUtils
import org.apache.spark.SparkConf
import org.apache.spark.rdd.RDD

class RasterReaderTest extends FunSuite {
	test("Zoom 2 Tile(0,2) is all NoData") {
        val reader = S3ValueReader("osm-elevation", "catalog").reader[SpatialKey, Tile](LayerId("ned", 2))
        val tile: Tile = reader.read(SpatialKey(0,2))
        assert(!tile.isNoDataTile)
    }

    test("Zoom 2 Tile(1,2) is all NoData") {
        val reader = S3ValueReader("osm-elevation", "catalog").reader[SpatialKey, Tile](LayerId("ned", 2))
        val tile: Tile = reader.read(SpatialKey(1,2))
        assert(!tile.isNoDataTile)
    }
}
