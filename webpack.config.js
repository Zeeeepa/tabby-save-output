const path = require('path')

module.exports = {
  target: 'node',
  entry: 'src/index.ts',
  mode: 'development',
  devtool: 'source-map',
  optimization: {
    minimize: false
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    pathinfo: true,
    libraryTarget: 'umd',
  },
  resolve: {
    modules: ['.', 'src', 'node_modules'].map(x => path.join(__dirname, x)),
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          configFile: path.resolve(__dirname, 'tsconfig.json'),
        }
      },
      { test: /\.scss$/, use: ['to-string-loader', 'css-loader', 'sass-loader'] },
      { test: /\.pug$/, use: ['apply-loader', 'pug-loader'] },
    ]
  },
  externals: [
    'fs',
    'path',
    'tabby-core',
    'tabby-terminal',
    '@angular/core',
    '@angular/forms',
    /^rxjs/,
  ],
}
