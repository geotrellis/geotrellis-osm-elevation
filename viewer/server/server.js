var config = require('../webpack.config')
var express = require('express');
var path = require('path');
var webpack = require('webpack')
var webpackDevMiddleware = require('webpack-dev-middleware')
var webpackHotMiddleware = require('webpack-hot-middleware')

var app = express();
var port = 3000;

var compiler = webpack(config);
app.use(webpackDevMiddleware(compiler, { noInfo: true, publicPath: config.output.publicPath }));
app.use(webpackHotMiddleware(compiler));

app.use(express.static('./dist'));

app.get("/", function(req, res) {
  console.log("index.html");
  res.sendFile(path.resolve('client/index.html'));
});

app.get("/favicon.ico", function(req, res) {
  console.log("icon");
  res.sendFile(path.resolve('client/favicon.ico'));
});

app.get("/legend.css", function(req, res) {
  console.log("legend");
  res.sendFile(path.resolve('stylesheets/legend.css'));
});

app.listen(port, function(error) {
  if (error) {
    console.error(error);
  } else {
    console.log("Express server listening on port", port);
  }
});
