const moment = require('moment')
const { configTimerSeconds } = require('../../lib/utils')

const MAX_TIME = Date.UTC(2200, 1, 2)

const TASK_NAME = 'dispatch'

module.exports = function (app) {
  const { logger } = app
  const clients = app.get('clients')
  const tasks = app.get('tasks') || {}

  const config = tasks[TASK_NAME]

  if (!(
    config && config.requestSubject &&
    clients && clients.stan
  )) return

  const { requestSubject } = config
  const { stan } = clients

  const handleError = (err) => {
    logger.error(err)
  }

  const processBuilds = async (now) => {
    const service = app.service('/builds')
    const query = {
      build_at: { $lte: now },
      $or: [
        { expires_at: { $exists: false } },
        // NOTE: NeDB has a problem with this...
        // { expires_at: null },
        { expires_at: { $gt: now } }
      ],
      $sort: {
        build_at: 1 // ASC
      }
    }

    const res = await service.find({ query })

    if (!(res && res.data && res.data.length > 0)) {
      logger.info(`Task [${TASK_NAME}]: No builds found`)
      return
    }

    for (const build of res.data) {
      logger.info(`Task [${TASK_NAME}]: Requesting build ${build._id}`)

      /*
        Prepare outbound message and publish.
       */

      const reqAt = moment()
      const buildInfo = build.build_info = {
        request_subject: requestSubject,
        requested_at: reqAt.toDate()
      }
      const msgStr = JSON.stringify(build)

      await new Promise((resolve, reject) => {
        stan.instance.publish(requestSubject, msgStr, (err, guid) => err ? reject(err) : resolve(guid))
      })

      logger.info(`Task [${TASK_NAME}]: Published request to '${requestSubject}'`)

      /*
        Reschedule if needed, patch build.
       */

      const patchData = {
        build_at: new Date(MAX_TIME),
        build_info: buildInfo
      }

      if (typeof build.build_every === 'string') {
        try {
          patchData.build_at = reqAt.add(...build.build_every.split('_')).toDate()

          logger.error(`Task [${TASK_NAME}]: Rescheduling next build at '${patchData.build_at}'`)
        } catch (err) {
          logger.error(`Task [${TASK_NAME}]: Rescheduling error: ${err.message}`)
        }
      }

      logger.info(`Task [${TASK_NAME}]: Patching build ${build._id}`)

      await service.patch(build._id, patchData)
    }
  }

  const runTask = async () => {
    logger.info(`Task [${TASK_NAME}]: Running...`)

    if (!stan.isConnected) {
      logger.info(`Task [${TASK_NAME}]: NATS Streaming not connected`)
      return
    }

    await processBuilds(new Date())

    // NOTE: Add additional dispatch steps here
  }

  const scheduleTask = () => {
    const timerSeconds = configTimerSeconds(config)

    logger.info(`Task [${TASK_NAME}]: Starting in ${timerSeconds} seconds`)

    config.tid = setTimeout(() => {
      runTask().catch(handleError).then(scheduleTask)
    }, timerSeconds * 1000)
  }

  scheduleTask()
}
