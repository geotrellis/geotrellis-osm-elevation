import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as actions from '../redux/actions';
import Leaflet from '../components/Leaflet';
import Catalog from '../components/Catalog';
import Panels from '../components/Panels';
import MapViews from '../components/MapViews';
import _ from 'lodash';

import "bootstrap-webpack";

var App = React.createClass({
    
  render: function() {
    return (
    <div className="row">
        <div className="col-md-9">
          <Leaflet
            queryPolygon={this.props.actions.queryRoadElevation}
            url={this.props.map.url}
            bounds={this.props.map.bounds} 
            oldIntervals={this.props.actions.elevationRanges}
            />
        </div>
      </div>
    );
  }
});

var mapStateToProps = function (state) {
  return state;
};

var mapDispatchToProps = function (dispatch) {
  return { // binding actions triggers dispatch on call
    actions: bindActionCreators(actions, dispatch)
  };
};

module.exports = connect(mapStateToProps, mapDispatchToProps)(App);
