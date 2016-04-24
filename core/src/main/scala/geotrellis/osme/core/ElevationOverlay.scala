package geotrellis.osme.core

import geotrellis.raster.io.geotiff.SingleBandGeoTiff;
import geotrellis.vector.io.json.ExtentsToGeoJson;
import geotrellis.vector.Polygon

object ElevationOverlay {
  def apply(polygon: Polygon): Int = {
    val gt = SingleBandGeoTiff("data/imgn06e162_13_1_1.tf");
    val tile = gt.tile

    return 42;

  }
}
