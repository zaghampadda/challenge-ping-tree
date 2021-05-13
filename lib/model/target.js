const redis = require('../redis')

module.exports = {
  getAll,
  save,
  handleVisitor,
  getById
}

/**
 * Save the target with appropriate keys
 * @param target
 * @param cb
 */
function save (target, cb) {
  const accept = `targets:${target.id}:accept`
  redis
    .multi()
    .hmset(`targets:${target.id}`, [
      'id', target.id,
      'url', target.url,
      'value', target.value,
      'maxAcceptsPerDay', target.maxAcceptsPerDay,
      'accept', accept
    ])
    .rpush(`${accept}:geoState:in`, target.accept.geoState.in)
    .rpush(`${accept}:hour:in`, target.accept.hour.in)
    .exec((err, replies) => {
      if (err) return cb(err)
      cb(null, target)
    })
}

/**
 * Sort the start in descending based on the value key
 * @param data
 * @returns {*}
 */
function getSortedData (data) {
  return data.sort((a, b) => {
    if (a.value > b.value) {
      return -1
    }
    if (a.value < b.value) {
      return 1
    }
    return 0
  })
}

function handleVisitor (visitor, cb) {
  const visitorDate = new Date(visitor.timestamp)
  const hour = visitorDate.getUTCHours().toString()

  getAll((err, data) => {
    if (err) { return cb(err, null) }
    if (data.length === 0) { return cb(null, { decision: 'reject' }) }
    const sortedData = getSortedData(data)

    getTargetForVisitor(sortedData, visitorDate, 0, function (targetForVisitor) {
      if (targetForVisitor) { return cb(null, targetForVisitor) }

      const matchedTarget = matchTheVisitorCriteria(sortedData, visitor.geoState, hour)

      if (matchedTarget.length > 0) {
        return cb(null, matchedTarget[0])
      } else { return cb(null, { decision: 'reject' }) }
    })
  })
}

/**
 * Get the targets for the matching criteria for visitor
 * @param sortedData
 * @param geoState
 * @param hour
 * @returns {target[]}
 */
function matchTheVisitorCriteria (sortedData, geoState, hour) {
  return sortedData.filter((target) =>
    target.accept.geoState.in.includes(geoState) &&
    target.accept.hour.in.includes(hour)
  )
}

/**
 * Get the target for visitor
 * @param sortedData
 * @param visitorDate
 * @param index
 * @param cb
 */
function getTargetForVisitor (sortedData, visitorDate, index, cb) {
  if (sortedData.length === index) { return undefined }

  const target = sortedData[index]
  const keyForTheDay = `${visitorDate.getUTCDay()}:${visitorDate.getUTCMonth()}:${visitorDate.getUTCFullYear()}`
  const visitorCounterKey = `targets:${target.id}:maxAcceptsPerDay:${keyForTheDay}`

  redis.get(visitorCounterKey, (err, data) => {
    if (err) { throwError(err) }

    const count = data === null ? 1 : parseInt(data) + 1

    if (count <= target.maxAcceptsPerDay) {
      redis.set(visitorCounterKey, count, (err, data) => {
        if (err) { throwError(err) }
        return cb(target)
      })
    } else {
      getTargetForVisitor(sortedData, visitorDate, index, cb)
    }
  })
}

function throwError (err) {
  console.log(err)
  throw Error('unable to get data form redis')
}

/**
 * Get data with nested keys and make the proper response for end user
 * @param id
 * @param cb
 */
function getById (id, cb) {
  const targetId = `targets:${id}`
  getTarget(targetId, cb)
}

function getTarget (targetId, cb) {
  const accept = `${targetId}:accept`
  redis
    .multi()
    .hgetall(targetId)
    .lrange(`${accept}:geoState:in`, 0, -1)
    .lrange(`${accept}:hour:in`, 0, -1)
    .exec((err, replies) => {
      if (err) return cb(err)

      const data = {
        ...replies[0],
        accept: {
          geoState: {
            in: replies[1]
          },
          hour: {
            in: replies[2]
          }
        }
      }
      cb(null, data)
    })
}

/**
 * Get all the available targets
 * @param cb
 */
function getAll (cb) {
  redis.keys('targets:[0-9]', (err, keys) => {
    if (err) return cb(err)
    const targets = []
    if (keys.length === 0) return cb(null, targets)
    keys.forEach((key, index) => {
      getTarget(key, function (err, data) {
        if (err) return cb(err)
        targets.push(data)
        if (index + 1 === keys.length) {
          cb(null, targets)
        }
      })
    })
  })
}
