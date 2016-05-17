import renderElevationData  from '../utils/renderRoads';
import setLegend from '../utils/renderLegend';
import unionElevation from '../utils/unionElevationData';

var reducer = function (state, action) {
  switch (action.type) {
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
