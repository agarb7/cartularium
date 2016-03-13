'use strict';

var _ = require('underscore');
var s = require('underscore.string');
var whois = require('whois');

var ServerInfo = require('./server-info');

function parse(server, data) {
  var result = {};
  var serverInfo = new ServerInfo(server);

  _.each(s.lines(data), function (line) {
    var pos = line.indexOf(':');
    if (pos === -1)
      return;

    var key = line.substr(0, pos).trim();
    var knownKey = serverInfo.key(key);

    if (knownKey) {
      var value = line.substr(pos + 1).trim();
      result[knownKey] = serverInfo.value(knownKey, value);
    }
  });

  return result;
}

module.exports = {
  lookup: function (addr, options, done) {
    if (_.isUndefined(done) && _.isFunction(options)) {
      done = options;
      options = {};
    }

    options.verbose = true;

    whois.lookup(addr, options, function (err, data) {
      if (err)
        done(err, null);

      var obj = _.last(data);

      var result = parse(obj.server.host, obj.data);
      result.raw = obj.data;

      done(err, result);
    });
  }
};
