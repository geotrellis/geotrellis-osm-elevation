var geocolor = require('geocolor');

export default function geocolorJenksWrapper(data){
    var z = 'MEANV', numberOfBreaks = 20, colors = ['green', 'yellow', 'red'];
    var tmp = null;

    if ( (data.features != null) && (data.features.length > 0) ){
      console.log("Trying to geocolor");
      // breaks is null.
      try {
        tmp = geocolor.jenks(data, z, numberOfBreaks, colors);      
        console.log(tmp);
      } catch(TypeError){
        console.log("TYPE ERROR : breaks is possibly null OR there are no roads...");
      }
    }
    return tmp;  
}
 
export default function renderElevationData(map, rawData){
  
      var data = {
        "type": "FeatureCollection",
        "features": rawData
      };  
  
    console.log("DATA");
    console.log(data); // Each object properties do not have correct params.

    var tmp = geocolorJenksWrapper(data);

    var index = 0;
    var intervals = [];
          
    L.geoJson(tmp, {
        onEachFeature: function (feature, layer) {

          var coordinates = feature.geometry["coordinates"];
          var col = feature.properties["stroke"];
          var meanv = feature.properties["MEANV"];

          if (intervals[col] == null){
            intervals[col] = [999,0]; // Stores only two values.
          }

          // For each colour, find min and max meanv.
          if (meanv < intervals[col][0]){
            intervals[col][0] = meanv;
          }
          if (meanv > intervals[col][1]){
            intervals[col][1] = meanv;
          }

          var line = {
          "type": "LineString",
            "coordinates": coordinates
          };

          var styles = {
            "color": col
          };

          L.geoJson(line , {style:styles}).addTo(map);

        } /**/
    });
    
    return intervals; // to generate legend.
}

