const WebSocket = require('ws')
const http = require('http')

const colours = require('colors/safe')
const os = require('os')
const ifaces = os.networkInterfaces()

const port = 3000

const server = http.createServer()
const wss = new WebSocket.Server({ server })

const online = new Map() // ws -> userData

let user = 0
function toAll (data, but = null) {
  for (const ws of online.keys()) {
    if (ws !== but) {
      ws.send(JSON.stringify(data))
    }
  }
}
wss.on('connection', ws => {
  const id = ++user
  const userData = {
    username: `Individual ${++user}`,
    colour: Math.random() * 0x1000000 | 0,
    usernameSent: false,
    x: 0,
    y: 0,
    id
  }
  online.set(ws, userData)

  ws.on('message', data => {
    const msg = JSON.parse(data)
    if (msg.type === 'message') {
      toAll({ type: 'message', text: msg.text, from: userData.username })
    } else if (msg.type === 'username') {
      userData.username = msg.name
      if (userData.usernameSent) {
        toAll({ type: 'username-change', id, username: userData.username })
      } else {
        userData.usernameSent = true

        ws.send(JSON.stringify({ type: 'message', text: `Welcome ${userData.username}! (only you can see this message)`, from: 'Server' }))
        ws.send(JSON.stringify({
          type: 'intros',
          users: [...online.values()].map(({ id, username, colour, x, y }) => [id, { username, colour, x, y }])
        }))
        toAll({ type: 'message', text: `${userData.username} joined!`, from: 'Server' }, ws)
        toAll({ type: 'hi', id, userData: {
          username: userData.username,
          colour: userData.colour,
          x: userData.x,
          y: userData.y
        } }, ws)
      }
    } else if (msg.type === 'position') {
      userData.x = msg.x
      userData.y = msg.y
      toAll({
        type: 'positions',
        positions: [...online.values()].map(({ id, x, y }) => ({ id, x, y }))
      })
    }
  })

  ws.on('close', () => {
    toAll({ type: 'message', text: `${userData.username} left. :(`, from: 'Server' }, ws)
    toAll({ type: 'bye', id }, ws)
    online.delete(ws)
  })
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
