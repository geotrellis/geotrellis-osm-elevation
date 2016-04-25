package geotrellis.osme.server

import scala.io.Source

/** Helper utility to read files from resources folder of this project */
object Resource {
  def stream(name: String) = {
    getClass.getResourceAsStream(name)
  }

  def string(name: String) = {
   Source.fromInputStream(stream(name)).getLines.mkString
  }
}
