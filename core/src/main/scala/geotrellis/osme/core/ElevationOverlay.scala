package geotrellis.osme.core

import geotrellis.raster.io.geotiff.SinglebandGeoTiff
import geotrellis.vector.io.json.{GeoJson, JsonFeatureCollection}
import geotrellis.vector.densify.DensifyMethods
import geotrellis.vector.dissolve.DissolveMethods
import geotrellis.vector.{MultiLine, MultiLineMultiLineUnionResult, Polygon, Line}
import scala.io.Source


object ElevationOverlay {
  /* Change to take polygon */
  def apply(): Int = {
    val gt = SinglebandGeoTiff("data/imgn36w100_13_3_3.tif");
    val geojson = Source.fromFile("data/imgn36w100vector.geojson").getLines.mkString

    val gjCol = GeoJson.parse[JsonFeatureCollection](geojson)
    val polygons: Vector[Polygon] = gjCol.getAllPolygons()
    val lines: Vector[Line] = gjCol.getAllLines()
    val multiLine = gjCol.getAllLines().toMultiLine

    println(multiLine)

    /* TODO: Reproject if necessary */
    val rasterExtent = gt.rasterExtent

    /* tolerance parameter for densify */
    val densifyParam = rasterExtent.cellwidth

    val densifiedMultiline = multiLine.densify(densifyParam)
    val dissolveMulitiline = densifiedMultiline.dissolve.asMultiLine

    println(densifiedMultiline)
    println(dissolveMulitiline)

    return 42;

  }
}
