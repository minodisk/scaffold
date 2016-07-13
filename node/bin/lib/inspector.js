var DebugServer = require('../../node_modules/node-inspector/lib/debug-server').DebugServer,
  fs = require('fs'),
  path = require('path'),
  Config = require('../../node_modules/node-inspector/lib/config'),
  packageJson = require('../../node_modules/node-inspector/package.json')
let config

module.exports = function start (c) {
  config = Object.assign({
    cli: false,
    debugBrk: false,
    nodejs: [],
    sslCert: '',
    sslKey: '',
    stackTraceLimit: 50,
    hidden: [],
    pluginPath: '',
    plugins: false,
    inject: true,
    preload: false,
    saveLiveEdit: false,
    debugPort: 5858,
    webHost: '0.0.0.0',
    webPort: '8080',
    version: false,
    help: false
  }, c)

  if (config.help) {
    config.showHelp()
    return
  }

  if (config.version) {
    config.showVersion()
    return
  }

  process.on('SIGINT', function () {
    debugServer.close()
  })

  console.log('[inspector] v%s', packageJson.version)

  var debugServer = new DebugServer()
  debugServer.on('error', onError)
  debugServer.on('listening', onListening)
  debugServer.on('close', function () {
    console.log('[inspector] closed')
  })
  debugServer.start(config)
}

function onError (err) {
  console.error(
    '[inspector] Cannot start the server at %s:%s. Error: %s.',
    config.webHost,
    config.webPort,
    err.message || err
  )

  if (err.code === 'EADDRINUSE') {
    console.error(
      '[inspector] There is another process already listening at this address.'
    )
  }

  notifyParentProcess({
    event: 'SERVER.ERROR',
    error: err
  })
}

function onListening () {
  var address = this.address()
  console.log('[inspector] Visit %s to start debugging.', address.url)

  notifyParentProcess({
    event: 'SERVER.LISTENING',
    address: address
  })
}

function notifyParentProcess (msg) {
  if (!process.send) return

  process.send(msg)
}
