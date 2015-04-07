# node-prefix

Refer to nodejs configuration prefix and global module install path

## Installation

```shell
$ npm install node-prefix
```

## Example

```javascript
var config = require('node-prefix')

var nodePrefix = config.prefix()
// '/usr/local/lib'

var globalModulePath = config.global('moduleName')
// '/usr/local/lib/node_modules/moduleName'
```

## License

The MIT License (MIT)

Copyright (c) 2014 Masaaki Morishita
