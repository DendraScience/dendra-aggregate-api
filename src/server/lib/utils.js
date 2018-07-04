/**
 * Aggregate API utilities and helpers.
 *
 * @author J. Scott Smith
 * @license BSD-2-Clause-FreeBSD
 * @module lib/utils
 */

const crypto = require('crypto')
const random = require('lodash/random')

function asyncHashDigest (data, algorithm = 'sha1', encoding = 'hex') {
  return new Promise((resolve) => {
    setImmediate(() => {
      resolve(crypto.createHash(algorithm).update(data).digest(encoding))
    })
  })
}

function configTimerSeconds ({timerSeconds}) {
  let s = 60

  if (typeof timerSeconds === 'number') {
    s = timerSeconds
  } else if (Array.isArray(timerSeconds) && timerSeconds.length > 1) {
    s = random(timerSeconds[0], timerSeconds[1])
  }

  return s
}

module.exports = {
  asyncHashDigest,
  configTimerSeconds
}
