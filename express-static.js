const express = require('express')
const cors = require('cors')
const app = express()

const colours = require('colors/safe')
const os = require('os')
const ifaces = os.networkInterfaces()

const port = 8080

app.use(express.static('client'))
app.use(cors())

app.listen(port, () => {
  console.log(colours.underline.yellow('Client available at:'))
  // based on https://github.com/http-party/http-server/blob/master/bin/http-server#L154
  for (const iface of Object.values(ifaces)) {
    for (const details of iface) {
      if (details.family === 'IPv4') {
        console.log(colours.green(`  http://${details.address}:${port}/`))
      }
    }
  }
  console.log(colours.green(`  http://localhost:${port}/\n`))
})
