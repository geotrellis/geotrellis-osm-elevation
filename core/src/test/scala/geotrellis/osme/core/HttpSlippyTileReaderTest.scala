package geotrellis.osme.core

import org.scalatest._
import geotrellis.spark.SpatialKey

class HttpSlippyTileReaderTest extends FunSuite {
  test("The reading result for (z=1, x=1, y=1) is not empty") {
        val reader = new HttpSlippyTileReader[String](fromBytes)
        assert(reader.read(1, 1, 1).length()!=0)
    }

    private def fromBytes(key: SpatialKey, arr: Array[Byte]) = 
        arr.map("%02x".format(_)).mkString
}