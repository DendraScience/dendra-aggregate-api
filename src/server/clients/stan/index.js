const STAN = require('node-nats-streaming')

module.exports = async (app) => {
  const {logger} = app
  const stan = app.get('clients').stan

  stan.instance = STAN.connect(stan.cluster, stan.client, stan.opts || {})
  stan.instance.on('connect', () => {
    logger.info('NATS Streaming connected')
  })
  stan.instance.on('reconnect', () => {
    logger.info('NATS Streaming reconnected')
  })
  stan.instance.on('error', err => {
    logger.error('NATS Streaming error', err)
  })
}
