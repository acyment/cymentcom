const { mergeWithCustomize, unique } = require('webpack-merge');
const commonConfig = require('./common.config');
const Dotenv = require('dotenv-webpack');
const path = require('path');
const { rspack } = require('@rspack/core');
const BundleAnalyzerPlugin =
  require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

// This variable should mirror the one from config/settings/production.py
const staticUrl = '/static/';

// 1. Create the customized merge function first
const mergeProd = mergeWithCustomize({
  // Define custom merge strategies inside this object
  customizeArray: unique(
    'plugins', // Target the 'plugins' array
    ['CssExtractRspackPlugin', 'BundleTracker', 'DefinePlugin', 'Dotenv'], // Identify plugins by constructor name or a unique property
    (plugin) => plugin.constructor && plugin.constructor.name, // Use constructor name for uniqueness check
  ),
  // Use default strategies for other keys (like 'module.rules')
  // customizeObject: (a, b, key) => { /* custom object merging if needed */ }
});

// 2. Now use the customized merge function (mergeProd)
module.exports = mergeProd(
  // Use the mergeProd function here
  commonConfig, // First config (base)
  {
    // Second config (production specifics)
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
      new rspack.DefinePlugin({ 'process.env.NODE_ENV': '"production"' }),
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
      }),
    ],
  },
); // End of mergeProd call // End of smp.wrap
