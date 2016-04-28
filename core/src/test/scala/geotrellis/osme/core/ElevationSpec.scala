package geotrellis.osme.core

import java.io.{FileWriter, BufferedWriter, File}

import geotrellis.raster.io.geotiff.SinglebandGeoTiff
import geotrellis.vector.{Feature, Line, LineFeature}
import geotrellis.vector.io.json.GeoJson._
import spray.json.DefaultJsonProtocol._
import geotrellis.vector.io.json.{JsonFeatureCollection, GeoJson}
import spray.json.JsonReader
import scala.io.Source
import org.scalatest._


class ElevationSpec extends FunSpec with Matchers {

  def sharedData = {

    val geojson = Source.fromFile("data/imgn36w100vector.geojson").getLines.mkString
    val gjCol = parse[JsonFeatureCollection](geojson)

    new {
      val geotiff = SinglebandGeoTiff("data/imgn36w100_13_3_3.tif")
      val multiLine = gjCol.getAllLines().toMultiLine
      val elevationGeoJson = ElevationOverlay(geotiff, multiLine)
    }

  }

  describe("Core spec") {

    val numInputLines = sharedData.multiLine.lines.size
    val numOutputLines = sharedData.elevationGeoJson.size
    val ratio = numOutputLines / numInputLines
    println(s"Ratio of input lines to output lines: $ratio : 1")

    it("returned geojson should contain the MEANV property") {
      val elevationFeatures =  sharedData.elevationGeoJson
      val hasMeanV = elevationFeatures.forall(feat => feat.data.contains("MEANV"))
      assert(hasMeanV)
    }

    it("should produce a geojson file that can be put into geocolor.io") {
      val elevationFeatures =  sharedData.elevationGeoJson
      val jsonFeatures = JsonFeatureCollection(elevationFeatures)

      val file = new File("geocolor_test.json")
      val bw = new BufferedWriter(new FileWriter(file))
      bw.write(jsonFeatures.toJson.prettyPrint)
      bw.close()
    }

    it("Every feature should intersect the tile extent") {
      val elevationFeatures =  sharedData.elevationGeoJson
      val rasterPoly =  sharedData.geotiff.rasterExtent.extent.toPolygon()
      val doesIntersect = elevationFeatures.forall(feat => rasterPoly.intersects(feat.geom))
      assert(doesIntersect)
    }


  }
}
