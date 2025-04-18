const { mergeWithCustomize } = require('webpack-merge');
const commonConfig = require('./common.config');
const Dotenv = require('dotenv-webpack');
const path = require('path');
const webpack = require('webpack');
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');

// This variable should mirror the one from config/settings/production.py
const staticUrl = '/static/';
const smp = new SpeedMeasurePlugin();

module.exports = smp.wrap(
  mergeWithCustomize(commonConfig, {
    // Define custom merge strategies
    customMerge: (key) => {
      if (key === 'plugins') {
        // For the 'plugins' array, concatenate the arrays.
        // 'unique' helps prevent duplicates if the same plugin type exists in both configs,
        // although in this case, the plugins are distinct.
        // 'append' strategy means prod plugins come after common plugins.
        return unique('plugins', [], (a, b) => [...a, ...b]); // Simple concatenation
      }
      // For all other keys, use the default merge behavior
      return undefined;
    },
  })(commonConfig, {
    // Apply the custom merge to commonConfig and the prod-specific config
    // Prod-specific config starts here
    mode: 'production',
    devtool: 'source-map',
    bail: true,
    output: {
      publicPath: `${staticUrl}webpack_bundles/`,
    },
    // Only list the PRODUCTION-SPECIFIC plugins here
    plugins: [
      new Dotenv({
        path: path.resolve(__dirname, '../.envs/.production/.webpack'),
      }),
      new webpack.DefinePlugin({ 'process.env.NODE_ENV': '"production"' }),
    ],
    // No need to repeat mode, devtool, bail, output etc. if they are correctly merged
  }),
);
