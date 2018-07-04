'use strict';

const path = require('path');

module.exports = function (app) {
  const names = ['aggregate'];

  names.forEach(name => app.configure(require(path.join(__dirname, name))));
};