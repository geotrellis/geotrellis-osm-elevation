package geotrellis.osme.server

import akka.actor._
import geotrellis.osme.core.{ElevationCalculation, DecomposePolygonTms}
import geotrellis.proj4.{WebMercator, LatLng, Proj4Transform}
import geotrellis.spark.SpatialKey
import geotrellis.vector._
import geotrellis.vector.io._
import geotrellis.vector.io.json._
import org.apache.spark._
import spray.http.HttpHeaders.RawHeader
import spray.routing._
import spray.json._
import spray.httpx.SprayJsonSupport._

class OsmeServiceActor(
  sc: SparkContext
) extends Actor with OsmeService{
  def actorRefFactory = context
  def receive = runRoute(root)
}

// trait partitioned off to enable better testing
trait OsmeService extends HttpService with CorsSupport {
  import Formats._

  def root = 
    cors{
      path("getVectorData" / IntNumber) { (zoom) =>
        options { complete{spray.http.StatusCodes.OK} } ~
        post {
          entity(as[Polygon]) { queryPolygon =>
            complete {
              // we can for and return Features and geometries because we import spray.httpx.SprayJsonSupport._
              // and import JsonFoArmat[_] for the required types from geotrellis.vector.io._

              val polygonFilter = queryPolygon.geom.reproject(LatLng, WebMercator).as[Polygon]
              val vectorWithElevation = polygonFilter.map(polygon => ElevationCalculation(zoom, polygon))

              OsmeService.riverFeatures.filter { feature =>
                feature.geom.intersects(queryPolygon)
              }
            }
          }
        }
      }
    }

object OsmeService {
  import Formats._

  lazy val riverFeatures: Vector[LineFeature[Stats]] =
    Resource.string("/rivers-west.json")
      .parseJson
      .convertTo[JsonFeatureCollection]
      .getAllLineFeatures[Stats]
}
