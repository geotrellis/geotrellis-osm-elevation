package geotrellis.osme.ingest

import geotrellis.raster._
import geotrellis.raster.histogram._
import geotrellis.spark._
import geotrellis.spark.io._
import geotrellis.spark.io.s3._
import geotrellis.vector._
import geotrellis.spark.util.SparkUtils
import org.apache.spark.SparkConf
import org.apache.spark.rdd.RDD
import spray.json.DefaultJsonProtocol._

object GenerateHistogram {
    def main(args: Array[String]): Unit = {
        implicit val sc = SparkUtils.createSparkContext("GeoTrellis OSM IngestElevation", new SparkConf(true))
        try {
            val reader = S3LayerReader("osm-elevation", "catalog")
            val rdd: RDD[(SpatialKey, Tile)] with Metadata[TileLayerMetadata[SpatialKey]] =
                reader
                    .query[SpatialKey, Tile, TileLayerMetadata[SpatialKey]](LayerId("ned", 10))
                    .result
            val histogram = rdd.map { case (_, tile) => tile.histogramDouble }.reduce { _ merge _ }.quantileBreaks(15)
            reader.attributeStore.write(LayerId("ned", 0), "histogram", histogram)
        } finally {
            sc.stop()
        }  
    }
}