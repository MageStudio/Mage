const path = require('path');

module.exports = {
    entry: 'src/index.js',
    output: {
        path: path.resolve('dist'),
        ilename: 'index_bundle.js'
    },
    module: {
        loaders: [
            { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
            { test: /\.jsx$/, loader: 'babel-loader', exclude: /node_modules/ }
        ]
    }
}