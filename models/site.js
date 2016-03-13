'use strict';

var path = require('path');
var appDir = path.dirname(require.main.filename);

require('datejs');
var _ = require('underscore');
var mongoose = require('mongoose');

var crontab = require('crontab');

var whoisParser = require(appDir + '/whois-parser/whois-parser');

function applyIntervals(date, intervals) {
  var apply = function (item) {
    var negated = _.mapObject(item, function (val) {
      return -val;
    });

    return (new Date(date)).add(negated);
  };

  return _.map(intervals, apply);
}

var siteSchema = mongoose.Schema({
  name: String,
  created: Date,
  paidTill: Date,
  freeDate: Date,
  whois: String
});

siteSchema.methods.setupByWhois = function (cb) {
  var that = this;

  whoisParser.lookup(that.name, function (err, data) {
    that.paidTill = data.paidTill;
    that.created = data.created;
    that.freeDate = data.freeDate;
    that.whois = data.raw;

    cb(err, that);
  });
};

siteSchema.methods.setupNotifying = function (commandCreator, intervals, cb) {
  if (_.isUndefined(cb))
    cb = _.noop;

  var that = this;

  if (!that.paidTill || !that._id) {
    cb(true, that);
    return;
  }

  intervals = applyIntervals(that.paidTill, intervals);

  var jobMarker = 'cartularium_' + that._id;

  crontab.load(function (err, crontab) {
    crontab.remove({comment: jobMarker});

    var hasFutureYear = false;

    _.each(intervals, function (date) {
      var now = new Date;
      if (date > now) {
        if (date.getYear() === now.getYear())
          crontab.create(commandCreator(that), date, jobMarker);
        else
          hasFutureYear = true;
      }
    });

    if (hasFutureYear)
      crontab.create(commandCreator(that), '@yearly', jobMarker);

    crontab.save(function (err) {
      cb(err, that);
    });
  });
};

siteSchema.methods.removeNotifying = function (cb) {
  if (_.isUndefined(cb))
    cb = _.noop;

  var that = this;

  if (!that._id) {
    cb(true, site);
    return;
  }

  var jobMarker = 'cartularium_' + that._id;

  crontab.load(function (err, crontab) {
    crontab.remove({comment: jobMarker});

    crontab.save(function (err) {
      cb(err, that);
    });
  });
};

siteSchema.methods.inNotifying = function (intervals) {
  if (!this.paidTill)
    return null;

  intervals = applyIntervals(this.paidTill, intervals);
  return (new Date).between(_.min(intervals), this.paidTill);
};

module.exports = mongoose.model('Site', siteSchema);

