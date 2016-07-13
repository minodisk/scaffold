const path = require('path')
const webpack = require('webpack')
const nodeExternals = require('webpack-node-externals')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const nodemon = require('nodemon')
const browserSync = require('browser-sync')
const inspector = require('./lib/inspector')

const IS_WATCH = process.env.IS_WATCH === 'true'
const HOST_IP = process.env.HOST_IP
const SSR_PORT = process.env.SSR_PORT
const NODE_DEBUG_PORT = process.env.NODE_DEBUG_PORT
const BROWSER_SYNC_PORT = process.env.BROWSER_SYNC_PORT
const BROWSER_SYNC_CONFIG_PORT = process.env.BROWSER_SYNC_CONFIG_PORT
const INSPECTOR_PORT = process.env.INSPECTOR_PORT

const bundler = webpack([
  {
    watch: IS_WATCH,
    watchOptions: {
      poll: true
    },
    devtool: '#cheap-module-source-map',
    entry: [
      'webpack-hot-middleware/client?path=/assets/hmr',
      './src/client'
    ],
    output: {
      path: path.join(__dirname, '../dist/client'),
      publicPath: '/assets/',
      filename: 'client.js'
    },
    resolve: {
      extensions: [
        '',
        '.js',
        '.ts',
        '.tsx'
      ]
    },
    module: {
      loaders: [
        {
          test: /\.tsx?$/,
          loaders: [
            'react-hot',
            'babel',
            'ts'
          ]
        },
        {
          test: /\.json$/,
          loader: 'json'
        }
      ]
    },
    plugins: [
      new webpack.optimize.OccurenceOrderPlugin(),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin()
    ]
  },
  {
    watch: IS_WATCH,
    watchOptions: {
      poll: true
    },
    devtool: '#eval',
    target: 'node',
    externals: [
      nodeExternals()
    ],
    entry: './src/server',
    output: {
      path: path.join(__dirname, '../dist/server'),
      filename: 'server.js'
    },
    resolve: {
      extensions: [
        '',
        '.js',
        '.ts',
        '.tsx'
      ]
    },
    module: {
      loaders: [
        {
          test: /\.tsx?$/,
          loaders: [
            'babel',
            'ts'
          ]
        },
        {
          test: /\.json$/,
          loader: 'json'
        }
      ]
    }
  }
], (err, stats) => {
  if (err) {
    throw err
  }

  console.log('[webpack]\n%s', stats.toString({
    chunks: false,
    colors: true
  }))

  if (Object.keys(stats.compilation.assets).includes('server.js')) {
    restartSSR()
  }
})

const clientCompiler = bundler.watchings[0].compiler

browserSync({
  host: HOST_IP,
  port: BROWSER_SYNC_PORT,
  proxy: {
    target: `http://localhost:${SSR_PORT}`,
    middleware: [
      webpackDevMiddleware(clientCompiler, {
        noInfo: true,
        publicPath: '/assets/'
      }),
      webpackHotMiddleware(clientCompiler, {
        log: (...args) => {
          console.log.apply(console, ['[HMR]'].concat(args))
        },
        path: '/assets/hmr'
      })
    ]
  },
  ui: {
    port: BROWSER_SYNC_CONFIG_PORT
  }
})

{
  let mon
  function restartSSR () {
    if (mon == null) {
      mon = nodemon({
        colours: true,
        watch: false,
        script: `dist/server/server.js`,
        execMap: {
          js: `node --debug=${NODE_DEBUG_PORT}`
        }
      })
      return
    }
    mon.restart()
  }
}

inspector({
  debugPort: NODE_DEBUG_PORT,
  webPort: INSPECTOR_PORT,
  cli: true
})
