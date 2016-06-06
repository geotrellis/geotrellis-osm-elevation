// Predefined colours
const colours = [
  "#006400",
  "#008000",  
  "#00FF00",
  "#ADFF2F",
  "#FFFF00",
  "#FFD700",
  "#FFA500",
  "#FF8C00",
  "#FF4500",
  "#FF0000"
];

function assignColor(meanv, ranges){
    for (var i = 0; i < ranges.length - 1; i++){
      if (meanv >= ranges[i] && meanv <= ranges[i + 1])
        return colours[i];
    }
    return colours[colours.length - 1]; // last colour.
}

export default function renderElevationData(map, rawData, rangeObj){  
    var data = {
      "type": "FeatureCollection",
      "features": rawData
    };     
    var tmp = data; 
    var intervals = [];
    var ranges = []; 
    var minMeanv = rangeObj.min;
    var maxMeanv = rangeObj.max;
    var range = rangeObj.range;
   
    for (var i = 0; i < colours.length; i++){
      ranges.push(minMeanv + i * range);
    }

    // redistribute colours in each feature object.
    tmp.features.forEach(function(element, index, array){
      array[index].properties["stroke"] = assignColor(element.properties.MEANV, ranges);
      array[index].properties["stroke-opacity"] = 0.8;
      array[index].properties["stroke-width"] = 3;
      array[index].properties["fill"] = 0;
    });

    L.geoJson(tmp, {
        onEachFeature: function (feature, layer) {
          var coordinates = feature.geometry["coordinates"];
          var col = feature.properties["stroke"];
          var meanv = feature.properties["MEANV"];
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
    return ranges; // to generate legend.
}