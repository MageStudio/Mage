const path = require('path');
const MODE = process.env.MODE;
let config = require('./webpack.config');

config.output.filename = 'B.node.js';
config.target = 'node';

module.exports = config;
