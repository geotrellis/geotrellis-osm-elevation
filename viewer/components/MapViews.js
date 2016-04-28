"use strict";
import React from 'react';
import _ from 'lodash';
import { PanelGroup, Panel, Input, Button, ButtonGroup } from 'react-bootstrap';

function updateMap (root, op, layer, t1, t2) { //v = {root, op, layer, time1, time2}
  console.log("update map");
  return showLayerWithBreaks => {
    // console.log("Update Map", root, op, layer, t1, t2, (layer && t1) ? "pass" : "fail")
    if ( ! _.isUndefined(layer) && ! _.isUndefined(t1) && ! _.isUndefined(t2) ) {
      // Difference Calculation
      let time1 = layer.times[t1];
      let time2 = layer.times[t2];
      let opc = ((op != "none") && layer.isLandsat) ?  `&operation=${op}` : "";
      showLayerWithBreaks(
        `${root}/diff/${layer.name}/{z}/{x}/{y}?time1=${time1}&time2=${time2}${opc}`,
        `${root}/diff/breaks/${layer.name}?time1=${time1}&time2=${time2}${opc}`
      );
    } else if (! _.isUndefined(layer) && ! _.isUndefined(t1) ) {
      //console.log("yes");
      // Single Band Calculation
      let time1 = layer.times[t1];
      let time2 = layer.times[t2];
      let opc = ((op != "none") && layer.isLandsat) ?  `&operation=${op}` : "";
      showLayerWithBreaks(
        `${root}/tiles/${layer.name}/{z}/{x}/{y}?time=${time1}${opc}`,
        `${root}/tiles/breaks/${layer.name}?time=${time1}${opc}`
      );
    }
  };
}

var MapViews = React.createClass({
  getInitialState: function () {
    return {
      activePane: 1,
      bandOp: "none",
      diffOp: "ndvi",
      layer: undefined, //layer index
      time1: undefined, //time1 index in layer
      time2: undefined, //time2 index in layer
      times: {}, // maps from layerId => {timeId1 , timeId2}
      autoZoom: true
    };
  },
  handleAutoZoom: function(e) {
    let v = e.target.checked || false;
    this.setState(_.merge({}, this.state, {autoZoom: v}));
    if (v) this.props.showExtent(this.props.layers[this.state.layer].extent);
  },
  handlePaneSelect: function(id) {
    console.log("PANE SELECT %s", id);
    let newState = _.merge({}, this.state, { activePane: id });
    this.setState(newState);
    this.updateMap(newState);
  },
  handleElevationSelect: function(e) {
    // Get elevation data here?
    console.log("here");
  },
  handleLayerSelect: function(ev) {
    let layer = +ev.target.value;

    let newState = _.merge({}, this.state, {
      "layer": layer,
      "time1": _.get(this.state.times[layer], "time1", undefined),
      "time2": _.get(this.state.times[layer], "time2", undefined),
      "times": {
        [this.state.layer]: {
          "time1": this.state.time1,
          "time2": this.state.time2
        }
      }
    });

    this.setState(newState);
    this.updateMap(newState);
    if (this.state.autoZoom) this.props.showExtent(this.props.layers[layer].extent);
  },

  handleTimeSelect: function(target, ev) {
    let newState = _.merge({}, this.state, { [target]: +ev.target.value });
    this.setState(newState);
    this.updateMap(newState);
  },
  handleBandOperationSelect: function(ev) {
    let newState = _.merge({}, this.state, { bandOp: ev.target.value });
    this.setState(newState);
    this.updateMap(newState);
  },
  handleDiffOperationSelect: function(ev) {
    let newState = _.merge({}, this.state, { diffOp: ev.target.value });
    this.setState(newState);
    this.updateMap(newState);
  },
  selection: function (state) {
    var layer, time1, time2;
    if (state.layer != undefined && ! _.isEmpty(this.props.layers)) {
      layer = this.props.layers[state.layer];
      time1 = layer.times[state.time1];
      time2 = layer.times[state.time2];
    }
    return [layer, time1, time2];
  },
  updateMap: function (state) {
    let [layer, time1, time2] = this.selection(state);
    console.log("ACTIVE PANE: %s", state.activePane);
    if (state.activePane == 1){
      updateMap(this.props.rootUrl, state.bandOp, layer, state.time1)(this.props.showLayerWithBreaks);
    } else {
      updateMap(this.props.rootUrl, state.diffOp, layer, state.time1, state.time2)(this.props.showLayerWithBreaks);
    }
  },
  componentWillReceiveProps: function (nextProps){
  /** Use this as an opportunity to react to a prop transition before render() is called by updating the state using this.setState().
    * The old props can be accessed via this.props. Calling this.setState() within this function will not trigger an additional render. */
    if ( _.isUndefined(this.state.layer) && ! _.isEmpty(nextProps.layers)) {

      // we are blank and now is our chance to choose a layer and some times
      let newState = _.merge({}, this.state, { layer: 0, time1: 0, time2: 1 });
      this.setState(newState);
      var layer = nextProps.layers[0];

      if (this.state.activePane == 1){
        updateMap(nextProps.rootUrl, this.state.bandOp, layer, 0)(nextProps.showLayerWithBreaks);
      } else {
        updateMap(nextProps.rootUrl, this.state.diffOp, layer, 0, 1)(nextProps.showLayerWithBreaks);
      }
      nextProps.showExtent(layer.extent);
    }
  },
  render: function() {
    let [layer, time1, time2] = this.selection(this.state);
    let isLandsat = _.get(layer, "isLandsat", false);

    let layerOptions =
      _.map(this.props.layers, (layer, index) => {
        return <option value={index} key={index}>{layer.name}</option>;
      });

    let layerTimes =
      _.map(_.get(layer, "times", []), (time, index) => {
        return <option value={index} key={index}>{time}</option>;
      });

    return (<div>

      <Button label = "Get Elevation" onClick={this.handleElevationSelect}>
          Get Elevation
      </Button>
      <Panel header={<h3>Layer</h3>}>
        <Input type="select" placeholder="select" value={this.state.layer}
          onChange={this.handleLayerSelect}>
          <option disabled>[None]</option>
          {layerOptions}
        </Input>
        <Input type="checkbox" label="Snap to layer extent" checked={this.state.autoZoom} onChange={this.handleAutoZoom} />
      </Panel>
      <PanelGroup defaultActiveKey="1" accordion={true} onSelect={this.handlePaneSelect}>
        <Panel header="Single Layer" eventKey="1" id={1}>
          <Input type="select" label="Time" placeholder="select" value={this.state.time1}
              onChange={ev => this.handleTimeSelect("time1", ev)}>
            <option disabled>[None]</option>
            {layerTimes}
          </Input>


          <Input type="select" label="Operation" placeholder="select" defaultValue="none"
              value={isLandsat ? this.state.bandOp : "none"}
              disabled={!isLandsat}
              onChange={this.handleBandOperationSelect}>
            <option value="none">View</option>
            <option value="ndvi">NDVI</option>
            <option value="ndwi">NDWI</option>
          </Input>
        </Panel>

        <Panel header="Layer Change Detection" eventKey="2" id={2}>
          <Input type="select" label="Time 1" placeholder="select" value={this.state.time1}
            onChange={ev => this.handleTimeSelect("time1", ev)}>
            <option disabled>[None]</option>
            {layerTimes}
          </Input>

          <Input type="select" label="Time 2" placeholder="select" value={this.state.time2}
            onChange={ev => this.handleTimeSelect("time2", ev) }>
            <option disabled>[None]</option>;
            {layerTimes}
          </Input>

          <Input type="select" label="Operation" placeholder="select" defaultValue="none"
              disabled={!isLandsat}
              value={isLandsat ? this.state.diffOp : "none"}
              onChange={this.handleDiffOperationSelect}>
            <option value="none">View</option>
            <option value="ndvi">NDVI Change</option>
            <option value="ndwi">NDWI Change</option>
          </Input>
        </Panel>
      </PanelGroup>
    </div>)
  }
});

module.exports = MapViews;


// "use strict";
// import React from 'react';
// import _ from 'lodash';
// import { PanelGroup, Panel, Input, Button, ButtonGroup } from 'react-bootstrap';
// import SingleLayer from "./SingleLayer";
// import DiffLayer from "./DiffLayer";
// import DiffLayers from "./DiffLayers";
// import AverageByState from "./AverageByState";

// var Panels = React.createClass({
//   getInitialState: function () {
//     return {
//       activePane: 1,
//       autoZoom: true
//     };
//   },
//   handleAutoZoom: function(e) {
//     let v = e.target.checked || false;
//     this.setState(_.merge({}, this.state, {autoZoom: v}));
//     if (v) this.props.showExtent(this.props.layers[this.state.layerId1].extent);
//   },
//   handlePaneSelect: function(id) {
//     console.log("PANE SELECT %s", id);
//     let newState = _.merge({}, this.state, { activePane: +id });
//     this.setState(newState);
//   },
//   updateState: function(target, value) {
//     let newState = _merge({}, this.state, {[target]: value});
//     this.setState(newState);
//   },
//   showExtent: function(id) {
//     var self = this;
//     return function() {
//       if (id == self.state.activePane && self.state.autoZoom) { // if the message is from active pane, pass it on
//         self.props.showExtent.apply(this, arguments);
//       }
//     };
//   },
//   showLayerWithBreaks: function (id) {
//     var self = this;
//     return function() {
//       if (id == self.state.activePane) { // if the message is from active pane, pass it on
//         return self.props.showLayerWithBreaks.apply(self, arguments);
//       } else {
//         // console.log("Wouldn't go yonder", id, self.state.activePane, arguments)
//         return null;
//       }
//     };
//   },
//   showStateAverage: function(id) {
//     var self = this;
//     return function() {
//       if (id == self.state.activePane) { // if the message is from active pane, pass it on
//         self.props.showStateAverage.apply(this, arguments);
//       }
//     };
//   },
//   showStateDiffAverage: function(id) {
//     var self = this;
//     return function() {
//       if (id == self.state.activePane) { // if the message is from active pane, pass it on
//         self.props.showStateDiffAverage.apply(this, arguments);
//       }
//     };
//   },
//   componentDidUpdate: function(prevProps, prevState) {
//     // force map refresh if either the pane selection changed or auto-zoom was clicked
//     // this must happen after state update in order for this.showLayerWithBreaks to pass the info
//     if (this.state != prevState) {
//       switch (this.state.activePane) {
//       case 1:
//         this.refs.single.updateMap();
//         break;
//       case 2:
//         this.refs.diff.updateMap();
//         break;
//       case 3:
//         this.refs.layerDiff.updateMap();
//       case 4:
//         this.refs.averageByState.updateMap();
//       }
//     }
//   },
//   render: function() {
//     let nonLandsatLayers = _.filter(this.props.layers, l => {return ! l.isLandsat});
//     let showNEXLayers = nonLandsatLayers.length > 0;
//     return (
//     <div>
//       <Input type="checkbox" label="Snap to layer extent" checked={this.state.autoZoom} onChange={this.handleAutoZoom} />
//       <PanelGroup defaultActiveKey="1" accordion={true} onSelect={this.handlePaneSelect}>
//         <Panel header="Single Layer" eventKey="1" id={1}>
//           <SingleLayer
//             ref="single"
//             rootUrl={this.props.rootUrl}
//             layers={this.props.layers}
//             showLayerWithBreaks={this.showLayerWithBreaks(1)}
//             showExtent={this.showExtent(1)} />
//         </Panel>

//         <Panel header="Change Detection" eventKey="2" id={2}>
//           <DiffLayer
//             ref="diff"
//             rootUrl={this.props.rootUrl}
//             layers={this.props.layers}
//             showLayerWithBreaks={this.showLayerWithBreaks(2)}
//             showExtent={this.showExtent(2)} />
//         </Panel>

//         { showNEXLayers ?
//           <Panel header="Layer to Layer Change Detection" eventKey="3" id={3}>
//             <DiffLayers
//               ref="layerDiff"
//               rootUrl={this.props.rootUrl}
//               layers={nonLandsatLayers}
//               showLayerWithBreaks={this.showLayerWithBreaks(3)}
//               showExtent={this.showExtent(3)}
//               showMaxState={this.props.showMaxState}
//               hideMaxState={this.props.hideMaxState}
//               showMaxAverageState={this.props.showMaxAverageState}
//               hideMaxAverageState={this.props.hideMaxAverageState} />
//           </Panel>
//           : null
//         }

//         { showNEXLayers ?
//           <Panel header="Average by State" eventKey="4" id={4}>
//             <AverageByState
//               ref="averageByState"
//               rootUrl={this.props.rootUrl}
//               layers={nonLandsatLayers}
//               showLayerWithBreaks={this.showLayerWithBreaks(4)}
//               showStateAverage={this.showStateAverage(4)}
//               showExtent={this.showExtent(4)} />
//           </Panel>
//           : null
//         }

//         { showNEXLayers ?
//           <Panel header="Average Change by State" eventKey="4" id={4}>
//             <AverageChangeByState
//               ref="averageByState"
//               rootUrl={this.props.rootUrl}
//               layers={nonLandsatLayers}
//               showLayerWithBreaks={this.showLayerWithBreaks(4)}
//               showStateDiffAverage={this.showStateDiffAverage(4)}
//               showExtent={this.showExtent(4)} />
//           </Panel>
//           : null
//         }

//       </PanelGroup>
//     </div>)
//   }
// });

// module.exports = Panels;
