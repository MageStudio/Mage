const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'development',
    cache:   false,
    devtool: false,
    entry: {
        'app': './src/index.js'
    },
    output: {
        path: path.resolve(__dirname, 'public'),
        filename: 'app.js',
    },
    module:  {
        rules: [{
            test: /\.js$/,
            loader: 'babel-loader',
            exclude: [/node_modules/, /static/]
        }]
    },
    resolve: {
        modules: [
            'static',
            'src',
            'node_modules'
        ]
    },
    performance: {
        hints: false,
        maxAssetSize: 1000000,
        maxEntrypointSize: 800000,
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: './index.html', to: 'index.html' },
                { from: 'assets', to: 'assets', noErrorOnMissing: true },
                { from: 'css', to: 'css', noErrorOnMissing: true },
                { from: 'js', to: 'js', noErrorOnMissing: true }
            ]
        })
    ],
};