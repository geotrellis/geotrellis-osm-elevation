package geotrellis.osme.core

import com.vividsolutions.jts.geom.{LineString, MultiLineString}
import geotrellis.raster.io.geotiff.SinglebandGeoTiff
import geotrellis.vector.io.json.{GeoJson, JsonFeatureCollection}
import spray.json._
import DefaultJsonProtocol._
import geotrellis.vector.io.json.FeatureFormats.writeFeatureJson
import geotrellis.vector.io.json.GeometryFormats._
import geotrellis.vector.densify.DensifyMethods
import geotrellis.vector.dissolve.DissolveMethods
import geotrellis.vector._
import scala.io.Source


/* TODO: Add this to the geotrellis library as a property of Line maybe */
object Segments {

 def apply(line: Line, numSegments: Int): Traversable[Line] = {
   val vertexCountPerLine = line.vertexCount / numSegments
   val partitions = line.points.sliding(vertexCountPerLine)
   partitions.map(points => Line(points)).toList
 }
}

object ElevationOverlay {
  /* Change to take polygon */
  def apply(): List[JsValue] = {
    val gt = SinglebandGeoTiff("data/imgn36w100_13_3_3.tif");
    val geojson = Source.fromFile("data/imgn36w100vector.geojson").getLines.mkString

    val gjCol = GeoJson.parse[JsonFeatureCollection](geojson)
    val polygons: Vector[Polygon] = gjCol.getAllPolygons()
    val lines: Vector[Line] = gjCol.getAllLines()
    val multiLine = gjCol.getAllLines().toMultiLine


    /* TODO: Reproject if necessary */
    val rasterExtent = gt.rasterExtent

    /* tolerance parameter for densify */
    val densifyParam = rasterExtent.cellwidth

    val densifiedLine = multiLine.densify(densifyParam)
    val dissolvedLines: MultiLine = densifiedLine.dissolve.asMultiLine.getOrElse(multiLine.jtsGeom)

    val numSegments = 5
    val segments = dissolvedLines.lines.map(line => Segments(line, numSegments)).flatten

    val centers = segments.map(line => line.centroid)

    val segmentsJSON = segments.map { segment =>
       val center = segment.centroid match {
         case PointResult(p) => p
         case NoResult => throw new Exception("No result found in PointOrNoResult")
       }
       val (col, row) = rasterExtent.mapToGrid(center)
       val elevation = gt.tile.getDouble(col, row)
       val meanvMap: Map[String, Double] = Map("MEANV" -> 2.0)
       writeFeatureJson(LineFeature(segment, meanvMap.toJson)).toJson
     }

    val file = new File("geocolor_test.json")
    val bw = new BufferedWriter(new FileWriter(file))
    bw.write(segmentsJSON)
    bw.close()
    //seqGeometryToGeometryCollection(segmentsJ)
    return segmentsJSON.toList


  }
}
