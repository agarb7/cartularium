'use strict';

require('datejs');
var _ = require('underscore');
var s = require('underscore.string');

//var parseDateRu = _.partial(parseDate, _, 'ru-RU');
var parseDateEn = _.partial(parseDate, _, 'en-US');

var guessCreatedHash = toHash([
  'creationdate',
  'created'
]);

var guessPaidTillHash = toHash([
  'registrarregistrationexpirationdate',
  'registryexpirydate',
  'paidtill'
]);

var guessFreeDateHash = toHash([
  'freedate'
]);

function parseDate(date, lang) {
  var oldLang = Date.i18n.currentLanguage();
  Date.i18n.setLanguage(lang);
  var result = Date.parse(date);
  Date.i18n.setLanguage(oldLang);

  return result;
}

function normilize(key) {
  return key.toLowerCase().replace(/[^a-z]/g, '');
}

function toHash(array) {
  var hash = {};

  _.each(array, function (item) {
    hash[item] = true;
  });

  return hash;
}

function guess(key, hash) {
  return hash[normilize(key)] === true;
}

var servers = {
  'whois.tcinet.ru': {
    key: {
      'created': 'created',
      'paid-till': 'paidTill',
      'free-date': 'freeDate'
    }
  },

  '': {
    key: function (key) {
      switch (true) {
        case guess(key, guessCreatedHash):
          return 'created';
        case guess(key, guessFreeDateHash):
          return 'paidTill';
        case guess(key, guessPaidTillHash):
          return 'freeDate'
      }
    },
    value: {
      'created': parseDateEn,
      'paidTill': parseDateEn,
      'freeDate': parseDateEn
    }
  }

};

function ServerInfo(server) {
  this._info = _.defaults(servers[server] || {}, servers['']);
}

ServerInfo.prototype.key = function (key) {
  var infoKey = this._info.key;

  if (_.isFunction(infoKey))
    return infoKey(key);

  return infoKey[key];
};

ServerInfo.prototype.value = function (key, value) {
  var infoValue = this._info.value[key];

  return infoValue
    ? infoValue(value)
    : undefined;
};

module.exports = ServerInfo;

