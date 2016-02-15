package geotrellis.osme.server

import akka.actor._
import geotrellis.vector.io.json.{GeoJson => GJson}
import geotrellis.vector.io.json.JsonFeatureCollection
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

// trait partitioned off to enable better testing
trait OsmeService extends HttpService {

  def cors: Directive0 = respondWithHeader(RawHeader("Access-Control-Allow-Origin", "*"))

  def root =
    path("getVectorData") {
      post {
        entity(as[String]) { geoJson =>
          val GJsonCollection:JsonFeatureCollection = GJson.parse[JsonFeatureCollection](geoJson);
          val line = GJsonCollection.getAllLineFeatures[MultiLineFormat[JsString]];







        }
      }
    }



}
