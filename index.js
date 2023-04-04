const { createServer } = require('node:http')
const { EventEmitter } = require('node:events')
const qs = require('node:querystring')

process.stdin.on('data', (buff) => {
  const data = String(buff.toString())
  if (data.includes('foo')) {
    TicketFoo.emit('changes', 'Ticket FOO')
  } else if (data.includes('bar')) {
    TicketFoo.emit('changes', 'Ticket FOO')
    TicketMaster.emit('changes', 'Ticket MASTER')
  } else {
    console.log('will NOT emit something')
  }
})

class Ticket extends EventEmitter {
  constructor (name, allowedTokens = ['foo']) {
    super()
    this.name = name
    this.sockets2Broadcast = new Set()
    this.allowedTokens = allowedTokens
    this.on('changes', this.broadcastMessage)
  }

  attachSocket (socket) {
    this.sockets2Broadcast.add(socket)
  }

  broadcastMessage (message) {
    const parsedMessage = `(${this.name}) - ${message || 'no message'}`
    for (const response of this.sockets2Broadcast) {
      if (response.socket.closed) {
        this.sockets2Broadcast.delete(response)
        continue
      }

      writeEvent(response, parsedMessage)
    }
  }
}

const TicketMaster = new Ticket('TicketMaster')
const TicketFoo = new Ticket('TicketFoo')

const server = createServer(rawHandler)

function rawHandler (req, res) {
  const { pathname, query = null } = require('url').parse(req.url)
  if (pathname === '/stream') {
    authHandler(req, res)
  } else if (pathname === '/emit-foo') {
    TicketFoo.emit('changes', 'Ticket FOO')
    res.end('Ok')
  } else if (pathname === '/emit-bar') {
    TicketFoo.emit('changes', 'Ticket FOO')
    TicketMaster.emit('changes', 'Ticket MASTER')
    res.end('Ok')
  } else {
    res.setHeader('Content-Type', 'text/plain')
    res.write('Good bye weekend')
    res.end()
  }
}

function authHandler (req, res) {
  const url = require('url').parse(req.url)
  const query = qs.parse(url.query)
  const canPass = query && query.token

  res.setHeader('Content-Type', 'text/event-stream')

  if (canPass) subscribeToChannels(req, res)

  return canPass
}

function subscribeToChannels (req, res) {
  const url = require('url').parse(req.url)
  const { token } = qs.parse(url.query)
  if (token === 'foo') {
    TicketFoo.attachSocket(res)
  } else if (token === 'bar' || token === 'baz') {
    TicketFoo.attachSocket(res)
    TicketMaster.attachSocket(res)
  } else {
    console.log('Invalid token')
  }
}

function writeErrorEvent (res) {
  res.setHeader('Content-Type', 'text/plain')
  res.end('Closing connection')
}

function writeEvent (res, message) {
  res.write(`data: ${message}`)
  res.write('\n')
  res.write('\n')
}


server.listen(process.env.PORT || 3000,
  () => console.log(`The server is listening in port ${process.env.PORT || 3000}`))
