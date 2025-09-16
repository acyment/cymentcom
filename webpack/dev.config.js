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
        changeOrigin: true, // Present django as origin to avoid ALLOWED_HOSTS issues
        // xfwd helps Django see the original client IP when proxied
        xfwd: true,
      },
    ],
    client: {
      overlay: {
        errors: true,
        warnings: false,
        runtimeErrors: true,
      },
      // Allow LAN devices to connect without hard-coding a hostname
      // Rspack will infer ws://<current-host>:<dev-port>/ws
      webSocketURL: 'auto://0.0.0.0:0/ws',
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
