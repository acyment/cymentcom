const { merge } = require('webpack-merge');
const commonConfig = require('./common.config');
const Dotenv = require('dotenv-webpack');
const path = require('path');
const { rspack } = require('@rspack/core');

module.exports = merge(commonConfig, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    host: '0.0.0.0',
    port: 3000,
    historyApiFallback: {
      disableDotRule: true,
      index: '/',
    },
    allowedHosts: 'all',
    proxy: [
      {
        context: ['/'],
        target: 'http://django:8000',
      },
    ],
    client: {
      overlay: {
        errors: true,
        warnings: false,
        runtimeErrors: true,
      },
      webSocketURL: 'wss://my-dev.local/ws',
    },
    // We need hot=false (Disable HMR) to set liveReload=true
    hot: false,
    liveReload: true,
  },
  plugins: [
    new Dotenv({
      path: path.resolve(__dirname, '../.envs/.local/.webpack'),
    }),
    new rspack.DefinePlugin({ 'process.env.NODE_ENV': '"development"' }),
  ],
});

console.log('Webpack is using directory:', __dirname);
