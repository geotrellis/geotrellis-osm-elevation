import fetch from 'isomorphic-fetch';

var actions = {
  queryRoadElevation: function(serviceUrl, polygonJSON, map) {
    return dispatch => {      
      return fetch(serviceUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
       },
        body: JSON.stringify(polygonJSON),
      })
      .then(
         response => {
           response.json().then( lines => {
             dispatch(actions.renderElevation(lines, map));
           });
         },
         error => {}           
      )
    }
  },
  renderElevation: function(lines, map, intervals){
      return {
        type: 'SHOW_ELEVATIONS',
        elevation: lines,
        theMap: map
      }
  }
};

module.exports = actions;