module.exports = async (app) => {
  const clients = app.get('clients')

  if (clients.stan) await require('./stan')(app)
}
