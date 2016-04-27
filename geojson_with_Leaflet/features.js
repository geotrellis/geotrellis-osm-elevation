/* 
 * Draw features in Javascript here.
 */


/* GLOBALS */
var token = 'pk.eyJ1IjoiZnVua3k5MDAwIiwiYSI6ImNpa2x5ZHc5NDBtbmd1Mm02NTFrMjBpcnoifQ.K46keFAz0ZoF4V9KxJvJCA';
var ID = 'funky9000.pb2hjcn1';

var cmuMap = L.map('map').setView([40.443, -79.943], 16);

var ucStyle = {
    style: myStyle
};

var latitude = 40.4435;
var longitude = -79.9420;

/******************************** FUNCTION DEFINITIONS *******************************************/

function setUp(map, tok, myId){

  L.mapbox.accessToken = tok;

  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: myId,
    accessToken: tok
  }).addTo(map);

  return map;
}

function addFixedMarker(map, message, style, lat, lng){
  // Fixed marker for UC.
  var fixedMarker = L.marker(new L.LatLng(lat, lng), style).bindPopup(message).addTo(map);

  return fixedMarker;
}

function drawPolygon(map, style){
  L.geoJson(university_center, style).addTo(map);
  return map;
}

/******************************** CALL FUNCTIONS *******************************************/

setUp(cmuMap, token, ID);

// NOTE: mapbox api requires set up to be done first.
var ucMarkerStyle = {
      icon: L.mapbox.marker.icon({
      'marker-color': 'ff8888'
})};

// Add UC marker feature to map.
var fixedMarker = addFixedMarker(cmuMap, 'CMU university center', ucMarkerStyle, latitude, longitude);
// Draw the boundaries of UC using information in cmu_sample_geojson.js
drawPolygon(cmuMap, ucStyle);

// Store the fixedMarker coordinates in a variable.
var fc = fixedMarker.getLatLng();
var featureLayer = L.mapbox.featureLayer().addTo(cmuMap);

// Used to draw lines between two points.
cmuMap.on('click', function(ev) {
    // ev.latlng gives us the coordinates of
    // the spot clicked on the map.
    var c = ev.latlng;

    var geojson = [
    {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [c.lng, c.lat]
    },
        "properties": {
          "marker-color": "#ff8888"
        }
    }, {
        "type": "Feature",
        "geometry": {
          "type": "LineString",
          "coordinates": [
            [fc.lng, fc.lat],
            [c.lng, c.lat]
          ]
        },
        "properties": {
          "stroke": "#000",
          "stroke-opacity": 0.5,
          "stroke-width": 4
        }
    }
    ];

    featureLayer.setGeoJSON(geojson);

    // Finally, print the distance between these two points
    // on the screen using distanceTo().
    var container = document.getElementById('distance');
    container.innerHTML = "Distance from fixed point : " + (fc.distanceTo(c)).toFixed(0) + 'm';

    //console.log("distance = %d\n", (fc.distanceTo(c)).toFixed(0));
});


/***** END *****/

