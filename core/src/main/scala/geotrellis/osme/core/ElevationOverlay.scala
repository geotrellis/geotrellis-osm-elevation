package geotrellis.osme.core

import java.io.{BufferedWriter, FileWriter, File}

import com.vividsolutions.jts.geom.{LineString, MultiLineString}
import geotrellis.raster.io.geotiff.SinglebandGeoTiff
import geotrellis.vector.io.json.{GeoJson, JsonFeatureCollection}
import scala.collection.immutable.Map
import spray.json._
import DefaultJsonProtocol._
import geotrellis.vector.io.json.FeatureFormats.writeFeatureJson
import geotrellis.vector.io.json.GeometryFormats._
import geotrellis.vector.densify.DensifyMethods
import geotrellis.vector.dissolve.DissolveMethods
import geotrellis.vector._


/* TODO: Add this to the geotrellis library as a property of Line maybe? */
object Segments {

 def apply(line: Line, numSegments: Int): Traversable[Line] = {
   val vertexCountPerLine = line.vertexCount / numSegments
   val partitions = line.points.sliding(vertexCountPerLine)
   partitions.map(points => Line(points)).toList
 }
}

object ElevationOverlay {
  /* Change to take polygon */
  def apply(geotiff: SinglebandGeoTiff, multiline: MultiLine): Traversable[Feature[Line, Map[String, Double]]] = {

    /* TODO: Reproject if necessary */
    val rasterExtent = geotiff.rasterExtent

    /* tolerance parameter for densify */
    val densifyParam = rasterExtent.cellwidth

    val densifiedLine = multiline.densify(densifyParam)
    val dissolvedLines: MultiLine = densifiedLine.dissolve.asMultiLine.getOrElse(multiline.jtsGeom)

    val numSegments = 5
    val segments = dissolvedLines.lines.map(line => Segments(line, numSegments)).flatten

    /* For every segment of all lines, map it to the raster and get the corresponding
     * elevation. Create a LineFeature for this */
    val segmentsFeatures = segments.map { segment =>
       val center = segment.centroid match {
         case PointResult(p) => p
         case NoResult => throw new Exception("No result found in PointOrNoResult")
       }
       val (col, row) = rasterExtent.mapToGrid(center)
       val elevation = geotiff.tile.getDouble(col, row)
       val meanvMap: Map[String, Double] = Map("MEANV" -> elevation)
       LineFeature(segment, meanvMap)
     }

    return segmentsFeatures.toTraversable


  }
}
