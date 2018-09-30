(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("M", [], factory);
	else if(typeof exports === 'object')
		exports["M"] = factory();
	else
		root["M"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/audio/AudioEngine.js":
/*!**********************************!*\
  !*** ./src/audio/AudioEngine.js ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n\tvalue: true\n});\n\nvar _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nvar AudioEngine = function () {\n\tfunction AudioEngine(assetsManager) {\n\t\t_classCallCheck(this, AudioEngine);\n\n\t\tthis.DELAY_FACTOR = 0.02;\n\t\tthis.DELAY_STEP = 1; //millis\n\t\tthis.DELAY_MIN_VALUE = 0.2;\n\t\tthis.DELAY_NORMAL_VALUE = 40;\n\t\tthis.VOLUME = 80;\n\t\tthis._volume = 80;\n\n\t\tthis.soundPath = \"js/core/sound/\";\n\t\tthis.soundModules = [\"js/core/audio/beat\", //parent\n\t\t\"js/core/audio/sound\", \"js/core/audio/ambientSound\"];\n\n\t\tthis.numSound = 0;\n\t\tthis.soundLoaded = 0;\n\n\t\tthis.assetsManager = assetsManager;\n\t}\n\n\t_createClass(AudioEngine, [{\n\t\tkey: \"load\",\n\t\tvalue: function load() {\n\t\t\tthis.map = {};\n\t\t\tthis.sounds = [];\n\n\t\t\tthis.AudioContext = window.AudioContext || window.webkitAudioContext || null;\n\n\t\t\tif (this.AudioContext) {\n\t\t\t\t//creating a new audio context if it's available.\n\t\t\t\tthis.context = new this.AudioContext();\n\t\t\t\t//creating a gain node to control volume\n\t\t\t\tthis.volume = this.context.createGain();\n\t\t\t\tthis.volume.gain.value = this.VOLUME;\n\t\t\t\t//connecting volume node to context destination\n\t\t\t\tthis.volume.connect(this.context.destination);\n\t\t\t} else {\n\t\t\t\tconsole.error(\"No Audio Context available, sorry.\");\n\t\t\t}\n\n\t\t\tfor (var audio in Assets.Audio) {\n\t\t\t\tthis.numSound++;\n\t\t\t\tthis.loadSingleFile(audio, Assets.Audio[audio]);\n\t\t\t}\n\n\t\t\tif (this.numSound == 0) {\n\t\t\t\tthis.assetsManager.completed.sound = true;\n\t\t\t}\n\t\t}\n\t}, {\n\t\tkey: \"get\",\n\t\tvalue: function get(id) {\n\t\t\t//returning stored buffer;\n\t\t\treturn M.audioEngine.map[id] || false;\n\t\t}\n\t}, {\n\t\tkey: \"loadSingleFile\",\n\t\tvalue: function loadSingleFile(id, path) {\n\t\t\tvar _this = this;\n\n\t\t\t// Load a sound file using an ArrayBuffer XMLHttpRequest.\n\t\t\tvar request = new XMLHttpRequest();\n\t\t\trequest.open(\"GET\", path, true);\n\t\t\trequest.responseType = \"arraybuffer\";\n\t\t\trequest.onload = function (e) {\n\t\t\t\t_this.context.decodeAudioData(_this.response, function (buffer) {\n\t\t\t\t\t_this.map[id] = buffer;\n\t\t\t\t\t_this.soundLoaded++;\n\t\t\t\t\t_this.checkLoad();\n\t\t\t\t}, function () {\n\t\t\t\t\t_this.map.put[id] = null;\n\t\t\t\t\t_this.soundLoaded++;\n\t\t\t\t\tconsole.error(\"Decoding the audio buffer failed\");\n\t\t\t\t});\n\t\t\t};\n\t\t\trequest.send();\n\t\t}\n\t}, {\n\t\tkey: \"checkLoad\",\n\t\tvalue: function checkLoad() {\n\t\t\tif (this.soundLoaded == this.numSound) {\n\t\t\t\tthis.assetsManager.completed.sound = true;\n\t\t\t}\n\t\t}\n\t}, {\n\t\tkey: \"add\",\n\t\tvalue: function add(sound) {\n\t\t\tthis.sounds.push(sound);\n\t\t}\n\t}, {\n\t\tkey: \"update\",\n\t\tvalue: function update() {\n\t\t\tvar start = new Date();\n\t\t\tfor (var index in this.sounds) {\n\t\t\t\tvar sound = this.sounds[index];\n\t\t\t\tsound.update(app.clock.getDelta());\n\n\t\t\t\t//now handling listener\n\t\t\t\tapp.camera.object.updateMatrixWorld();\n\t\t\t\tvar p = new THREE.Vector3();\n\t\t\t\tp.setFromMatrixPosition(app.camera.object.matrixWorld);\n\n\t\t\t\t//setting audio engine context listener position on camera position\n\t\t\t\tthis.context.listener.setPosition(p.x, p.y, p.z);\n\n\t\t\t\t//this is to add up and down vector to our camera\n\t\t\t\t// The camera's world matrix is named \"matrix\".\n\t\t\t\tvar m = app.camera.object.matrix;\n\n\t\t\t\tmx = m.elements[12], my = m.elements[13], mz = m.elements[14];\n\t\t\t\tm.elements[12] = m.elements[13] = m.elements[14] = 0;\n\n\t\t\t\t// Multiply the orientation vector by the world matrix of the camera.\n\t\t\t\tvar vec = new THREE.Vector3(0, 0, 1);\n\t\t\t\tvec.applyProjection(m);\n\t\t\t\tvec.normalize();\n\n\t\t\t\t// Multiply the up vector by the world matrix.\n\t\t\t\tvar up = new THREE.Vector3(0, -1, 0);\n\t\t\t\tup.applyProjection(m);\n\t\t\t\tup.normalize();\n\n\t\t\t\t// Set the orientation and the up-vector for the listener.\n\t\t\t\tthis.context.listener.setOrientation(vec.x, vec.y, vec.z, up.x, up.y, up.z);\n\n\t\t\t\tm.elements[12] = mx;\n\t\t\t\tm.elements[13] = my;\n\t\t\t\tm.elements[14] = mz;\n\n\t\t\t\tif (+new Date() - start > 50) return;\n\t\t\t}\n\t\t}\n\t}, {\n\t\tkey: \"VOLUME\",\n\t\tget: function get() {\n\t\t\tif (this._volume) {\n\t\t\t\treturn this._volume;\n\t\t\t}\n\t\t},\n\t\tset: function set(value) {\n\t\t\tthis._volume = value;\n\t\t\tthis.volume.gain.value = this._volume;\n\t\t}\n\t}]);\n\n\treturn AudioEngine;\n}();\n\nexports.default = AudioEngine;\n\n//# sourceURL=webpack://M/./src/audio/AudioEngine.js?");

/***/ }),

/***/ "./src/base/AssetsManager.js":
/*!***********************************!*\
  !*** ./src/base/AssetsManager.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n\tvalue: true\n});\n\nvar _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();\n\nvar _AudioEngine = __webpack_require__(/*! ../audio/AudioEngine */ \"./src/audio/AudioEngine.js\");\n\nvar _AudioEngine2 = _interopRequireDefault(_AudioEngine);\n\nvar _VideoEngine = __webpack_require__(/*! ../video/VideoEngine */ \"./src/video/VideoEngine.js\");\n\nvar _VideoEngine2 = _interopRequireDefault(_VideoEngine);\n\nvar _ImagesEngine = __webpack_require__(/*! ../images/ImagesEngine */ \"./src/images/ImagesEngine.js\");\n\nvar _ImagesEngine2 = _interopRequireDefault(_ImagesEngine);\n\nvar _ModelsEngine = __webpack_require__(/*! ../models/ModelsEngine */ \"./src/models/ModelsEngine.js\");\n\nvar _ModelsEngine2 = _interopRequireDefault(_ModelsEngine);\n\nvar _ShadersEngine = __webpack_require__(/*! ../fx/shaders/ShadersEngine */ \"./src/fx/shaders/ShadersEngine.js\");\n\nvar _ShadersEngine2 = _interopRequireDefault(_ShadersEngine);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nvar AssetsManager = function () {\n\tfunction AssetsManager() {\n\t\t_classCallCheck(this, AssetsManager);\n\n\t\tthis.completed = {\n\t\t\tsound: false,\n\t\t\tvideo: true,\n\t\t\timages: false,\n\t\t\tmodels: false,\n\t\t\tshaders: false\n\t\t};\n\n\t\tthis.audioEngine = new _AudioEngine2.default(this);\n\t\tthis.videoEngine = new _VideoEngine2.default(this);\n\t\tthis.imagesEngine = new _ImagesEngine2.default(this);\n\t\tthis.modelsEngine = new _ModelsEngine2.default(this);\n\t\tthis.shadersEngine = new _ShadersEngine2.default(this);\n\t}\n\n\t_createClass(AssetsManager, [{\n\t\tkey: 'load',\n\t\tvalue: function load(callback) {\n\t\t\tvar _this = this;\n\n\t\t\treturn Promise.all([this.audioEngine.load(), this.videoEngine.load(), this.imagesEngine.load(), this.modelsEngine.load(), this.shadersEngine.load()]).then(function () {\n\t\t\t\tcallback();\n\t\t\t\t_this.loadingMessage(true);\n\t\t\t}).catch(function (e) {\n\t\t\t\tcallback(e);\n\t\t\t\t_this.loadingMessage(false);\n\t\t\t});\n\t\t}\n\t}, {\n\t\tkey: 'loadingMessage',\n\t\tvalue: function loadingMessage(loaded) {}\n\t}]);\n\n\treturn AssetsManager;\n}();\n\nexports.default = AssetsManager;\n\n//# sourceURL=webpack://M/./src/base/AssetsManager.js?");

/***/ }),

/***/ "./src/entities/Mesh.js":
/*!******************************!*\
  !*** ./src/entities/Mesh.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n\tvalue: true\n});\n\nvar _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();\n\nvar _entity = __webpack_require__(/*! ./entity */ \"./src/entities/entity.js\");\n\nvar _entity2 = _interopRequireDefault(_entity);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\"); } return call && (typeof call === \"object\" || typeof call === \"function\") ? call : self; }\n\nfunction _inherits(subClass, superClass) { if (typeof superClass !== \"function\" && superClass !== null) { throw new TypeError(\"Super expression must either be null or a function, not \" + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }\n\nvar Mesh = function (_Entity) {\n\t_inherits(Mesh, _Entity);\n\n\tfunction Mesh(geometry, material, options) {\n\t\t_classCallCheck(this, Mesh);\n\n\t\tvar _this = _possibleConstructorReturn(this, (Mesh.__proto__ || Object.getPrototypeOf(Mesh)).call(this));\n\n\t\t_this.geometry = geometry;\n\t\t_this.material = material;\n\t\t_this.script = {};\n\t\t_this.hasScript = false;\n\n\t\t_this.mesh = new THREE.Mesh(geometry, material);\n\t\tif (app.util.cast_shadow) {\n\t\t\t_this.mesh.castShadow = true;\n\t\t\t_this.mesh.receiveShadow = true;\n\t\t}\n\t\t//adding to core\n\t\tapp.add(_this.mesh, _this);\n\n\t\tif (options) {\n\t\t\t//do something with options\n\t\t\tfor (var o in options) {\n\t\t\t\t_this[o] = options[o];\n\t\t\t\tif (o == \"script\") {\n\t\t\t\t\t_this.hasScript = true;\n\t\t\t\t\t_this.addScript(options[o], options.dir);\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\treturn _this;\n\t}\n\n\t_createClass(Mesh, [{\n\t\tkey: \"texture\",\n\t\tvalue: function texture(_texture) {\n\t\t\tif (_texture && this.mesh && this.mesh.material) {\n\t\t\t\t_texture.wrapS = THREE.RepeatWrapping;\n\t\t\t\t_texture.wrapT = THREE.RepeatWrapping;\n\n\t\t\t\t_texture.repeat.set(1, 1);\n\t\t\t\tthis.mesh.material.map = _texture;\n\t\t\t}\n\t\t}\n\t}]);\n\n\treturn Mesh;\n}(_entity2.default);\n\nexports.default = Mesh;\n\n//# sourceURL=webpack://M/./src/entities/Mesh.js?");

/***/ }),

/***/ "./src/entities/entity.js":
/*!********************************!*\
  !*** ./src/entities/entity.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n\tvalue: true\n});\n\nvar _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nvar Entity = function () {\n\tfunction Entity() {\n\t\t_classCallCheck(this, Entity);\n\t}\n\n\t_createClass(Entity, [{\n\t\tkey: \"start\",\n\t\tvalue: function start() {}\n\t}, {\n\t\tkey: \"update\",\n\t\tvalue: function update() {}\n\t}, {\n\t\tkey: \"render\",\n\t\tvalue: function render() {\n\t\t\tif (this.mesh && this.mesh.render) {\n\t\t\t\tthis.mesh.render();\n\t\t\t}\n\t\t}\n\t}, {\n\t\tkey: \"addScript\",\n\t\tvalue: function addScript(scriptname, dir) {\n\t\t\tvar path = M.game.SCRIPTS_DIR + (dir || \"\");\n\t\t\tif (path[path.length - 1] != \"/\") {\n\t\t\t\tpath += \"/\"; //adding dir separator if we forgot it\n\t\t\t}\n\t\t\tM.game.attachScriptToObject(this, scriptname, path);\n\t\t}\n\n\t\t//__loadScript will be automatically called by Game object\n\n\t}, {\n\t\tkey: \"__loadScript\",\n\t\tvalue: function __loadScript(script) {\n\t\t\tfor (var method in script) {\n\t\t\t\tthis[method] = script[method];\n\t\t\t}\n\t\t\ttry {\n\t\t\t\tthis.start();\n\t\t\t} catch (e) {\n\t\t\t\tconsole.log(\"I told you, man. Check your start method inside your \" + script.name + \".js script\");\n\t\t\t}\n\t\t}\n\t}, {\n\t\tkey: \"addSound\",\n\t\tvalue: function addSound(name, options) {\n\t\t\tvar _autoplay = options.autoplay || false;\n\t\t\tthis.isPlayingSound = _autoplay;\n\t\t\tthis.sound = new Sound(name, { mesh: this.mesh, autoplay: _autoplay, effect: options.effect });\n\t\t}\n\t}, {\n\t\tkey: \"addDirectionalSound\",\n\t\tvalue: function addDirectionalSound(name, options) {\n\t\t\tvar _autoplay = options.autoplay || false;\n\t\t\tthis.isPlayingSound = _autoplay;\n\t\t\tthis.sound = new DirectionalSound(name, { mesh: this.mesh, autoplay: _autoplay, effect: options.effect });\n\t\t}\n\t}, {\n\t\tkey: \"addAmbientSound\",\n\t\tvalue: function addAmbientSound(name, options) {\n\t\t\tvar _autoplay = options.autoplay || false;\n\t\t\tvar _loop = options.loop || false;\n\t\t\tthis.isPlayingSound = _autoplay;\n\t\t\tthis.sound = new AmbientSound(name, { mesh: this.mesh, autoplay: _autoplay, loop: _loop, effect: options.effect });\n\t\t}\n\t}, {\n\t\tkey: \"addLight\",\n\t\tvalue: function addLight(color, intensity, distance) {\n\n\t\t\tvar position = {\n\t\t\t\tx: this.mesh.position.x,\n\t\t\t\ty: this.mesh.position.y,\n\t\t\t\tz: this.mesh.position.z\n\t\t\t};\n\t\t\tthis.light = new PointLight(color, intensity, distance, position);\n\t\t\tthis.addMesh(this.light.mesh.mesh);\n\t\t}\n\t}, {\n\t\tkey: \"playSound\",\n\t\tvalue: function playSound() {\n\t\t\tif (this.sound && !this.isPlayingSound) {\n\t\t\t\tthis.sound.start();\n\t\t\t\tthis.isPlayingSound = true;\n\t\t\t}\n\t\t}\n\t}, {\n\t\tkey: \"stopSound\",\n\t\tvalue: function stopSound() {\n\t\t\tif (this.sound && this.isPlayingSound) {\n\t\t\t\tthis.sound.stop();\n\t\t\t\tthis.isPlayingSound = false;\n\t\t\t}\n\t\t}\n\t}, {\n\t\tkey: \"scale\",\n\t\tvalue: function scale(options) {\n\t\t\tvar _x = options.x || 1,\n\t\t\t    _y = options.y || 1,\n\t\t\t    _z = options.z || 1;\n\n\t\t\tif (this.mesh) {\n\t\t\t\tthis.mesh.scale.set(_x, _y, _z);\n\t\t\t}\n\t\t}\n\t}, {\n\t\tkey: \"position\",\n\t\tvalue: function position(options) {\n\t\t\tvar _x = options.x || this.mesh.position.x,\n\t\t\t    _y = options.y || this.mesh.position.y,\n\t\t\t    _z = options.z || this.mesh.position.z;\n\n\t\t\tif (this.mesh) {\n\t\t\t\tthis.mesh.position.set(_x, _y, _z);\n\t\t\t}\n\t\t}\n\t}, {\n\t\tkey: \"rotation\",\n\t\tvalue: function rotation(options) {\n\t\t\tvar _x = options.x || this.mesh.rotation.x,\n\t\t\t    _y = options.y || this.mesh.rotation.y,\n\t\t\t    _z = options.z || this.mesh.rotation.z;\n\n\t\t\tif (this.mesh) {\n\t\t\t\tthis.mesh.rotation.set(_x, _y, _z);\n\t\t\t}\n\t\t}\n\t}, {\n\t\tkey: \"add\",\n\t\tvalue: function add(mesh) {\n\t\t\tif (mesh.mesh && this.mesh) {\n\t\t\t\tthis.mesh.add(mesh.mesh);\n\t\t\t}\n\t\t}\n\t}]);\n\n\treturn Entity;\n}();\n\nexports.default = Entity;\n\n//# sourceURL=webpack://M/./src/entities/entity.js?");

/***/ }),

/***/ "./src/fx/shaders/ShadersEngine.js":
/*!*****************************************!*\
  !*** ./src/fx/shaders/ShadersEngine.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n\tvalue: true\n});\n\nvar _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nvar ShadersEngine = function () {\n\tfunction ShadersEngine(assetsManager) {\n\t\t_classCallCheck(this, ShadersEngine);\n\n\t\tthis.SHADERS_DIR = \"app/shaders/\";\n\t\tthis.SHADERS = [];\n\n\t\tthis.map = {};\n\t\tthis.shaders = [];\n\n\t\tthis.numShaders = 0;\n\t\tthis.shadersLoaded = 0;\n\t\tthis.assetsManager = assetsManager;\n\t}\n\n\t_createClass(ShadersEngine, [{\n\t\tkey: \"load\",\n\t\tvalue: function load() {\n\t\t\tif (Assets.Shaders) {\n\t\t\t\tfor (var shader in Assets.Shaders) {\n\t\t\t\t\tthis.numShaders++;\n\t\t\t\t\tthis.loadSingleFile(shader, Assets.Shaders[shader]);\n\t\t\t\t}\n\t\t\t}\n\n\t\t\tif (this.numShaders == 0) {\n\t\t\t\tthis.assetsManager.completed.shaders = true;\n\t\t\t}\n\t\t}\n\t}, {\n\t\tkey: \"get\",\n\t\tvalue: function get(id) {\n\t\t\treturn this.map[id] || false;\n\t\t}\n\t}, {\n\t\tkey: \"loadSingleFile\",\n\t\tvalue: function loadSingleFile(id, path) {\n\t\t\tvar _this = this;\n\n\t\t\tvar type = path.split(\".\")[1];\n\n\t\t\tif (type == \"js\") {\n\t\t\t\tinclude(path.split(\".js\")[0], this.checkLoad);\n\t\t\t} else {\n\t\t\t\tvar request = new XMLHttpRequest();\n\t\t\t\trequest.open(\"GET\", path, true);\n\t\t\t\trequest.responseType = \"text\";\n\t\t\t\trequest.onload = function (e) {\n\t\t\t\t\tvar shader = _this.parseShader(request.responseText);\n\t\t\t\t\t_this.map[id] = shader;\n\t\t\t\t\t_this.shadersLoaded++;\n\t\t\t\t\t_this.checkLoad();\n\t\t\t\t};\n\t\t\t\trequest.send();\n\t\t\t}\n\t\t}\n\t}, {\n\t\tkey: \"parseShader\",\n\t\tvalue: function parseShader(text) {\n\t\t\treturn {\n\t\t\t\tname: text.substring(text.indexOf(\"<name>\") + 6, text.indexOf(\"</name>\")),\n\t\t\t\tvertex: text.substring(text.indexOf(\"<vertex>\") + 8, text.indexOf(\"</vertex>\")),\n\t\t\t\tfragment: text.substring(text.indexOf(\"<fragment>\") + 10, text.indexOf(\"</fragment>\")),\n\t\t\t\toptions: {},\n\t\t\t\tattributes: {},\n\t\t\t\tuniforms: {}\n\t\t\t};\n\t\t}\n\t}, {\n\t\tkey: \"create\",\n\t\tvalue: function create(name, params) {\n\t\t\tthis.SHADERS.push(name);\n\t\t\tthis.map.put(name, {\n\t\t\t\tname: name,\n\t\t\t\tvertex: params.vertex || \"\",\n\t\t\t\tfragment: params.fragment || \"\",\n\t\t\t\toptions: params.options || {},\n\t\t\t\tattributes: params.attributes || {},\n\t\t\t\tuniforms: params.uniforms || {},\n\t\t\t\tinstance: params.instance || false\n\t\t\t});\n\t\t}\n\t}, {\n\t\tkey: \"checkLoad\",\n\t\tvalue: function checkLoad() {\n\t\t\tif (this.shadersLoaded == this.numShaders) {\n\t\t\t\tthis.assetsManager.completed.shaders = true;\n\t\t\t}\n\t\t}\n\t}, {\n\t\tkey: \"add\",\n\t\tvalue: function add(shader) {\n\t\t\tthis.shaders.push(shader);\n\t\t}\n\t}]);\n\n\treturn ShadersEngine;\n}();\n\nexports.default = ShadersEngine;\n\n//# sourceURL=webpack://M/./src/fx/shaders/ShadersEngine.js?");

/***/ }),

/***/ "./src/images/ImagesEngine.js":
/*!************************************!*\
  !*** ./src/images/ImagesEngine.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n\tvalue: true\n});\n\nvar _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nvar ImagesEngine = function () {\n\tfunction ImagesEngine(assetsManager) {\n\t\t_classCallCheck(this, ImagesEngine);\n\n\t\tthis.numImages = 0;\n\t\tthis.imagesLoaded = 0;\n\t\tthis.defaults = {\n\t\t\t\"waterNormal\": \"assets/images/waternormals.jpg\",\n\t\t\t\"water\": \"assets/images/water.jpg\",\n\t\t\t'smokeparticle': 'assets/images/smokeparticle.png'\n\t\t};\n\n\t\tthis.imagesDefault = {\n\t\t\t\"skybox\": \"assets/images/skybox_1.png\"\n\t\t};\n\n\t\tthis.map = {};\n\t\tthis.images = [];\n\t\tthis.numImages = 0;\n\t\tthis.loader = new THREE.TextureLoader();\n\t\tthis.imageLoader = new THREE.ImageLoader();\n\n\t\tthis.assetsManager = assetsManager;\n\t}\n\n\t_createClass(ImagesEngine, [{\n\t\tkey: \"load\",\n\t\tvalue: function load() {\n\t\t\t// extending assets images with our defaults\n\t\t\tObject.assign(Assets.Textures, this.defaults);\n\t\t\tObject.assign(Assets.Images, this.imagesDefault);\n\n\t\t\tfor (var image in Assets.Textures) {\n\t\t\t\tthis.numImages++;\n\t\t\t\tthis.loadSingleFile(image, Assets.Textures[image]);\n\t\t\t}\n\n\t\t\tfor (var image in Assets.Images) {\n\t\t\t\tthis.numImages++;\n\t\t\t\tthis.loadSingleImage(image, Assets.Images[image]);\n\t\t\t}\n\n\t\t\tif (this.numImages == 0) {\n\t\t\t\tthis.assetsManager.completed.images = true;\n\t\t\t}\n\t\t}\n\t}, {\n\t\tkey: \"get\",\n\t\tvalue: function get(key) {\n\t\t\treturn this.map[key] || false;\n\t\t}\n\t}, {\n\t\tkey: \"loadSingleImage\",\n\t\tvalue: function loadSingleImage(id, path) {\n\t\t\ttry {\n\t\t\t\tthis.imagesLoaded++;\n\t\t\t\tthis.imageLoader.load(path, function (image) {\n\t\t\t\t\tthis.map[id] = image;\n\t\t\t\t\tthis.checkLoad();\n\t\t\t\t}, function () {\n\t\t\t\t\t// displaying progress\n\t\t\t\t}, function () {\n\t\t\t\t\tconsole.log('An error occurred while fetching texture.');\n\t\t\t\t\tthis.checkLoad();\n\t\t\t\t});\n\t\t\t} catch (e) {\n\t\t\t\tconsole.log('[MAGE] error loading image ' + id + ' at path ' + path);\n\t\t\t}\n\t\t}\n\t}, {\n\t\tkey: \"loadSingleFile\",\n\t\tvalue: function loadSingleFile(id, path) {\n\t\t\ttry {\n\t\t\t\tthis.imagesLoaded++;\n\t\t\t\tthis.loader.load(path, function (texture) {\n\t\t\t\t\tthis.map.put(id, texture);\n\t\t\t\t\tthis.checkLoad();\n\t\t\t\t}, function () {\n\t\t\t\t\t// displaying progress\n\t\t\t\t}, function () {\n\t\t\t\t\tconsole.log('An error occurred while fetching texture.');\n\t\t\t\t\tthis.checkLoad();\n\t\t\t\t});\n\t\t\t} catch (e) {}\n\t\t}\n\t}, {\n\t\tkey: \"checkLoad\",\n\t\tvalue: function checkLoad() {\n\t\t\tif (this.imagesLoaded == this.numImages) {\n\t\t\t\tthis.assetsManager.completed.images = true;\n\t\t\t}\n\t\t}\n\t}, {\n\t\tkey: \"add\",\n\t\tvalue: function add(id, image) {\n\t\t\tif (id && image) {\n\t\t\t\tthis.map.put(id, image);\n\t\t\t}\n\t\t}\n\t}]);\n\n\treturn ImagesEngine;\n}();\n\nexports.default = ImagesEngine;\n\n//# sourceURL=webpack://M/./src/images/ImagesEngine.js?");

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n    value: true\n});\nexports.AssetsManager = undefined;\n\nvar _AssetsManager = __webpack_require__(/*! ./base/AssetsManager */ \"./src/base/AssetsManager.js\");\n\nvar _AssetsManager2 = _interopRequireDefault(_AssetsManager);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\nexports.AssetsManager = _AssetsManager2.default;\n\n//# sourceURL=webpack://M/./src/index.js?");

/***/ }),

/***/ "./src/models/ModelsEngine.js":
/*!************************************!*\
  !*** ./src/models/ModelsEngine.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n\tvalue: true\n});\n\nvar _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();\n\nvar _Mesh = __webpack_require__(/*! ../entities/Mesh */ \"./src/entities/Mesh.js\");\n\nvar _Mesh2 = _interopRequireDefault(_Mesh);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nvar ModelsEngine = function () {\n\tfunction ModelsEngine(assetsManager) {\n\t\t_classCallCheck(this, ModelsEngine);\n\n\t\tthis.loaders = THREE.JSONLoader(), this.numModels = 0;\n\t\tthis.modelsLoaded = 0;\n\t\tthis.assetsManager = assetsManager;\n\t}\n\n\t_createClass(ModelsEngine, [{\n\t\tkey: 'load',\n\t\tvalue: function load() {\n\t\t\tthis.map = {};\n\t\t\tthis.models = [];\n\n\t\t\tfor (var model in Assets.Models) {\n\t\t\t\tthis.numModels++;\n\t\t\t\tthis.loadSingleFile(model, Assets.Models[model]);\n\t\t\t}\n\n\t\t\tif (this.numModels == 0) {\n\t\t\t\tthis.assetsManager.completed.models = true;\n\t\t\t}\n\t\t}\n\t}, {\n\t\tkey: 'get',\n\t\tvalue: function get(id) {\n\t\t\tvar model = this.map[id] || false;\n\t\t\tif (model) {\n\t\t\t\tmodel.material.wireframe = false;\n\t\t\t\treturn new _Mesh2.default(model.geometry, model.material);\n\t\t\t}\n\t\t\treturn false;\n\t\t}\n\t}, {\n\t\tkey: 'loadSingleFile',\n\t\tvalue: function loadSingleFile(id, path) {\n\t\t\t// Load a sound file using an ArrayBuffer XMLHttpRequest.\n\t\t\tthis.loader.load(path, function (geometry, materials) {\n\t\t\t\tvar faceMaterial;\n\t\t\t\tif (materials && materials.length > 0) {\n\t\t\t\t\tvar material = materials[0];\n\t\t\t\t\tmaterial.morphTargets = true;\n\t\t\t\t\tfaceMaterial = new THREE.MultiMaterial(materials);\n\t\t\t\t} else {\n\t\t\t\t\tfaceMaterial = new THREE.MeshLambertMaterial({ wireframe: true });\n\t\t\t\t}\n\n\t\t\t\tvar model = {\n\t\t\t\t\tgeometry: geometry,\n\t\t\t\t\tmaterial: faceMaterial\n\t\t\t\t};\n\n\t\t\t\tthis.map[id] = model;\n\t\t\t\tthis.modelsLoaded++;\n\t\t\t\tthis.checkLoad();\n\t\t\t});\n\t\t}\n\t}, {\n\t\tkey: 'checkLoad',\n\t\tvalue: function checkLoad() {\n\t\t\tif (this.modelsLoaded == this.numModels) {\n\t\t\t\tthis.assetsManager.completed.models = true;\n\t\t\t}\n\t\t}\n\t}, {\n\t\tkey: 'add',\n\t\tvalue: function add(model) {\n\t\t\tthis.models.push(model);\n\t\t}\n\t}]);\n\n\treturn ModelsEngine;\n}();\n\nexports.default = ModelsEngine;\n\n//# sourceURL=webpack://M/./src/models/ModelsEngine.js?");

/***/ }),

/***/ "./src/video/VideoEngine.js":
/*!**********************************!*\
  !*** ./src/video/VideoEngine.js ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n    value: true\n});\n\nvar _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nvar VideoEngine = function () {\n    function VideoEngine() {\n        _classCallCheck(this, VideoEngine);\n    }\n\n    _createClass(VideoEngine, [{\n        key: \"load\",\n        value: function load() {}\n    }]);\n\n    return VideoEngine;\n}();\n\nexports.default = VideoEngine;\n\n//# sourceURL=webpack://M/./src/video/VideoEngine.js?");

/***/ })

/******/ });
});