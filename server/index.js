const WebSocket = require('ws')
const http = require('http')

const colours = require('colors/safe')
const os = require('os')
const ifaces = os.networkInterfaces()

const port = 3000

const server = http.createServer()
const wss = new WebSocket.Server({ server })

wss.on('connection', ws => {
  ws.on('message', msg => {
    //
  })

  ws.send(JSON.stringify({ type: 'message', text: 'Hello!', from: 'Server' }))
})

server.listen(port, () => {
  console.log(colours.underline.cyan('WebSocket available at:'))
  // based on https://github.com/http-party/http-server/blob/master/bin/http-server#L154
  for (const iface of Object.values(ifaces)) {
    for (const details of iface) {
      if (details.family === 'IPv4') {
        console.log(colours.blue(`  ws://${details.address}:${port}/`))
      }
    }
  }
  console.log(colours.blue(`  ws://localhost:${port}/\n`))
})
