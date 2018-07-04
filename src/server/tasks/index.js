const path = require('path')

module.exports = function (app) {
  const names = [
    'dispatch',
    'grooming'
  ]

  names.forEach(name => app.configure(require(path.join(__dirname, name))))
}
