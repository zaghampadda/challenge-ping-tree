const {
  getRequestBody,
  sendError,
  sendResponse,
  methodNotSupported
} = require('./helpers/utils')
const target = require('./model/target')

module.exports = {
  handleTarget,
  getOrUpdateTarget,
  route
}

/**
 * Handle get and create targets
 * @param req
 * @param res
 */

async function handleTarget (req, res, params) {
  switch (req.method) {
    case 'POST':
      getRequestBody(req, (data) => {
        target.save(data, (err, result) => {
          if (err) return sendError(err, res)
          sendResponse(result, res)
        })
      })
      break
    case 'GET':
      target.getAll((err, result) => {
        if (err) return sendError(err, res)
        sendResponse(result, res)
      })
      break
    default:
      methodNotSupported(res)
  }
}

/**
 * Update the the target, Update the target basically will replace the existing key the new value
 * @param req
 * @param res
 * @param options
 */

function getOrUpdateTarget (req, res, options) {
  switch (req.method) {
    case 'POST':
      getRequestBody(req, (data) => {
        target.save(data, (err, result) => {
          if (err) return sendError(err, res)
          sendResponse(result, res)
        })
      })
      break
    case 'GET':
      target.getById(options.params.id, (err, result) => {
        if (err) return sendError(err, res)
        sendResponse(result, res)
      })
      break
    default:
      methodNotSupported(res)
  }
}

/**
 * Return the request status
 * @param req
 * @param res
 * @param options
 */
function route (req, res, options) {
  if (req.method === 'POST') {
    getRequestBody(req, (data) => {
      target.handleVisitor(data, (err, result) => {
        err ? sendError(err, res)
          : sendResponse(result, res)
      })
    })
  } else {
    methodNotSupported(res)
  }
}
