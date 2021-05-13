module.exports = {
  getRequestBody,
  sendError,
  sendResponse,
  methodNotSupported
}

function getRequestBody (req, cb) {
  let data = ''
  req.on('data', chunk => {
    data += chunk
  })
  req.on('end', () => {
    cb(JSON.parse(data))
  })
}

function sendError (err, res) {
  res.setHeader('Content-Type', 'application/json')
  res.writeHead(500)
  res.write(JSON.stringify(err))
  res.end()
}

function sendResponse (data, res) {
  res.setHeader('Content-Type', 'application/json')
  res.writeHead(200)
  res.write(JSON.stringify(data))
  res.end()
}

function methodNotSupported (res) {
  res.setHeader('Content-Type', 'application/json')
  res.writeHead(405)
  res.write(JSON.stringify({
    error: 'Method not supported'
  }))
  res.end()
}
