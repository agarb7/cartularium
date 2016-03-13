'use strict';

var path = require('path');
var appDir = path.dirname(require.main.filename);

var express = require('express');

require(appDir + '/db.js');
var sites = require(appDir + '/routes/sites');

var app = express();

app.use('/', sites);

app.listen(80, function () {
  console.log('Listening on port 80!');
});
