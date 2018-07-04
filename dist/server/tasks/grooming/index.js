'use strict';

const { configTimerSeconds } = require('../../lib/utils');

const TASK_NAME = 'grooming';

module.exports = function (app) {
  const { logger } = app;
  const databases = app.get('databases');
  const tasks = app.get('tasks') || {};

  const config = tasks[TASK_NAME];

  if (!(config && databases)) return;

  const docLimit = typeof config.docLimit === 'number' ? config.docLimit : 20;

  const handleError = err => {
    logger.error(err);
  };

  const processAggregates = async now => {
    const service = app.service('/aggregates');
    const query = {
      expires_at: { $lte: now },
      $limit: docLimit,
      $sort: {
        expires_at: 1 // ASC
      }
    };

    const res = await service.find({ query });

    if (!(res && res.data && res.data.length > 0)) {
      logger.info(`Task [${TASK_NAME}]: No aggregates found`);
      return;
    }

    for (let aggregate of res.data) {
      logger.info(`Task [${TASK_NAME}]: Removing aggregate ${aggregate._id}`);
      await service.remove(aggregate._id);
    }

    // DEPRECATED: Now using autocompactionInterval in config
    // // Compact database if aggregates were removed
    // const {nedb} = databases
    // if (nedb && nedb.db) {
    //   logger.info(`Task [${TASK_NAME}]: Queuing aggregates compaction`)
    //   nedb.db.aggregates.persistence.compactDatafile()
    // }
  };

  const runTask = async () => {
    logger.info(`Task [${TASK_NAME}]: Running...`);

    await processAggregates(new Date());

    // NOTE: Add additional grooming steps here
  };

  const scheduleTask = () => {
    const timerSeconds = configTimerSeconds(config);

    logger.info(`Task [${TASK_NAME}]: Starting in ${timerSeconds} seconds`);

    config.tid = setTimeout(() => {
      runTask().catch(handleError).then(scheduleTask);
    }, timerSeconds * 1000);
  };

  scheduleTask();
};