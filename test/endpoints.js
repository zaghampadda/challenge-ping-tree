process.env.NODE_ENV = 'test'

const test = require('ava')
const servertest = require('servertest')

const server = require('../lib/server')

test.serial.cb('healthcheck', function (t) {
  const url = '/health'
  servertest(server(), url, { encoding: 'json' }, function (err, res) {
    t.falsy(err, 'no error')

    t.is(res.statusCode, 200, 'correct statusCode')
    t.is(res.body.status, 'OK', 'status is ok')
    t.end()
  })
})

test.serial.cb('create target', function (t) {
  const url = '/api/target'
  servertest(server(), url, { method: 'POST', encoding: 'json' }, function (err, res) {
    t.falsy(err, 'no error')

    t.is(res.statusCode, 200, 'correct statusCode')
    // t.is(res.body.status, 'OK', 'status is ok')
    t.end()
  })
})

test.serial.cb('get the target', function (t) {
  const url = '/api/target/:id'
  servertest(server(), url, { encoding: 'json' }, function (err, res) {
    t.falsy(err, 'no error')

    t.is(res.statusCode, 200, 'correct statusCode')
    // t.is(res.body.status, 'OK', 'status is ok')
    t.end()
  })
})

test.serial.cb('get the target', function (t) {
  const url = '/api/target/:id'
  servertest(server(), url, { encoding: 'json' }, function (err, res) {
    t.falsy(err, 'no error')

    t.is(res.statusCode, 200, 'correct statusCode')
    // t.is(res.body.status, 'OK', 'status is ok')
    t.end()
  })
})

test.serial.cb('get all targets', function (t) {
  const url = '/api/targets'
  servertest(server(), url, { encoding: 'json' }, function (err, res) {
    t.falsy(err, 'no error')

    t.is(res.statusCode, 200, 'correct statusCode')
    // t.is(res.body.status, 'OK', 'status is ok')
    t.end()
  })
})
