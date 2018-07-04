'use strict';

const Datastore = require('nedb');

const fs = require('fs');
const path = require('path');
const util = require('util');

const mkdir = util.promisify(fs.mkdir);

module.exports = async app => {
  const nedb = app.get('databases').nedb;
  const nedbPath = path.resolve(nedb.path);
  const autocompactionInterval = nedb.autocompactionInterval | 0;

  try {
    await mkdir(nedbPath);
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }

  const filename = path.join(nedbPath, 'aggregates.db');
  const aggregates = new Datastore({
    filename,
    autoload: true
  });

  if (autocompactionInterval > 0) {
    aggregates.persistence.setAutocompactionInterval(autocompactionInterval);
  }
  aggregates.on('compaction.done', () => {
    app.logger.info(`Compacted ${filename}`);
  });

  nedb.db = {
    aggregates
  };
};