package geotrellis.osme.ingest

import geotrellis.raster._
import geotrellis.spark._
import geotrellis.spark.io._
import geotrellis.spark.io.s3._
import geotrellis.vector._
import geotrellis.spark.utils.SparkUtils
import org.apache.spark.SparkConf

object IngestElevation {
    def main(args: Array[String]): Unit = {
        implicit val sc = SparkUtils.createSparkContext("GeoTrellis OSM IngestElevation", new SparkConf(true))
        try {
            val reader: FilteringLayerReader[LayerId] = S3LayerReader("my-bucket", "catalog-prefix")
            val rdd: RDD[(SpatialKey, Tile)] with Metadata[TileLayerMetadata[SpatialKey]] =
                reader
                    .query[SpatialKey, Tile, TileLayerMetadata[SpatialKey]](LayerId("NED", 10))
                    .result
            val histogram = rdd.map { case (_, (_, tile)) => tile.histogram }
                                .reduce { _ merge _ }
                                .quantileBreaks(15)
        } finally {
            sc.stop()
        }  
    }
}
