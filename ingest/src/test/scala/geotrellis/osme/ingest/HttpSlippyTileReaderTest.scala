package geotrellis.osme.ingest

import org.scalatest._
import geotrellis.spark.SpatialKey

class HttpSlippyTileReaderTest extends FunSuite {
	test("Print the reading result for (z=1, x=1, y=1)") {
        val reader = new HttpSlippyTileReader[String]("http://tile.openstreetmap.us/vectiles-highroad/{z}/{x}/{y}.mvt")(fromBytes)
        println(reader.read(1, 1, 1))
    }

    private def fromBytes(key: SpatialKey, arr: Array[Byte]) = 
        arr.map("%02x".format(_)).mkString(" ")
}
