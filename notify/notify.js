'use strict';

var path = require('path');
var appDir = path.dirname(require.main.filename);

var querystring = require('querystring');

var _ = require('underscore');
var nodemailer = require('nodemailer');
var request = require('request');

var config = require(appDir + '/config');

var transporter = nodemailer.createTransport(config.smtp);

function daysTo(date) {
  var ms = date - (new Date);
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function daysSuffix(days) {
  return days % 10 === 1
    ? 'день'
    : 'дней'
}

module.exports.sendEmail = function (site, cb) {
  var textTmp = _.template('Через <%= days %> <%= suffix %> <%= date %> истекает оплата домена <%= name %>.\nОтвет сервиса whois:\n\n<%= whois %>');

  var textData = {
    name: site.name,
    date: site.paidTill.toString('d.M.yyyy'),
    whois: site.whois,
    days: daysTo(site.paidTill),
    suffix: daysSuffix(this.days)
  };

  var mailOptions = {
    to: config.notifying.email,
    subject: 'Освобождается домен ' + site.name,
    text: textTmp(textData)
  };

  transporter.sendMail(mailOptions, cb);
};

module.exports.sendSlackMessage = function (site, cb) {
  var textTmp = _.template('через <%= days %> <%= suffix %> истекает оплата домена <%= name %>');
  var textData = {
    name: site.name,
    days: daysTo(site.paidTill),
    suffix: daysSuffix(this.days)
  };

  var query = {
    token: config.slack.token,
    channel: config.notifying.slackChannel,
    text: textTmp(textData),
    pretty: 1
  };

  var url = 'https://slack.com/api/chat.postMessage?' + querystring.stringify(query);

  request.get(url, cb);
};
