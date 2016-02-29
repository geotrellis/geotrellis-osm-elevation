package geotrellis.osme.server

import akka.actor._
import geotrellis.vector.Line
import geotrellis.vector.io.json.{GeoJson => GJson}
import geotrellis.vector.io.json.JsonFeatureCollection
import geotrellis.vector.io.json.FeatureFormats.writeFeatureJson
import geotrellis.vector.LineFeature
import geotrellis.vector.Feature
import geotrellis.vector.io.json.GeometryFormats.MultiLineFormat
import org.apache.spark._
import spray.http.HttpHeaders.RawHeader
import spray.routing._
import spray.json.JsString


class OsmeServiceActor(
  sc: SparkContext
) extends Actor with OsmeService{

  def actorRefFactory = context
  def receive = runRoute(root)

}


trait ElevationUtility {
 def applyElevation(line:Line) = {
   val stubElevation: Array[Double]= new Map('elevation': new Array[Double](line.vertices.length).map(x => 5.0))
   writeFeatureJson(LineFeature(line, stubElevation))
 }

}

// trait partitioned off to enable better testing
trait OsmeService extends HttpService with ElevationUtility {

  def cors: Directive0 = respondWithHeader(RawHeader("Access-Control-Allow-Origin", "*"))


  def root =
    path("getVectorData") {
      post {
        entity(as[String]) { geoJson =>
          val GJsonCollection:JsonFeatureCollection = GJson.parse[JsonFeatureCollection](geoJson)
          val lines: Vector[Line] = GJsonCollection.getAllLines()
          val linesWithElevation= lines.map(line => applyElevation(line))
          println(lines.toString())
          complete {
            linesWithElevation.toJson
          }
        }
      }
    }
}
