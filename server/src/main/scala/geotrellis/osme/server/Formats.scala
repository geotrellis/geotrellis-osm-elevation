package geotrellis.osme.server

import spray.json._

/** Container for custom JSON Formats */
object Formats extends DefaultJsonProtocol {
  implicit val statsFormat: RootJsonFormat[Stats] =
    jsonFormat1(Stats) // auto-generate format for a case class
}
