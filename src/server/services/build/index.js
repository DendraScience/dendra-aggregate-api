const service = require('feathers-nedb')
const hooks = require('./hooks')

module.exports = function (app) {
  const databases = app.get('databases')

  if (!databases.nedb) return

  const { db, paginate } = databases.nedb

  app.use('/builds', service({
    Model: db.builds,
    paginate
  }))

  // Get the wrapped service object, bind hooks
  const buildService = app.service('/builds')

  buildService.hooks(hooks)
}
