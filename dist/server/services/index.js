"use strict";

const path = require('path');

module.exports = function (app) {
  const names = ['build'];
  names.forEach(name => app.configure(require(path.join(__dirname, name))));
};