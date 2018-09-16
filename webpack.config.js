const path = require('path');
const MODE = process.env.MODE;

const config = {
    entry: {
        'mage.lib': './src/index.lib.js',
        'mage': './src/index.js',
        'mage.core': './src/index.core.js';
    },
    output: {
        library: 'M',
        libraryTarget: 'umd',
        path: path.resolve(__dirname, 'build', 'lib'),
        filename: '[name].js',
        umdNamedDefine: true
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                include: [
                    path.resolve(__dirname, 'src')
                ],
                loader: 'babel-loader',
                options: {
                    presets: ['es2015', 'stage-0']
                }
            }
        ]
    },
    resolve: {
        modules: [
            'node_modules',
            path.resolve(__dirname, 'src')
        ]
    },
    target: 'web'
};

module.exports = config;
