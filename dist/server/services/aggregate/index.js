'use strict';

const service = require('feathers-nedb');
const hooks = require('./hooks');

module.exports = function (app) {
  const databases = app.get('databases');

  if (!databases.nedb) return;

  const { db, paginate } = databases.nedb;

  app.use('/aggregates', service({
    Model: db.aggregates,
    paginate
  }));

  // Get the wrapped service object, bind hooks
  const aggregateService = app.service('/aggregates');

  aggregateService.hooks(hooks);
};