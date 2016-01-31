package geotrellis.osme.server

import org.apache.spark._

import akka.actor._
import akka.io.IO
import spray.can.Http
import spray.routing._
import spray.routing.directives.CachingDirectives
import spray.http.MediaTypes
import spray.http.HttpHeaders.RawHeader
import spray.httpx.SprayJsonSupport._
import spray.json._

import com.typesafe.config.ConfigFactory

import scala.concurrent._

class OsmeServiceActor(
  sc: SparkContext
) extends Actor with HttpService {
  import scala.concurrent.ExecutionContext.Implicits.global

  def cors: Directive0 = respondWithHeader(RawHeader("Access-Control-Allow-Origin", "*"))

  def actorRefFactory = context
  def receive = runRoute(root)

  def root =
    path("ping") { complete { "pong\n" } }
}
