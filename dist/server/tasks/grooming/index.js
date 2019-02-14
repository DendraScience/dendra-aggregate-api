"use strict";

const {
  configTimerSeconds
} = require('../../lib/utils');

const TASK_NAME = 'grooming';

module.exports = function (app) {
  const {
    logger
  } = app;
  const databases = app.get('databases');
  const tasks = app.get('tasks') || {};
  const config = tasks[TASK_NAME];
  if (!(config && databases)) return;
  const docLimit = typeof config.docLimit === 'number' ? config.docLimit : 20;

  const handleError = err => {
    logger.error(err);
  };

  const processBuilds = async now => {
    const service = app.service('/builds');
    const query = {
      expires_at: {
        $lte: now
      },
      $limit: docLimit,
      $sort: {
        expires_at: 1 // ASC

      }
    };
    const res = await service.find({
      query
    });

    if (!(res && res.data && res.data.length > 0)) {
      logger.info(`Task [${TASK_NAME}]: No builds found`);
      return;
    }

    for (let build of res.data) {
      logger.info(`Task [${TASK_NAME}]: Removing build ${build._id}`);
      await service.remove(build._id);
    } // DEPRECATED: Now using autocompactionInterval in config
    // // Compact database if builds were removed
    // const {nedb} = databases
    // if (nedb && nedb.db) {
    //   logger.info(`Task [${TASK_NAME}]: Queuing builds compaction`)
    //   nedb.db.builds.persistence.compactDatafile()
    // }

  };

  const runTask = async () => {
    logger.info(`Task [${TASK_NAME}]: Running...`);
    await processBuilds(new Date()); // NOTE: Add additional grooming steps here
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