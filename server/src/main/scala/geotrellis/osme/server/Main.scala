package geotrellis.osme.server

import geotrellis.raster._
import geotrellis.raster.io.geotiff._
import geotrellis.raster.render._
import geotrellis.raster.resample._

import geotrellis.spark._
import geotrellis.spark.io._
import geotrellis.spark.io.file._
import geotrellis.spark.io.s3._
import geotrellis.spark.io.accumulo._
import geotrellis.spark.io.avro._
import geotrellis.spark.io.avro.codecs._
import geotrellis.spark.io.json._
import geotrellis.spark.io.index._

import org.apache.spark._
import org.apache.avro.Schema

import org.apache.accumulo.core.client.security.tokens._

import com.github.nscala_time.time.Imports._
import akka.actor._
import akka.io.IO
import spray.can.Http
import spray.routing.{HttpService, RequestContext}
import spray.routing.directives.CachingDirectives
import spray.http.MediaTypes
import spray.json._
import spray.json.DefaultJsonProtocol._

import com.typesafe.config.ConfigFactory

import scala.concurrent._
import scala.collection.JavaConverters._
import scala.reflect.ClassTag

object Main {
  def main(args: Array[String]): Unit = {
    val conf =
      new SparkConf()
        .setIfMissing("spark.master", "local[*]")
        .setAppName("Osme Server")
        .set("spark.serializer", "org.apache.spark.serializer.KryoSerializer")
        .set("spark.kryo.registrator", "geotrellis.spark.io.hadoop.KryoRegistrator")

    implicit val sc = new SparkContext(conf)

    implicit val system = akka.actor.ActorSystem("demo-system")

    // create and start our service actor
    val service =
      system.actorOf(Props(classOf[OsmeServiceActor], sc), "osme")

    // start a new HTTP server on port 8088 with our service actor as the handler
    IO(Http) ! Http.Bind(service, "0.0.0.0", 8088)
  }
}
