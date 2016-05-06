package geotrellis.osme.core

import geotrellis.proj4.WebMercator
import geotrellis.raster.{GridBounds, Tile}
import geotrellis.spark.{LayerId, SpatialKey}
import geotrellis.spark.io.s3.S3ValueReader
import geotrellis.spark.tiling.{MapKeyTransform, LayoutDefinition, ZoomedLayoutScheme}
import geotrellis.vector.Polygon
/**
  * Created by arjunpuri on 5/3/16.
  */
object DecomposePolygonTms {
  def apply(zoom: Int, polygon: Polygon): Seq[SpatialKey] = {

    val scheme  = ZoomedLayoutScheme(WebMercator)
    val layout: LayoutDefinition = scheme.levelForZoom(zoom).layout
    val transform: MapKeyTransform = layout.mapTransform
    val extent = layout.extent
    val bounds: GridBounds = transform(extent)
    bounds.coords.map(coord => SpatialKey(coord._1, coord._2)).distinct

  }
}
