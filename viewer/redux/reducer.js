import renderElevationData  from '../utils/renderRoads';
import geocolorJenksWrapper  from '../utils/renderRoads';

var reducer = function (state, action) {
  switch (action.type) {
    case 'SHOW_LAYER':
      return Object.assign({}, state, {
        map: {
          url: [action.url],
          activeLayerId: action.id
        }
      });

    case 'CENTER_MAP':
      return Object.assign({}, state, {
        map: {
          extent: action.extent
        }
      });

    case 'LOAD_CATALOG_SUCCESS': {
      return Object.assign({}, state, {
        rootUrl: action.url,
        catalog: action.catalog
      });
    }
    case 'SHOW_BOUNDS': {
      return _.merge({}, state, { map: { bounds: action.bounds } });
    }
    case 'SHOW_MAX_STATE': {
      console.log("SHOW_MAX_STATE");
      console.log(action.geojson);
      return _.merge({}, state, { map: { maxState: action.geojson } });
    }
    case 'HIDE_MAX_STATE': {
      console.log("HIDE_MAX_STATE");
      return _.merge({}, state, { map: { maxState: null } });
    }
    case 'SHOW_MAX_AVERAGE_STATE': {
      console.log("SHOW_MAX_AVERAGE_STATE");
      console.log(action.geojson);
      return _.merge({}, state, { map: { maxAverageState: action.geojson } });
    }
    case 'HIDE_MAX_AVERAGE_STATE': {
      console.log("HIDE_MAX_AVERAGE_STATE");
      return _.merge({}, state, { map: { maxAverageState: null } });
    }
    case 'SHOW_STATE_AVERAGE': {
      console.log("SHOW_STATE_AVERAGE");
      console.log(action.geojson);
      return _.merge({}, state, { map: { stateAverage: action.geojson } });
    }
    case 'SHOW_STATE_DIFF_AVERAGE': {
      console.log("SHOW_STATE_DIFF_AVERAGE");
      console.log(action.geojson);
      return _.merge({}, state, { map: { stateDiffAverage: action.geojson } });
    }
    case 'SHOW_ELEVATIONS': {
      console.log("SHOW_ELEVATIONS");

      // Modify elevation data to include other parameters in features array.
      function addPolylineParams(element, index, array){
        array[index].properties["fill"] = 0;
        array[index].properties["stroke"] = '#FFFFFF';
        array[index].properties["stroke-opacity"] = 1;
        array[index].properties["stroke-width"] = 1;
      }
      
      var roads = action.elevation;
      roads.forEach(addPolylineParams);
      
      var map = action.theMap;
      
      renderElevationData(map, roads);
            
      return _.merge({}, state, { map: { elevationData: roads } });
    }
    default:
      return state;
  }
};

module.exports = reducer;
