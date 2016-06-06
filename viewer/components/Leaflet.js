import React from 'react';
import { render } from 'react-dom';
import { Map, Marker, Popup, TileLayer, FeatureGroup, BaseTileLayer, GeoJson, Circle } from 'react-leaflet';
import { EditControl } from "react-leaflet-draw"
import "leaflet/dist/leaflet.css";

var Leaflet = React.createClass({
  _onEditPath: function() {
      console.log("onEditPath");
  },
  _onCreate: function(e) {
        
      var map = e.layer._map;
      
      // get polygon geojson from e.
      var polygonJSON = e.layer.toGeoJSON();
      var serviceURL = "http://localhost:8088/getVectorData";
    
      this.props.queryPolygon(serviceURL, polygonJSON.geometry, map);
                                          
      console.log("onCreate");
  },
  _mounted: function() {
      console.log("mounted");
  },
  _onDeleted: function() {
      console.log("deleted");
  },

  render: function() {
    const style = {
      minHeight: "800px", width: "100%"
    };
    let tileLayers = _.map(this.props.url, u => {
      return <TileLayer url={u} />;
    });

    return (
      <Map center ={[37.062,-121.530]} zoom={8} style={style} bounds={this.props.bounds}>
        <TileLayer
          url="http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png"
        />
        <FeatureGroup>
            <EditControl
              position='topleft'
              onEdited={this._onEditPath}
              onCreated={this._onCreate}
              onDeleted={this._onDeleted}
              onMounted={this._mounted}
              draw={{
                rectangle: false
              }}
            />
        </FeatureGroup>
        {tileLayers}
      </Map>
    );
  }
});



module.exports = Leaflet;
