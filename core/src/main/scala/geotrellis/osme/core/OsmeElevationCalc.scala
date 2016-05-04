package geotrellis.osme.core

import geotrellis.raster.{Tile, Raster}
import geotrellis.vector.{LineFeature, Line}
import geotrellis.osme.server.Stats

/**
  * Created by arjunpuri on 4/28/16.
  */
class OsmeElevationCalc ( vectorTileUrl: String, elevationBucket: String, elevationPrefix: String) {

  def apply(raster: Raster[Tile], lines: Seq[Line]): Seq[LineFeature[Stats]] = {


  }

}

object OsmeElevationCalc {


}
