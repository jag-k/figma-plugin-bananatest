const HtmlWebpackInlineSourcePlugin = require('@effortlessmotion/html-webpack-inline-source-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
const webpack = require('webpack')

module.exports = (env, argv) => ({
  mode: argv.mode === 'production' ? 'production' : 'development',

  devtool: argv.mode === 'production' ? false : 'inline-source-map',

  entry: {
    ui: './src/ui/ui.ts', // The entry point for your UI code
    code: './src/main/code.ts', // The entry point for your plugin code
  },

  module: {
    rules: [

      // Enables including CSS by doing "import './file.css'" in your TypeScript code
      {
        test: /\.s?css$/,
        use: [
          {loader: 'style-loader'},
          {loader: 'css-loader'},
          {loader: 'sass-loader'}
        ]
      },

      // Converts TypeScript code to JavaScript
      {test: /\.tsx?$/, use: {
          loader: 'ts-loader',
          options: {
              transpileOnly: true,
          }

        }, exclude: /node_modules/},
    ],
  },

  // Webpack tries these extensions for you if you omit the extension like "import './file'"
  resolve: {extensions: ['.tsx', '.ts', '.jsx', '.js']},

  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'), // Compile into a folder called "dist"
  },

  // Tells Webpack to generate "ui.html" and to inline "ui.ts" into it
  plugins: [
    new webpack.DefinePlugin({
      'global': {} // Fix missing symbol error when running in developer VM
    }),
    new HtmlWebpackPlugin({
      template: './src/ui/ui.html',
      filename: 'ui.html',
      inlineSource: '.(js|css)$',
      chunks: ['ui'],
      inject: 'body',
      minify: argv.mode === 'production',
    }),
    new HtmlWebpackInlineSourcePlugin(),
  ],
})
