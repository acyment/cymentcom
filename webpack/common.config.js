const path = require('path');
const BundleTracker = require('webpack-bundle-tracker');
const { rspack } = require('@rspack/core');

module.exports = {
  target: 'web',
  context: path.join(__dirname, '../'),
  entry: {
    main: path.resolve(__dirname, '../frontend/src/index.js'),
  },
  output: {
    path: path.resolve(__dirname, '../frontend/public/webpack_bundles/'),
    publicPath: '/frontend/webpack_bundles/',
    filename: 'js/[name]-[fullhash].js',
    chunkFilename: 'js/[name]-[hash].js',
  },
  plugins: [
    new BundleTracker({
      path: path.resolve(path.join(__dirname, '../')),
      filename: 'webpack-stats.json',
    }),
    new rspack.CssExtractRspackPlugin({
      filename: 'css/[name].[contenthash].css',
    }),
  ],
  module: {
    rules: [
      // we pass the output from babel loader to react-hot loader
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/, // IMPORTANT: Keep excluding node_modules
        loader: 'swc-loader',
      },
      {
        test: /\.s?css$/i,
        use: [
          rspack.CssExtractRspackPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: ['postcss-preset-env', 'autoprefixer', 'pixrem'],
              },
            },
          },
          'sass-loader',
        ],
        type: 'javascript/auto',
      },
      {
        test: /\.(ts|tsx)$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  optimization: {
    realContentHash: true,
  },
};
