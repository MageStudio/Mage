var path = require('path')

var prefix = module.exports.prefix = function () {
    return path.resolve(process.execPath, '..', '..', 'lib')
}

module.exports.global = function (moduleName) {
    return prefix() + '/node_modules/' + moduleName
}
