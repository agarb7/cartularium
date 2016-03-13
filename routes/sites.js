'use strict';

var path = require('path');
var appDir = path.dirname(require.main.filename);

require('datejs');
var express = require('express');

var bodyParser = require('body-parser');
var Site = require(appDir + '/models/site');
var notify = require(appDir + '/notify/notify');

var router = express.Router();

var parseBodyParams = bodyParser.urlencoded({extended: false});

var notifyingIntervals = [
  {days: 30},
  {days: 20},
  {days: 14},
  {days: 7},
  {days: 5},
  {days: 4},
  {days: 3},
  {days: 2},
  {days: 1}
];

var notifyCommandCreator = function (site) {
  return 'curl localhost/sites.notify-job/' + site._id;
};

var setupNotifying = function (err, site) {
  site.setupNotifying(notifyCommandCreator, notifyingIntervals);
};

router.get('/sites.notify-job/:id', function (req, res) {
  var notifyIfIn = function (err, site) {
    site.setupNotifying(notifyCommandCreator, notifyingIntervals);
    if (site.inNotifying(notifyingIntervals)) {
      notify.sendEmail(site);
      notify.sendSlackMessage(site);
    }
  };

  var udateAndNotify = function (err, site) {
    site.setupByWhois(notifyIfIn);
  };

  Site.findById(req.params.id)
    .exec(udateAndNotify);

  res.status(204).end();
});

router.get('/sites.list', function (req, res) {
  var sendSites = function (err, sites) {
    res.json(sites);
  };

  Site.find()
    .select('name created paidTill freeDate')
    .skip(+req.query.offset)
    .limit(+req.query.count)
    .exec(sendSites);
});

router.get('/sites.site/:id', function (req, res) {
  var sendSite = function (err, site) {
    res.json(site);
  };

  Site.findById(req.params.id)
    .select('name created paidTill freeDate whois')
    .exec(sendSite);
});

router.put('/sites.site', parseBodyParams, function (req, res) {
  var site = new Site({name: req.body.name});

  site.setupByWhois(function (err, site) {
    if (req.body.paidTill)
      site.paidTill = req.body.paidTill;

    site.save(setupNotifying);
  });

  res.status(204).end();
});

router.post('/sites.site/:id', parseBodyParams, function (req, res) {
  Site.findByIdAndUpdate(req.params.id, {
    name: req.body.name,
    created: req.body.created,
    paidTill: req.body.paidTill,
    freeDate: req.body.freeDate
  }).exec(setupNotifying);

  res.status(204).end();
});

router.delete('/sites.site/:id', function (req, res) {
  var removeSite = function (err, site) {
    site.remove();
  };

  var removeNotifyingAndSite = function (err, site) {
    if (site)
      site.removeNotifying(removeSite);
  };

  Site.findById(req.params.id)
    .exec(removeNotifyingAndSite);

  res.status(204).end();
});

//router.get('/', function (req, res) {
//  var date2 = new Date('2016-06-01');
//
//  var msPerD = 1000 * 60 * 60 * 24;
//  var msPerM = 1000 * 60;
//
//  var ms = date2 - Date.now();
//  var days = Math.floor(ms / msPerD);
//  var minutes = Math.floor(ms % msPerD / msPerM);
//
//  var result = [];
//
//  for (let i = 0; i < 4; ++i) {
//    result.push({
//      days: days,
//      minutes: minutes - 2 - i
//    });
//  }
//
//  res.json(result);
//});

module.exports = router;
