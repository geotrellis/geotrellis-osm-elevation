package geotrellis.osme.core

import geotrellis.proj4.WebMercator
import geotrellis.spark.SpatialKey
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


    }
}
