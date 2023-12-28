const path = require('path');
const BundleTracker = require('webpack-bundle-tracker');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { VueLoaderPlugin } = require('vue-loader');

module.exports = {
  target: 'web',
  entry: {
    main: path.resolve(__dirname, '../frontend/src/main.ts'),
  },
  output: {
    path: path.resolve(__dirname, './bundles'),
    publicPath: '/static/bundles/',
  },
  plugins: [
    new VueLoaderPlugin(),
    new BundleTracker({
      path: path.resolve(path.join(__dirname, '../frontend/')),
      filename: 'webpack-stats.json',
    }),
    new MiniCssExtractPlugin({ filename: '[name].css' }),
  ],
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: 'vue-loader',
      },
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          appendTsSuffixTo: [/\.vue$/],
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js', '.vue', '.json'],
    alias: {
      vue: '@vue/runtime-dom',
    },
  },
};
