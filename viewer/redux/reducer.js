import renderElevationData  from '../utils/renderRoads';
import setLegend from '../utils/renderLegend';
import unionElevation from '../utils/unionElevationData';

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

      var map = action.theMap;
      var roads = action.elevation; // New roads.
      var oldRoads = state.oldRoads; // Previously drawn roads.
           
      //var oldIntervals = state.elevationRanges; // get previously stored intervals
      var oldMin = state.min;
      var oldMax = state.max;
      if (oldMin == null) oldMin = 999;
      if (oldMax == null) oldMax = 0;
   
      // Calc max, min meanv and new ranges. No need oldIntervals.
      var maxMeanv = 0;
      var minMeanv = 999; 

      // max min meanv.
      roads.forEach(function(element, index, array){
        if (element.properties.MEANV > maxMeanv) maxMeanv = element.properties.MEANV;
        if (element.properties.MEANV < minMeanv) minMeanv = element.properties.MEANV;
      });         
      
      // Now compare with old max,min of roads.
      if (maxMeanv > oldMax){
        oldMax = maxMeanv;
      }
      if (minMeanv < oldMin){
        oldMin = minMeanv;
      }
      
      // There are 10 colours.
      var meanvRange = Math.round( ((oldMax - oldMin)/(10)) * 100)/100;
      
      var rangeObj = {
        min: oldMin,
        max: oldMax,
        range: meanvRange
      };

      var allRoads = unionElevation(oldRoads, roads);
      var ranges = renderElevationData(map, allRoads, rangeObj);
      setLegend(ranges, map); 
      
      return Object.assign({}, state, { min:oldMin, max:oldMax, oldRoads:allRoads });
    }
    default:
      return state;
  }
};

module.exports = reducer;
