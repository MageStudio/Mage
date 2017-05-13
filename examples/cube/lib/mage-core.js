var license = 	"Copyright (c) 2017 by Marco Stagni < http://marcostagni.com mrc.stagni@gmail.com > and contributors.\n\nSome rights reserved. "+
					"Redistribution and use in source and binary forms, with or without\n"+
					"modification, are permitted provided that the following conditions are\n"+
					"met:\n\n"+
						"* Redistributions of source code must retain the above copyright\n"+
						"  notice, this list of conditions and the following disclaimer.\n\n"+
						"* Redistributions in binary form must reproduce the above\n"+
						"  copyright notice, this list of conditions and the following\n"+
						"  disclaimer in the documentation and/or other materials provided\n"+
						"  with the distribution.\n\n"+
						"* The names of the contributors may not be used to endorse or\n"+
						"  promote products derived from this software without specific\n"+
						"  prior written permission.\n\n"+
					"THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS\n"+
					"'AS IS' AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT\n"+
					"LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR\n"+
					"A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT\n"+
					"OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,\n"+
					"SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT\n"+
					"LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,\n"+
					"DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY\n"+
					"THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT\n"+
					"(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE\n"+
					"OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.\n\n"+
					"Mage contains third party software in the 'app/vendor' directory: each\n"+
					"file/module in this directory is distributed under its original license.\n\n";
;
// retrieving M object
var window, M;
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    window = window || {
        asModule: true,
        THREE: {},
        document: {}
    };
    document = window.document;
    M = window.M || {};
};
var __pool__ = {};
function Class(name, methods) {
	var upper = __upperCaseFirstLetter__(name);
	__pool__[upper] = new __class__(upper, methods);
	//constructor not found
	if (!methods[upper]) throw "NO CONSTRUCTOR PROVIDED";
	window[upper] = methods[upper];
	for (var k in methods) {
		if (k != name) window[upper].prototype[k] = methods[k];
	}
	//adding a few useful methods
	window[upper].prototype['__print__'] = function() {console.table(this)}
	return __pool__[upper];
}

function __class__ (name, methods) {
	this.name = name;
	this.methods = methods;
}

__class__.prototype.has = {}.hasOwnProperty;
__class__.prototype._extends = function(toextend) {
	var c = window[this.name];
	var sup = (typeof(toextend) == "string") ? window[toextend] : toextend;
	if (!sup) throw "NO UPPER CLASS"
	window[this.name].prototype = Object.create(sup.prototype);
	window[this.name].prototype.constructor = window[this.name];
	this._setMethods();
	//apparently useless code below.
	window[this.name].prototype.__getSuper = function() {
		//console.log(c);
		//console.log(sup);
		return sup;
	}

	window.subClasses = window.subClasses || {};
	if (!window.subClasses[toextend]) {
		window.subClasses[toextend] = this.name;
	}
	/*
	window[this.name].prototype._super = function() {
		this.__getSuper().apply(this, arguments);
	};*/
	window[this.name].prototype._super = (typeof(toextend) == "string") ? window[toextend].call : toextend.call;
}

__class__.prototype._setMethods = function() {
	for (var k in this.methods) {
		if (k != this.name) window[__upperCaseFirstLetter__(this.name)].prototype[k] = this.methods[k];
	}
}

function __upperCaseFirstLetter__ (s) {
	return (s.length > 2) ? s[0].toUpperCase() + s.substring(1, s.length) : s.toUpperCase();
}


function include(src, callback) {

	var s, r, t, scripts = [];
	var _scripts = document.getElementsByTagName("script");
	for (var i=0; i<_scripts.length; i++) {
		//collecting all script names.
		scripts.push(_scripts[i].src);
	}
	var alreadyGot = function( value ) {
		for (var i=0; i<scripts.length; i++) {
			if (scripts[i].indexOf(value) != -1) {
				return true;
			}
		}
		return false;
	}
	//check if src is array or not,
	//split function in two separate parts
	if (src instanceof Array) {
		//for each element import, than call callback
		var got = 0;
		if (src.length == 0) {
			console.log("Why are you triyng to include 0 scripts? This makes me sad.")
			return;
		}
		//console.log(src);
		//console.log(src.length);
		var check = function() {
			if (got == src.length) callback();
		}
		for (var j=0; j<src.length; j++) {
			if (!alreadyGot(src[j])) {
				s = document.createElement('script');
				s.type = 'text/javascript';
				s.src = src[j] + ".js";
				if (callback) {
					s.onload = s.onreadystatechange = function() {
						if (!this.readyState || this.readyState == 'complete') {
							got++;
							check();
						}
					};
				}
				t = document.getElementsByTagName('script')[0];
				t.parentNode.insertBefore(s, t);
			} else {
				if (callback) {
					check();
				}
			}
		}
	} else if (typeof src == "string") {
		if (!alreadyGot(src)) {
			r = false;
			s = document.createElement('script');
			s.type = 'text/javascript';
			s.src = src + ".js";
			if (callback) {
				s.onload = s.onreadystatechange = function() {
					if ( !r && (!this.readyState || this.readyState == 'complete') ) {
						r = true;
						callback();
					}
				};
			}
			t = document.getElementsByTagName('script')[0];
			t.parentNode.insertBefore(s, t);
		} else {
			if (callback) {
				callback();
			}
		}
	}
}
;
function BEE(){this.options=void 0,this.nodes=[],this.size=0,this.hasRoot=!1,this._idPool=[]}function _preEach(t,e,o){if(o){var r=e+1;t(o,r),_preEach(t,e,o.leftBranch),_preEach(t,e,o.rightBranch)}}function _postEach(t,e,o){if(o){console.log("inside _postEach"),_postEach(t,e,o.leftBranch),_postEach(t,e,o.rightBranch);var r=e+1;t(o,r)}}function _defEach(t,e,o){if(o){_defEach(t,e,o.leftBranch);var r=e+1;t(o,r),_defEach(t,e,o.rightBranch)}}function _hasLTR(t,o,r){return o?r(t.data,o.data)?!0:_hasLTR(e,o.leftBranch)||_hasLTR(e,o.rightBranch):!1}function _hasRTL(t,o,r){return o?r(t.data,o.data)?!0:_hasRTL(e,o.rightBranch)||_hasRTL(e,o.leftBranch):!1}function _orderedHas(t,e,o){return e?0==o(t.data,e.data)?!0:o(t.data,e.data)<0?_orderedHas(t,e.leftBranch):_orderedHas(t,e.rightBranch):!1}function height(t){return t?1+Math.max(_height(t.leftBranch),_height(t.rightBranch)):0}function _orderedIns(t,e,o){return e?(o(t.data,e.data)<0||0==o(t.data,e.data)?e.leftBranch=_orderedIns(t,e.leftBranch):e.rightBranch=_orderedIns(t,e.rightBranch),e):buildNode(data,void 0,void 0)}function buildNode(t,e,o){var r=this.createNode(t);return r.addLeaf(e,{branch:"left"}),r.addLeaf(o,{branch:"right"}),r}function Node(t){if(!(t.tree&&t.tree instanceof BEE))throw BEE.VALID_BEE;this.tree=t.tree;for(var e=Math.random().toString(BEE.MAX_ID_SIZE).slice(2);this.tree._idPool.indexOf(e)>-1;)e=Math.random().toString(BEE.MAX_ID_SIZE).slice(2);this.tree._idPool.push(e),this._id=e,Object.defineProperty(this,"_id",{set:function(){throw BEE.UNTOUCHABLE},get:function(){return e}}),this.data=t.data,this.tree.size+=1,this.tree.nodes.push(this),this.leftBranch=void 0,this.rightBranch=void 0,this.rightWeight=void 0,this.leftWeight=void 0,this._isRoot=!1,this._isLeaf=!1,this._isParent=!1,this.children=0,this.parents=0,this.parent=void 0}BEE.version="0.1",BEE.authors=[{name:"Marco Stagni",website:"http://marcostagni.com"}],BEE.MAX_CHILDREN_COUNT=2,BEE.MAX_PARENTS_COUNT=1,BEE.MAX_ID_SIZE=12,BEE.MAX_ROOT_NUMBER=1,BEE.VALID_BEE="Please use a valid BEE object.",BEE.UNTOUCHABLE="Untouchable value. Get away.",BEE.VALID_BRANCH="Please specify a valid branch.",BEE.NO_MORE_CHILDREN="No more children allowed for this node.",BEE.NO_MORE_PARENTS="This node already have a parent.",BEE.ERROR_NO_LEAVES="Sorry, something wrong in your BEE. There are no leaves :(",BEE.ERROR_NO_PARENTS="Sorry, something wrong in your BEE. There are no leaves :(",BEE.ERROR_STRANGE_ROOTS="Sorry, something wrong in your BEE. Strange number of root nodes",BEE.ERROR_ALREADY_LEFT="Sorry, this node already have a left branch.",BEE.ERROR_ALREADY_RIGHT="Sorry, this node already have a right branch.",BEE.BAD_ARGUMENTS="BAD ARGUMENTS, please check them.",BEE.prototype.createNode=function(t){var e=new Node({tree:this,data:t});return e},BEE.prototype.getAllLeaves=function(){var t=[];for(var e in this.nodes)this.nodes[e]._isLeaf&&t.push(this.nodes[e]);if(0==t.length)throw BEE.ERROR_NO_LEAVES;return t},BEE.prototype.getRootNode=function(){var t=[];for(var e in this.nodes)this.nodes[e]._isRoot&&t.push(this.nodes[e]);if(1!=t.length)throw BEE.ERROR_STRANGE_ROOTS;return t[0]},BEE.prototype.getAllParents=function(){var t=[];for(var e in this.nodes)this.nodes[e]._isParent&&t.push(this.nodes[e]);if(0==t.length)throw BEE.ERROR_NO_PARENTS;return t},BEE.prototype.getPath=function(t){var e,o,r=[];for(r.push({n:t,w:void 0}),e=t.parent,o=t;e;){var i=e.leftBranch._id==o._id?e.leftWeight:e.rightWeight;r.push({n:e,w:i}),o=e,e=e.parent}return r.reverse()},BEE.prototype.each=function(t,e){var o=0;if("function"!=typeof t)throw BEE.BAD_ARGUMENTS;"post"==e?(console.log("inside post"),console.log(this.getRootNode()),_postEach(t,o,this.getRootNode())):"pre"==e?_preEach(t,o,this.getRootNode()):_defEach(t,o,this.getRootNode())},BEE.prototype.has=function(t,e,o){if("function"!=typeof e)throw BEE.BAD_ARGUMENTS;var r;if(o)if(_s=o.toLowerCase(),"ltr"==_s)r=_hasLTR(t,this.getRootNode(),e);else{if("rtl"!=_s)throw BEE.BAD_ARGUMENTS;r=_hasRTL(t,this.getRootNode(),e)}else r=_hasLTR(t,this.getRootNode(),e);return r},BEE.prototype.orderedHas=function(t,e){return _orderedIns(t,this.getRootNode(),e)},BEE.prototype.height=function(){var t=_height(this.getRootNode());return t},BEE.prototype.orderedIns=function(t,e){try{_orderedIns(t,this.getRootNode(),e)}catch(o){return console.log("Something bad happened in ordIns"),!1}},BEE.prototype.buildNode=function(t,e,o){var r=this.createNode(t);return r.addLeaf(e,{branch:"left"}),r.addLeaf(o,{branch:"right"}),r},Node.prototype.setRoot=function(t){this._isRoot=t},Node.prototype.setParent=function(t){this._isParent=t},Node.prototype.setLeaf=function(t){this._isLeaf=t},Node.prototype.update=function(){0==this.children?0==this.parents?(this.setLeaf(!1),this.setRoot(!0),this.setParent(!1)):(this.setLeaf(!0),this.setRoot(!1),this.setParent(!1)):0==this.parents?(this.setLeaf(!1),this.setRoot(!0),this.setParent(!0)):(this.setLeaf(!1),this.setRoot(!1),this.setParent(!0))},Node.prototype.addLeaf=function(t,e){if(this.children+1>BEE.MAX_CHILDREN_COUNT)throw BEE.NO_MORE_CHILDREN;if(!e.branch)throw BEE.BAD_ARGUMENTS;if("left"==e.branch){if(this.leftBranch)throw BEE.ERROR_ALREADY_LEFT;this.leftBranch=t,this.leftWeight=e.weights&&e.weights.l?e.weights.l:0}else{if("right"!=e.branch)throw BEE.VALID_BRANCH;if(this.rightBranch)throw BEE.ERROR_ALREADY_RIGHT;this.rightBranch=t,this.rightWeight=e.weights&&e.weights.r?e.weights.r:1}this.children+=1,t.parent=this,t.parents=1,this.update(),t.update()},Node.prototype.addParent=function(t,e){if(this.parents+1>BEE.MAX_PARENTS_COUNT)throw BEE.NO_MORE_PARENTS;if(t.children+1>BEE.MAX_CHILDREN_COUNT)throw BEE.NO_MORE_CHILDREN;t.addLeaf(this,e)};
;
function randomColor() {
	var letters = '0123456789ABCDEF'.split('');
	var color = '#';
	for (var i = 0; i < 6; i++ ) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

function componentToHex(c) {
	var hex = c.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
	return "0x" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function getIntValueFromHex(hex) {
	return parseInt(hex, 16);
};
function HashMap() {
	if (arguments.length == 0) {
		//costruttore di default
		this.total = 0;
		this.keys = new Array();
		this.maxDimension = undefined;
	}
	else {
		if (arguments.length == 1) {
			if (!isNaN(arguments[0])) {
				
				/*------------------------------
				INITIALIZING MAP with a 
				prefixed max dimension.				
				------------------------------*/

				this.total = 0;
				this.maxDimension = arguments[0];
				this.keys = new Array();

			}
			else {
				
				/*------------------------------
				 we must implement constructor 
				 from another map.
				------------------------------*/

				this.total = 0;
				this.keys = new Array();
				this.maxDimension = undefined;

			}		

		}

	}

	/*------------------------------
	anyway, we must create a 
	map object inside out object
	------------------------------*/

	this.map = {};
	
}


HashMap.prototype.clear = function() {
	
	/*------------------------------
	clearing every element of our 
	map.
	------------------------------*/

	for (key in this.map) {
		this.map[""+key] = undefined;
	}
	this.total = 0;
	this.keys = new Array();
}


HashMap.prototype.clone = function() {

	/*------------------------------
	creating a temporary object
	exact clone of this.
	------------------------------*/

	var temp = new HashMap();
	for (key in this.map) {
		temp.map[""+key] = this.map[""+key];
	}

	return temp;
}

HashMap.prototype.containsKey = function( key ) {

	/*------------------------------
	searching across the map for
	the key selected.
	------------------------------*/

	var found = false;
	for (innerkey in this.map) {
		if (innerkey == key ) {
			found = true;
			break;
		}
	}

	return found;
}

HashMap.prototype.containsValue = function( value ) {

	/*------------------------------
	searching across the map for
	the key selected.
	------------------------------*/

	var found = false;
	for (key in this.map) {
		if (this.map[""+key] == value ) {
			found = true;
			break;
		}
	}

	return found;
}

HashMap.prototype.get = function( key ) {
	
	/*------------------------------
	searching across the map for
	the key selected.
	------------------------------*/	
	for (innerkey in this.map) {
		if (innerkey == key ) {
			return this.map[""+innerkey];
		}
	} 

	return null;
}

HashMap.prototype.isEmpty = function() {

	return (this.total == 0);
}

HashMap.prototype.put = function( key, value) {
	if (this.maxDimension) {
		if (this.total < this.maxDimension) {
			this.map[""+key] = value;
			this.keys.push(key);
			this.total += 1;
			return true;
		}
		else {
			return false;
		}
	}
	else {
		this.map[""+key] = value;
		this.keys.push(key);
		this.total += 1;
		return true;
	}
}



HashMap.prototype.remove = function ( key ) {
	//must return true or false if our deletion
	//is succesful or not.
	try {
		for (innerkey in this.map) {
			if (innerkey == key) {
				var index = this.keys.indexOf(innerkey);
				var b = new Array();
				for (var i =0; i < this.keys.length; i++) {
					if (i!=index) {
						b.push(this.keys[i]);
					}
				}
				this.keys = new Array();
				this.keys = b;
				delete this.map[""+innerkey];
				this.total = 0;
				return true;
			}
		}

		return false;
	}
	catch ( error ) {
		console.log("HASHMAP ERROR ");
		console.error(error);
		console.trace();
		return false;
	}

}

HashMap.prototype.size = function () {

	return this.total;
};
window.M = window.M || {};

M.assetsManager = {};

M.assetsManager.completed = {
	sound : false,
	video : true,
	images : false,
	general : true,
	shaders : false
};

M.assetsManager.load = function(callback) {
	//first we load scripts
	//console.log(include);
	M.assetsManager.callback = callback;
	//over loading scripts
	M.audioEngine.load();
	M.videoEngine.load();
	M.imagesEngine.load();
	M.generalAssetsEngine.load();
	//effects
	M.fx.shadersEngine.load();
	M.assetsManager.checkInterval = setInterval(M.assetsManager.check, 100);
};

M.assetsManager.loadingMessage = function(loaded) {
	//this method is up to you, developer!
	//console.log(loaded);
}

M.assetsManager.check = function() {
	if (M.assetsManager.completed.sound && M.assetsManager.completed.video && M.assetsManager.completed.images && M.assetsManager.completed.general) {
		//we finished loading all assets, yay!
		M.assetsManager.loadingMessage(true);
		clearInterval(M.assetsManager.checkInterval);
		M.assetsManager.callback();
	} else {
		M.assetsManager.loadingMessage(false);
	}
}
;
window.M = window.M || {};

M.fx = {};;
window.M = window.M || {};

M.audioEngine = {

	DELAY_FACTOR : 0.02,
	DELAY_STEP : 1, //millis
	DELAY_MIN_VALUE : 0.2,
	DELAY_NORMAL_VALUE : 40,
	VOLUME : 80,
	_volume : 80,

	soundPath : "js/core/sound/",
	soundModules : [
		"js/core/audio/beat", //parent
		"js/core/audio/sound",
		"js/core/audio/ambientSound"
	],

	numSound : 0,
	soundLoaded : 0,
	load : function() {

		M.audioEngine.map = new HashMap();
		M.audioEngine.sounds = [];

		M.audioEngine.AudioContext = window.AudioContext || window.webkitAudioContext || null;

		if (M.audioEngine.AudioContext) {
			//creating a new audio context if it's available.
			M.audioEngine.context = new M.audioEngine.AudioContext();
			//creating a gain node to control volume
			M.audioEngine.volume = M.audioEngine.context.createGain();
			M.audioEngine.volume.gain.value = M.audioEngine.VOLUME;
			//connecting volume node to context destination
			M.audioEngine.volume.connect(M.audioEngine.context.destination);
		} else {
			console.error("No Audio Context available, sorry.");
		}

		for (var audio in Assets.Audio) {
			M.audioEngine.numSound++;
			M.audioEngine.loadSingleFile(audio, Assets.Audio[audio]);
		}

		if (M.audioEngine.numSound == 0) {
			M.assetsManager.completed.sound = true;
		}
	},

	get : function(id) {
		//returning stored buffer;
		return M.audioEngine.map.get(id) || false;
	},

	loadSingleFile : function(id, path) {
		// Load a sound file using an ArrayBuffer XMLHttpRequest.
		var request = new XMLHttpRequest();
		request.open("GET", path, true);
		request.responseType = "arraybuffer";
		request.onload = function(e) {

			// Create a buffer from the response ArrayBuffer.
			M.audioEngine.context.decodeAudioData(this.response, function onSuccess(buffer) {
				//storing audio buffer inside map
				M.audioEngine.map.put(id, buffer);
				M.audioEngine.soundLoaded++;
				M.audioEngine.checkLoad();
			}, function onFailure() {
				M.audioEngine.map.put(id, null);
				M.audioEngine.soundLoaded++;
				console.error("Decoding the audio buffer failed");
			});

		};
		request.send();
	},

	checkLoad: function() {
		if (M.audioEngine.soundLoaded == M.audioEngine.numSound) {
			M.assetsManager.completed.sound = true;
		}
	},

	//add method
	add: function(sound) {
		M.audioEngine.sounds.push(sound);
	},

	update: function() {
		var start = new Date();
		for (var index in M.audioEngine.sounds) {
			var sound = M.audioEngine.sounds[index];
			sound.update(app.clock.getDelta());

			//now handling listener
			app.camera.object.updateMatrixWorld();
			var p = new THREE.Vector3();
			p.setFromMatrixPosition(app.camera.object.matrixWorld);

			//setting audio engine context listener position on camera position
			M.audioEngine.context.listener.setPosition(p.x, p.y, p.z);


			//this is to add up and down vector to our camera
			// The camera's world matrix is named "matrix".
			var m = app.camera.object.matrix;

			mx = m.elements[12], my = m.elements[13], mz = m.elements[14];
			m.elements[12] = m.elements[13] = m.elements[14] = 0;

			// Multiply the orientation vector by the world matrix of the camera.
			var vec = new THREE.Vector3(0,0,1);
			vec.applyProjection(m);
			vec.normalize();

			// Multiply the up vector by the world matrix.
			var up = new THREE.Vector3(0,-1,0);
			up.applyProjection(m);
			up.normalize();

			// Set the orientation and the up-vector for the listener.
			M.audioEngine.context.listener.setOrientation(vec.x, vec.y, vec.z, up.x, up.y, up.z);

			m.elements[12] = mx;
			m.elements[13] = my;
			m.elements[14] = mz;

			if ((+new Date() - start) > 50) return;
		}
	}
};

Object.defineProperty(M.audioEngine, "VOLUME", {

	set: function(value) {
		M.audioEngine._volume = value;
		M.audioEngine.volume.gain.value = M.audioEngine._volume;
	},

	get: function() {
		if (M.audioEngine._volume) {
			return M.audioEngine._volume;
		}
	},
});
;
window.M = window.M || {};

M.videoEngine = {};

M.videoEngine.load = function() {
	//loading videos
};;
(function() {

	window.M = window.M || {};

	M.imagesEngine = {

		numImages: 0,
		imagesLoaded: 0,

		defaults: {
			"waterNormal": "assets/images/waternormals.jpg",
			"water": "assets/images/water.jpg"
		},

		imagesDefault: {
			"skybox": "assets/images/skybox_1.png"
		},

		load: function() {
			//loading images
			M.imagesEngine.map = new HashMap();
			M.imagesEngine.images = [];
			M.imagesEngine.numImages = 0;
			M.imagesEngine.loader = new THREE.TextureLoader();
			M.imagesEngine.imageLoader = new THREE.ImageLoader();

			// extending assets images with our defaults
			Object.assign(Assets.Textures, M.imagesEngine.defaults);
			Object.assign(Assets.Images, M.imagesEngine.imagesDefault);

			for (var image in Assets.Textures) {
				M.imagesEngine.numImages++;
				M.imagesEngine.loadSingleFile(image, Assets.Textures[image]);
			}

			for (var image in Assets.Images) {
				M.imagesEngine.numImages++;
				M.imagesEngine.loadSingleImage(image, Assets.Images[image]);
			}

			if (M.imagesEngine.numImages == 0) {
				M.assetsManager.completed.images = true;
			}
		},

		get: function(key) {
			return M.imagesEngine.map.get(key) || false;
		},

		loadSingleImage: function(id, path) {
				try {
				M.imagesEngine.imagesLoaded++;
				M.imagesEngine.imageLoader.load(path, function(image) {
					M.imagesEngine.map.put(id, image);
					M.imagesEngine.checkLoad();
				}, function() {
					// displaying progress
				}, function() {
					console.log('An error occurred while fetching texture.');
					M.imagesEngine.checkLoad();
				});
			} catch (e) {
				console.log('[MAGE] error loading image ' + id + ' at path ' + path);
			}
		},

		loadSingleFile : function(id, path) {
			try {
				M.imagesEngine.imagesLoaded++;
				M.imagesEngine.loader.load(path, function(texture) {
					M.imagesEngine.map.put(id, texture);
					M.imagesEngine.checkLoad();
				}, function() {
					// displaying progress
				}, function() {
					console.log('An error occurred while fetching texture.');
					M.imagesEngine.checkLoad();
				});
			} catch (e) {

			}
		},

		checkLoad: function() {
			if (M.imagesEngine.imagesLoaded == M.imagesEngine.numImages) {
				M.assetsManager.completed.images = true;
			}
		},

		//add method
		add: function(id, image) {
			if (id && image) {
				M.imagesEngine.map.put(id, image);
			}
		},
	}
})();
;

window.M = window.M || {};

M.lightEngine = {

    delayFactor: 0.1,
    delayStep: 30,
    holderRadius: 0.01,
    holderSegments: 1,

    init: function() {
        M.lightEngine.map = new HashMap();
        M.lightEngine.lights = [];
    },

    numLights : 0,

    //add method
    add: function(light) {
        M.lightEngine.lights.push(light);
    },

    update: function() {
        var start = new Date();
        for (var index in M.lightEngine.lights) {
            var light = M.lightEngine.lights[index];
            light.update(app.clock.getDelta());
            if ((+new Date() - start) > 50) return;
        }
    }
};

M.lightEngine.init();;
(function() {
	window.M = window.M || {};

	M.generalAssetsEngine = {};
	
	M.generalAssetsEngine.load = function() {
		//loading general assets, man!
	};
})();;
window.M = window.M || {};
M.fx = M.fx || {},

M.fx.shadersEngine = {

	SHADERS_DIR : "app/shaders/",

	SHADERS: [],

	map: new HashMap(),
	shaders: [],

	shaders: {},
	numShaders : 0,
	shadersLoaded : 0,
	update: function() {
		//console.log("inside old update ShadersEngine");
	},

	load: function() {

		if (Assets.Shaders) {
			for (var shader in Assets.Shaders) {
				M.fx.shadersEngine.numShaders++;
				M.fx.shadersEngine.loadSingleFile(shader, Assets.Shaders[shader]);
			}
		}

		if (M.fx.shadersEngine.numShaders == 0) {
			M.assetsManager.completed.shaders = true;
		}
	},

	get: function(id) {
		//returning stored shader;
		return M.fx.shadersEngine.map.get(id) || false;
	},

	loadSingleFile: function(id, path) {
		// @todo this has to be changed. We can load a M.fx.createShader file, a custom shader or a threejs shader/material.
		var type = path.split(".")[1];
		if ( type == "js" ) {
			include(path.split(".js")[0], this.checkLoad);
		} else {
			var request = new XMLHttpRequest();
			request.open("GET", path, true);
			request.responseType = "text";
			request.onload = function(e) {
				var shader = M.fx.shadersEngine._parseShader(this.responseText);
				M.fx.shadersEngine.map.put(id, shader);
				M.fx.shadersEngine.shadersLoaded++;
				M.fx.shadersEngine.checkLoad();
			};
			request.send();
		}
	},

	_parseShader: function(text) {
		var obj = {};
		obj.name = text.substring(text.indexOf("<name>")+6, text.indexOf("</name>"));
		obj.vertex = text.substring(text.indexOf("<vertex>")+8, text.indexOf("</vertex>"));
		obj.fragment = text.substring(text.indexOf("<fragment>")+10, text.indexOf("</fragment>"));
		obj.options = {};
		obj.attributes = {};
		obj.uniforms = {};
		return obj;
	},

	create: function( name, params ) {
		var obj = {};

		obj.name = name;
		obj.vertex = params.vertex || "";
		obj.fragment = params.fragment || "";
		obj.options = params.options || {};
		obj.attributes = params.attributes || {};
		obj.uniforms = params.uniforms || {};
		obj.instance = params.instance || false;

		M.fx.shadersEngine.SHADERS.push(name);
		M.fx.shadersEngine.map.put( name, obj );
	},

	checkLoad: function() {
		if (M.fx.shadersEngine.shadersLoaded == M.fx.shadersEngine.numShaders) {
			M.assetsManager.completed.shaders = true;
		}
	},

	//add method
	add: function(shader) {
		M.fx.shadersEngine.shaders.push(shader);
	},
};;
M.fx.shadersEngine.create("Skybox", {
    instance: function(options) {
        var cubeMap = new THREE.CubeTexture( [] );
        cubeMap.format = THREE.RGBFormat;
        
        var _buildCube = function(image) {
            var getSide = function ( x, y ) {
                var size = 1024;
                var canvas = document.createElement( 'canvas' );
                canvas.width = size;
                canvas.height = size;
                var context = canvas.getContext( '2d' );
                context.drawImage( image, - x * size, - y * size );
                return canvas;
            };

            cubeMap.images[ 0 ] = getSide( 2, 1 ); // px
            cubeMap.images[ 1 ] = getSide( 0, 1 ); // nx
            cubeMap.images[ 2 ] = getSide( 1, 0 ); // py
            cubeMap.images[ 3 ] = getSide( 1, 2 ); // ny
            cubeMap.images[ 4 ] = getSide( 1, 1 ); // pz
            cubeMap.images[ 5 ] = getSide( 3, 1 ); // nz
            cubeMap.needsUpdate = true;
        }

        if (options.texture) {
            _buildCube(options.texture);
        } else {
            var textureName = options.textureName || 'skybox';
            _buildCube(M.imagesEngine.get(textureName));
        }
        

        var cubeShader = THREE.ShaderLib[ 'cube' ];
        cubeShader.uniforms[ 'tCube' ].value = cubeMap;


        var skyBoxMaterial = new THREE.ShaderMaterial( {
            fragmentShader: cubeShader.fragmentShader,
            vertexShader: cubeShader.vertexShader,
            uniforms: cubeShader.uniforms,
            depthWrite: false,
            side: THREE.BackSide
        } );

        var skyBox = new THREE.Mesh(
            new THREE.BoxGeometry( 1000000, 1000000, 1000000 ),
            skyBoxMaterial
        );
    
        return skyBox;
    },

    options: {
        textureName: {
            name: 'texture',
            type: 'string',
            default: 'skybox',
            mandatory: true
        }
    }
});;
M.fx.shadersEngine.create("Atmosphere", {

	vertex: function() {
		if (window.asModule) {return '';}
		return [
			'varying vec3 vNormal;',
			'void main(){',
			'	// compute intensity',
			'	vNormal		= normalize( normalMatrix * normal );',
			'	// set gl_Position',
			'	gl_Position	= projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
			'}',
		].join('\n');
	},

	fragment: function() {
		if (window.asModule) {return '';}
		return [
			'uniform float coeficient;',
			'uniform float power;',
			'uniform vec3  glowColor;',

			'varying vec3  vNormal;',

			'void main(){',
			'	float intensity	= pow( coeficient - dot(vNormal, vec3(0.0, 0.0, 1.0)), power );',
			'	gl_FragColor	= vec4( glowColor * intensity, 1.0 );',
			'}',
		].join('\n');
	},

	uniforms: function() {
		if (window.asModule) {return {};}
		return {
			coeficient	: {
				type	: "f",
				value	: 1.0
			},
			power		: {
				type	: "f",
				value	: 2
			},
			glowColor	: {
				type	: "c",
				value	: new THREE.Color('pink')
			},
		};
	},

	options: (window.asModule) ? {} : {
		side: THREE.FrontSide,
		blending: THREE.AdditiveBlending,
		transparent: true,
		depthWrite: false,
	},

	attributes: {

	},
	
});
;
/**
 * @author Slayvin / http://slayvin.net
 */

M.fx.shadersEngine.create('Mirror', {

	uniforms: function() {
        return { 
            "mirrorColor": { type: "c", value: new THREE.Color( 0x7F7F7F ) },
			"mirrorSampler": { type: "t", value: null },
			"textureMatrix" : { type: "m4", value: new THREE.Matrix4() }
        };
	},

	vertex: function() {
        return [

            "uniform mat4 textureMatrix;",

            "varying vec4 mirrorCoord;",

            "void main() {",

                "vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
                "vec4 worldPosition = modelMatrix * vec4( position, 1.0 );",
                "mirrorCoord = textureMatrix * worldPosition;",

                "gl_Position = projectionMatrix * mvPosition;",

            "}"

        ].join( "\n" );
    },

	fragment: function() {
        return [

            "uniform vec3 mirrorColor;",
            "uniform sampler2D mirrorSampler;",

            "varying vec4 mirrorCoord;",

            "float blendOverlay(float base, float blend) {",
                "return( base < 0.5 ? ( 2.0 * base * blend ) : (1.0 - 2.0 * ( 1.0 - base ) * ( 1.0 - blend ) ) );",
            "}",

            "void main() {",

                "vec4 color = texture2DProj(mirrorSampler, mirrorCoord);",
                "color = vec4(blendOverlay(mirrorColor.r, color.r), blendOverlay(mirrorColor.g, color.g), blendOverlay(mirrorColor.b, color.b), 1.0);",

                "gl_FragColor = color;",

            "}"

        ].join( "\n" );
    },

    instance: (function() {

        var Mirror = function ( renderer, camera, scene, options ) {

            THREE.Object3D.call( this );

            this.name = 'mirror_' + this.id;

            options = options || {};

            this.matrixNeedsUpdate = true;

            var width = options.textureWidth !== undefined ? options.textureWidth : 512;
            var height = options.textureHeight !== undefined ? options.textureHeight : 512;

            this.clipBias = options.clipBias !== undefined ? options.clipBias : 0.0;

            var mirrorColor = options.color !== undefined ? new THREE.Color( options.color ) : new THREE.Color( 0x7F7F7F );

            this.renderer = renderer;
            this.mirrorPlane = new THREE.Plane();
            this.normal = new THREE.Vector3( 0, 0, 1 );
            this.mirrorWorldPosition = new THREE.Vector3();
            this.cameraWorldPosition = new THREE.Vector3();
            this.rotationMatrix = new THREE.Matrix4();
            this.lookAtPosition = new THREE.Vector3( 0, 0, - 1 );
            this.clipPlane = new THREE.Vector4();

            // For debug only, show the normal and plane of the mirror
            var debugMode = options.debugMode !== undefined ? options.debugMode : false;

            if ( debugMode ) {

                var arrow = new THREE.ArrowHelper( new THREE.Vector3( 0, 0, 1 ), new THREE.Vector3( 0, 0, 0 ), 10, 0xffff80 );
                var planeGeometry = new THREE.Geometry();
                planeGeometry.vertices.push( new THREE.Vector3( - 10, - 10, 0 ) );
                planeGeometry.vertices.push( new THREE.Vector3( 10, - 10, 0 ) );
                planeGeometry.vertices.push( new THREE.Vector3( 10, 10, 0 ) );
                planeGeometry.vertices.push( new THREE.Vector3( - 10, 10, 0 ) );
                planeGeometry.vertices.push( planeGeometry.vertices[ 0 ] );
                var plane = new THREE.Line( planeGeometry, new THREE.LineBasicMaterial( { color: 0xffff80 } ) );

                this.add( arrow );
                this.add( plane );

            }

            if ( camera instanceof THREE.PerspectiveCamera ) {

                this.camera = camera;

            } else {

                this.camera = new THREE.PerspectiveCamera();
                console.log( this.name + ': camera is not a Perspective Camera!' );

            }

            this.textureMatrix = new THREE.Matrix4();

            this.mirrorCamera = this.camera.clone();
            this.mirrorCamera.matrixAutoUpdate = true;

            var parameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };

            this.renderTarget = new THREE.WebGLRenderTarget( width, height, parameters );
            this.renderTarget2 = new THREE.WebGLRenderTarget( width, height, parameters );

            var mirrorShader = M.fx.shadersEngine.get('Mirror');
            var mirrorUniforms = THREE.UniformsUtils.clone( mirrorShader.uniforms() );

            this.material = new THREE.ShaderMaterial( {

                fragmentShader: mirrorShader.fragment(),
                vertexShader: mirrorShader.vertex(),
                uniforms: mirrorUniforms

            } );

            this.material.uniforms.mirrorSampler.value = this.renderTarget.texture;
            this.material.uniforms.mirrorColor.value = mirrorColor;
            this.material.uniforms.textureMatrix.value = this.textureMatrix;

            if ( ! THREE.Math.isPowerOfTwo( width ) || ! THREE.Math.isPowerOfTwo( height ) ) {

                this.renderTarget.texture.generateMipmaps = false;
                this.renderTarget2.texture.generateMipmaps = false;

            }

            this.updateTextureMatrix();
            this.render();

        };

        Mirror.prototype = Object.create(THREE.Object3D.prototype);
        Mirror.prototype.constructor = Mirror;

        Mirror.prototype.renderWithMirror = function(otherMirror) {

            // update the mirror matrix to mirror the current view
            this.updateTextureMatrix();
            this.matrixNeedsUpdate = false;

            // set the camera of the other mirror so the mirrored view is the reference view
            var tempCamera = otherMirror.camera;
            otherMirror.camera = this.mirrorCamera;

            // render the other mirror in temp texture
            otherMirror.renderTemp();
            otherMirror.material.uniforms.mirrorSampler.value = otherMirror.renderTarget2.texture;

            // render the current mirror
            this.render();
            this.matrixNeedsUpdate = true;

            // restore material and camera of other mirror
            otherMirror.material.uniforms.mirrorSampler.value = otherMirror.renderTarget.texture;
            otherMirror.camera = tempCamera;

            // restore texture matrix of other mirror
            otherMirror.updateTextureMatrix();

        };

        Mirror.prototype.updateTextureMatrix = function () {

            this.updateMatrixWorld();
            this.camera.updateMatrixWorld();

            this.mirrorWorldPosition.setFromMatrixPosition( this.matrixWorld );
            this.cameraWorldPosition.setFromMatrixPosition( this.camera.matrixWorld );

            this.rotationMatrix.extractRotation( this.matrixWorld );

            this.normal.set( 0, 0, 1 );
            this.normal.applyMatrix4( this.rotationMatrix );

            var view = this.mirrorWorldPosition.clone().sub( this.cameraWorldPosition );
            view.reflect( this.normal ).negate();
            view.add( this.mirrorWorldPosition );

            this.rotationMatrix.extractRotation( this.camera.matrixWorld );

            this.lookAtPosition.set( 0, 0, - 1 );
            this.lookAtPosition.applyMatrix4( this.rotationMatrix );
            this.lookAtPosition.add( this.cameraWorldPosition );

            var target = this.mirrorWorldPosition.clone().sub( this.lookAtPosition );
            target.reflect( this.normal ).negate();
            target.add( this.mirrorWorldPosition );

            this.up.set( 0, - 1, 0 );
            this.up.applyMatrix4( this.rotationMatrix );
            this.up.reflect( this.normal ).negate();

            this.mirrorCamera.position.copy( view );
            this.mirrorCamera.up = this.up;
            this.mirrorCamera.lookAt( target );

            this.mirrorCamera.updateProjectionMatrix();
            this.mirrorCamera.updateMatrixWorld();
            this.mirrorCamera.matrixWorldInverse.getInverse( this.mirrorCamera.matrixWorld );

            // Update the texture matrix
            this.textureMatrix.set( 0.5, 0.0, 0.0, 0.5,
                                    0.0, 0.5, 0.0, 0.5,
                                    0.0, 0.0, 0.5, 0.5,
                                    0.0, 0.0, 0.0, 1.0 );
            this.textureMatrix.multiply( this.mirrorCamera.projectionMatrix );
            this.textureMatrix.multiply( this.mirrorCamera.matrixWorldInverse );

            // Now update projection matrix with new clip plane, implementing code from: http://www.terathon.com/code/oblique.html
            // Paper explaining this technique: http://www.terathon.com/lengyel/Lengyel-Oblique.pdf
            this.mirrorPlane.setFromNormalAndCoplanarPoint( this.normal, this.mirrorWorldPosition );
            this.mirrorPlane.applyMatrix4( this.mirrorCamera.matrixWorldInverse );

            this.clipPlane.set( this.mirrorPlane.normal.x, this.mirrorPlane.normal.y, this.mirrorPlane.normal.z, this.mirrorPlane.constant );

            var q = new THREE.Vector4();
            var projectionMatrix = this.mirrorCamera.projectionMatrix;

            q.x = ( Math.sign( this.clipPlane.x ) + projectionMatrix.elements[ 8 ] ) / projectionMatrix.elements[ 0 ];
            q.y = ( Math.sign( this.clipPlane.y ) + projectionMatrix.elements[ 9 ] ) / projectionMatrix.elements[ 5 ];
            q.z = - 1.0;
            q.w = ( 1.0 + projectionMatrix.elements[ 10 ] ) / projectionMatrix.elements[ 14 ];

            // Calculate the scaled plane vector
            var c = new THREE.Vector4();
            c = this.clipPlane.multiplyScalar( 2.0 / this.clipPlane.dot( q ) );

            // Replacing the third row of the projection matrix
            projectionMatrix.elements[ 2 ] = c.x;
            projectionMatrix.elements[ 6 ] = c.y;
            projectionMatrix.elements[ 10 ] = c.z + 1.0 - this.clipBias;
            projectionMatrix.elements[ 14 ] = c.w;

        };

        Mirror.prototype.render = function () {

            if ( this.matrixNeedsUpdate ) this.updateTextureMatrix();

            this.matrixNeedsUpdate = true;

            // Render the mirrored view of the current scene into the target texture
            var scene = this;

            while ( scene.parent !== null ) {

                scene = scene.parent;

            }

            if ( scene !== undefined && scene instanceof THREE.Scene ) {

                // We can't render ourself to ourself
                var visible = this.material.visible;
                this.material.visible = false;

                this.renderer.render( scene, this.mirrorCamera, this.renderTarget, true );

                this.material.visible = visible;

            }

        };

        return Mirror;
    })()

});

// TODO: fix me;
;
/**
 * @author jbouny / https://github.com/jbouny
 *
 * Work based on :
 * @author Slayvin / http://slayvin.net : Flat mirror for three.js
 * @author Stemkoski / http://www.adelphi.edu/~stemkoski : An implementation of water shader based on the flat mirror
 * @author Jonas Wagner / http://29a.ch/ && http://29a.ch/slides/2012/webglwater/ : Water shader explanations in WebGL
 */

M.fx.shadersEngine.create('Water', {

	uniforms: function() {
        return THREE.UniformsUtils.merge( [
            THREE.UniformsLib[ "fog" ], {
                "normalSampler":    { type: "t", value: null },
                "mirrorSampler":    { type: "t", value: null },
                "alpha":            { type: "f", value: 1.0 },
                "time":             { type: "f", value: 0.0 },
                "distortionScale":  { type: "f", value: 20.0 },
                "noiseScale":       { type: "f", value: 1.0 },
                "textureMatrix" :   { type: "m4", value: new THREE.Matrix4() },
                "sunColor":         { type: "c", value: new THREE.Color( 0x7F7F7F ) },
                "sunDirection":     { type: "v3", value: new THREE.Vector3( 0.70707, 0.70707, 0 ) },
                "eye":              { type: "v3", value: new THREE.Vector3() },
                "waterColor":       { type: "c", value: new THREE.Color( 0x555555 ) }
            }
        ] )
    },

	vertex: function() {
        return [
            'uniform mat4 textureMatrix;',
            'uniform float time;',

            'varying vec4 mirrorCoord;',
            'varying vec3 worldPosition;',

            'void main()',
            '{',
            '	mirrorCoord = modelMatrix * vec4( position, 1.0 );',
            '	worldPosition = mirrorCoord.xyz;',
            '	mirrorCoord = textureMatrix * mirrorCoord;',
            '	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
            '}'
        ].join( '\n' );
    },

	fragment: function() {
        return [
            'precision highp float;',

            'uniform sampler2D mirrorSampler;',
            'uniform float alpha;',
            'uniform float time;',
            'uniform float distortionScale;',
            'uniform sampler2D normalSampler;',
            'uniform vec3 sunColor;',
            'uniform vec3 sunDirection;',
            'uniform vec3 eye;',
            'uniform vec3 waterColor;',

            'varying vec4 mirrorCoord;',
            'varying vec3 worldPosition;',

            'vec4 getNoise( vec2 uv )',
            '{',
            '	vec2 uv0 = ( uv / 103.0 ) + vec2(time / 17.0, time / 29.0);',
            '	vec2 uv1 = uv / 107.0-vec2( time / -19.0, time / 31.0 );',
            '	vec2 uv2 = uv / vec2( 8907.0, 9803.0 ) + vec2( time / 101.0, time / 97.0 );',
            '	vec2 uv3 = uv / vec2( 1091.0, 1027.0 ) - vec2( time / 109.0, time / -113.0 );',
            '	vec4 noise = texture2D( normalSampler, uv0 ) +',
            '		texture2D( normalSampler, uv1 ) +',
            '		texture2D( normalSampler, uv2 ) +',
            '		texture2D( normalSampler, uv3 );',
            '	return noise * 0.5 - 1.0;',
            '}',

            'void sunLight( const vec3 surfaceNormal, const vec3 eyeDirection, float shiny, float spec, float diffuse, inout vec3 diffuseColor, inout vec3 specularColor )',
            '{',
            '	vec3 reflection = normalize( reflect( -sunDirection, surfaceNormal ) );',
            '	float direction = max( 0.0, dot( eyeDirection, reflection ) );',
            '	specularColor += pow( direction, shiny ) * sunColor * spec;',
            '	diffuseColor += max( dot( sunDirection, surfaceNormal ), 0.0 ) * sunColor * diffuse;',
            '}',

            THREE.ShaderChunk[ "common" ],
            THREE.ShaderChunk[ "fog_pars_fragment" ],

            'void main()',
            '{',
            '	vec4 noise = getNoise( worldPosition.xz );',
            '	vec3 surfaceNormal = normalize( noise.xzy * vec3( 1.5, 1.0, 1.5 ) );',

            '	vec3 diffuseLight = vec3(0.0);',
            '	vec3 specularLight = vec3(0.0);',

            '	vec3 worldToEye = eye-worldPosition;',
            '	vec3 eyeDirection = normalize( worldToEye );',
            '	sunLight( surfaceNormal, eyeDirection, 100.0, 2.0, 0.5, diffuseLight, specularLight );',

            '	float distance = length(worldToEye);',

            '	vec2 distortion = surfaceNormal.xz * ( 0.001 + 1.0 / distance ) * distortionScale;',
            '	vec3 reflectionSample = vec3( texture2D( mirrorSampler, mirrorCoord.xy / mirrorCoord.z + distortion ) );',

            '	float theta = max( dot( eyeDirection, surfaceNormal ), 0.0 );',
            '	float rf0 = 0.3;',
            '	float reflectance = rf0 + ( 1.0 - rf0 ) * pow( ( 1.0 - theta ), 5.0 );',
            '	vec3 scatter = max( 0.0, dot( surfaceNormal, eyeDirection ) ) * waterColor;',
            '	vec3 albedo = mix( sunColor * diffuseLight * 0.3 + scatter, ( vec3( 0.1 ) + reflectionSample * 0.9 + reflectionSample * specularLight ), reflectance );',
            '	vec3 outgoingLight = albedo;',
                THREE.ShaderChunk[ "fog_fragment" ],
            '	gl_FragColor = vec4( outgoingLight, alpha );',
            '}'
        ].join( '\n' );
    },

    instance: (function(renderer, camera, scene, options) {

        var Water = function ( renderer, camera, scene, options ) {

            THREE.Object3D.call( this );
            this.name = 'water_' + this.id;

            function optionalParameter ( value, defaultValue ) {

                return value !== undefined ? value : defaultValue;

            }

            options = options || {};

            this.matrixNeedsUpdate = true;

            var width = optionalParameter( options.textureWidth, 512 );
            var height = optionalParameter( options.textureHeight, 512 );
            this.clipBias = optionalParameter( options.clipBias, 0.0 );
            this.alpha = optionalParameter( options.alpha, 1.0 );
            this.time = optionalParameter( options.time, 0.0 );
            this.normalSampler = optionalParameter( options.waterNormals, null );
            this.sunDirection = optionalParameter( options.sunDirection, new THREE.Vector3( 0.70707, 0.70707, 0.0 ) );
            this.sunColor = new THREE.Color( optionalParameter( options.sunColor, 0xffffff ) );
            this.waterColor = new THREE.Color( optionalParameter( options.waterColor, 0x7F7F7F ) );
            this.eye = optionalParameter( options.eye, new THREE.Vector3( 0, 0, 0 ) );
            this.distortionScale = optionalParameter( options.distortionScale, 20.0 );
            this.side = optionalParameter( options.side, THREE.FrontSide );
            this.fog = optionalParameter( options.fog, false );

            this.renderer = renderer;
            this.scene = scene;
            this.mirrorPlane = new THREE.Plane();
            this.normal = new THREE.Vector3( 0, 0, 1 );
            this.mirrorWorldPosition = new THREE.Vector3();
            this.cameraWorldPosition = new THREE.Vector3();
            this.rotationMatrix = new THREE.Matrix4();
            this.lookAtPosition = new THREE.Vector3( 0, 0, - 1 );
            this.clipPlane = new THREE.Vector4();

            if ( camera instanceof THREE.PerspectiveCamera ) {

                this.camera = camera;

            } else {

                this.camera = new THREE.PerspectiveCamera();
                console.log( this.name + ': camera is not a Perspective Camera!' );

            }

            this.textureMatrix = new THREE.Matrix4();

            this.mirrorCamera = this.camera.clone();

            this.renderTarget = new THREE.WebGLRenderTarget( width, height );
            this.renderTarget2 = new THREE.WebGLRenderTarget( width, height );

            var mirrorShader = M.fx.shadersEngine.get('Water');
            var mirrorUniforms = THREE.UniformsUtils.clone( mirrorShader.uniforms() );

            this.material = new THREE.ShaderMaterial( {
                fragmentShader: mirrorShader.fragment(),
                vertexShader: mirrorShader.vertex(),
                uniforms: mirrorUniforms,
                transparent: true,
                side: this.side,
                fog: this.fog
            } );

            this.material.uniforms.mirrorSampler.value = this.renderTarget.texture;
            this.material.uniforms.textureMatrix.value = this.textureMatrix;
            this.material.uniforms.alpha.value = this.alpha;
            this.material.uniforms.time.value = this.time;
            this.material.uniforms.normalSampler.value = this.normalSampler;
            this.material.uniforms.sunColor.value = this.sunColor;
            this.material.uniforms.waterColor.value = this.waterColor;
            this.material.uniforms.sunDirection.value = this.sunDirection;
            this.material.uniforms.distortionScale.value = this.distortionScale;

            this.material.uniforms.eye.value = this.eye;

            if ( ! THREE.Math.isPowerOfTwo( width ) || ! THREE.Math.isPowerOfTwo( height ) ) {

                this.renderTarget.texture.generateMipmaps = false;
                this.renderTarget.texture.minFilter = THREE.LinearFilter;
                this.renderTarget2.texture.generateMipmaps = false;
                this.renderTarget2.texture.minFilter = THREE.LinearFilter;

            }

            this.updateTextureMatrix();
            this.render();

        };

        Water.prototype = Object.create(M.fx.shadersEngine.get('Mirror').instance.prototype);
        //Water.prototype = Object.create(THREE.Object3D.prototype);
        Water.prototype.constructor = Water;

        Water.prototype.render = function () {

            if ( this.matrixNeedsUpdate ) this.updateTextureMatrix();

            this.matrixNeedsUpdate = true;

            // Render the mirrored view of the current scene into the target texture
            var scene = this;

            while ( scene.parent !== null ) {

                scene = scene.parent;

            }

            if ( scene !== undefined && scene instanceof THREE.Scene ) {
                // We can't render ourself to ourself
                var visible = this.material.visible;
                this.material.visible = false;

                this.renderer.render( scene, this.mirrorCamera, this.renderTarget, true );

                this.material.visible = visible;

            }

        };

        Water.prototype.updateTextureMatrix = function () {

            function sign( x ) {

                return x ? x < 0 ? - 1 : 1 : 0;

            }

            this.updateMatrixWorld();
            this.camera.updateMatrixWorld();

            this.mirrorWorldPosition.setFromMatrixPosition( this.matrixWorld );
            this.cameraWorldPosition.setFromMatrixPosition( this.camera.matrixWorld );

            this.rotationMatrix.extractRotation( this.matrixWorld );

            this.normal.set( 0, 0, 1 );
            this.normal.applyMatrix4( this.rotationMatrix );

            var view = this.mirrorWorldPosition.clone().sub( this.cameraWorldPosition );
            view.reflect( this.normal ).negate();
            view.add( this.mirrorWorldPosition );

            this.rotationMatrix.extractRotation( this.camera.matrixWorld );

            this.lookAtPosition.set( 0, 0, - 1 );
            this.lookAtPosition.applyMatrix4( this.rotationMatrix );
            this.lookAtPosition.add( this.cameraWorldPosition );

            var target = this.mirrorWorldPosition.clone().sub( this.lookAtPosition );
            target.reflect( this.normal ).negate();
            target.add( this.mirrorWorldPosition );

            this.up.set( 0, - 1, 0 );
            this.up.applyMatrix4( this.rotationMatrix );
            this.up.reflect( this.normal ).negate();

            this.mirrorCamera.position.copy( view );
            this.mirrorCamera.up = this.up;
            this.mirrorCamera.lookAt( target );

            this.mirrorCamera.updateProjectionMatrix();
            this.mirrorCamera.updateMatrixWorld();
            this.mirrorCamera.matrixWorldInverse.getInverse( this.mirrorCamera.matrixWorld );

            // Update the texture matrix
            this.textureMatrix.set( 0.5, 0.0, 0.0, 0.5,
                                    0.0, 0.5, 0.0, 0.5,
                                    0.0, 0.0, 0.5, 0.5,
                                    0.0, 0.0, 0.0, 1.0 );
            this.textureMatrix.multiply( this.mirrorCamera.projectionMatrix );
            this.textureMatrix.multiply( this.mirrorCamera.matrixWorldInverse );

            // Now update projection matrix with new clip plane, implementing code from: http://www.terathon.com/code/oblique.html
            // Paper explaining this technique: http://www.terathon.com/lengyel/Lengyel-Oblique.pdf
            this.mirrorPlane.setFromNormalAndCoplanarPoint( this.normal, this.mirrorWorldPosition );
            this.mirrorPlane.applyMatrix4( this.mirrorCamera.matrixWorldInverse );

            this.clipPlane.set( this.mirrorPlane.normal.x, this.mirrorPlane.normal.y, this.mirrorPlane.normal.z, this.mirrorPlane.constant );

            var q = new THREE.Vector4();
            var projectionMatrix = this.mirrorCamera.projectionMatrix;

            q.x = ( Math.sign( this.clipPlane.x ) + projectionMatrix.elements[ 8 ] ) / projectionMatrix.elements[ 0 ];
            q.y = ( Math.sign( this.clipPlane.y ) + projectionMatrix.elements[ 9 ] ) / projectionMatrix.elements[ 5 ];
            q.z = - 1.0;
            q.w = ( 1.0 + projectionMatrix.elements[ 10 ] ) / projectionMatrix.elements[ 14 ];

            // Calculate the scaled plane vector
            var c = new THREE.Vector4();
            c = this.clipPlane.multiplyScalar( 2.0 / this.clipPlane.dot( q ) );

            // Replacing the third row of the projection matrix
            projectionMatrix.elements[ 2 ] = c.x;
            projectionMatrix.elements[ 6 ] = c.y;
            projectionMatrix.elements[ 10 ] = c.z + 1.0 - this.clipBias;
            projectionMatrix.elements[ 14 ] = c.w;

        };

        return function(renderer, camera, scene, options) {
            var waterNormals = options.texture || M.imagesEngine.get(options.textureNormalName || 'waterNormal');
            waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;


            var water = new Water(renderer, camera, scene, {
                textureWidth: 512,//options.textureWidth || 512,
                textureHeight: 512, //options.textureHeight || 512,
                waterNormals: waterNormals,
                alpha: 1.0, //options.alpha || 1.0,
                sunDirection: new THREE.Vector3(-0.5773502691896258,0.5773502691896258, -0.5773502691896258),//options.light ? options.light.position.clone().normalize() : new THREE.Vector3( - 1, 1, - 1).normalize(),
                sunColor: 0xffffff,//options.sunColor || 0xffffff,
                waterColor: 0x001e0f, //options.waterColor || 0x001e0f,
                distortionScale: 50.0 //options.distortionScale || 50.0
            });

            var mirrorMesh = new THREE.Mesh(
                new THREE.PlaneBufferGeometry( options.width * 500, options.height * 500 ),
                water.material
            );

            mirrorMesh.add(water);
            mirrorMesh.rotation.x = - Math.PI * 0.5;

            mirrorMesh.render = function() {
                water.material.uniforms.time.value += 1.0 / 60.0;
                water.render();
            };

            return mirrorMesh;
        }
    })(),

    options: {
        textureWidth: {
            name: 'texture width',
            type: 'number',
            default: 512,
            mandatory: true
        },
        textureHeight: {
            name: 'texture height',
            type: 'number',
            default: 512,
            mandatory: true
        },
        textureNormalName: {
            name: 'texture normal',
            type: 'string',
            default: 'waterNormal',
            mandatory: false
        },
        sunColor: {
            name: 'sun color',
            type: 'color',
            default: '0xffffff',
            mandatory: true
        },
        waterColor: {
            name: 'water color',
            type: 'color',
            default: '0x001e0',
            mandatory: true
        },
        distortionScale: {
            name: 'distortion scale',
            type: 'color',
            default: 50.0,
            mandatory: true
        },
        alpha: {
            name: 'alpha',
            type: 'number',
            default: 1.0,
            mandatory: true
        },
        width: {
            name: 'width',
            type: 'number',
            default: 2000,
            mandatory: true
        },
        height: {
            name: 'height',
            type: 'number',
            default: 2000,
            mandatory: true
        }
    }
});;
M.fx.shadersEngine.create('OceanMain', {
	
    uniforms: function() { 
        return {
            "u_displacementMap": { type: "t", value: null },
            "u_normalMap": { type: "t", value: null },
            "u_geometrySize": { type: "f", value: null },
            "u_size": { type: "f", value: null },
            "u_projectionMatrix": { type: "m4", value: null },
            "u_viewMatrix": { type: "m4", value: null },
            "u_cameraPosition": { type: "v3", value: null },
            "u_skyColor": { type: "v3", value: null },
            "u_oceanColor": { type: "v3", value: null },
            "u_sunDirection": { type: "v3", value: null },
            "u_exposure": { type: "f", value: null },
        }
    },
	varying: function() {
       return {
            "vPos": { type: "v3" },
            "vUV": { type: "v2" }
        }
    },
	vertex: function() {
        return [
            'precision highp float;',

            'varying vec3 vPos;',
            'varying vec2 vUV;',

            'uniform mat4 u_projectionMatrix;',
            'uniform mat4 u_viewMatrix;',
            'uniform float u_size;',
            'uniform float u_geometrySize;',
            'uniform sampler2D u_displacementMap;',

            'void main (void) {',
                'vec3 newPos = position + texture2D(u_displacementMap, uv).rgb * (u_geometrySize / u_size);',
                'vPos = newPos;',
                'vUV = uv;',
                'gl_Position = u_projectionMatrix * u_viewMatrix * vec4(newPos, 1.0);',
            '}'
        ].join( '\n' )
    },

	fragment: function() {
        return [
            'precision highp float;',

            'varying vec3 vPos;',
            'varying vec2 vUV;',

            'uniform sampler2D u_displacementMap;',
            'uniform sampler2D u_normalMap;',
            'uniform vec3 u_cameraPosition;',
            'uniform vec3 u_oceanColor;',
            'uniform vec3 u_skyColor;',
            'uniform vec3 u_sunDirection;',
            'uniform float u_exposure;',

            'vec3 hdr (vec3 color, float exposure) {',
                'return 1.0 - exp(-color * exposure);',
            '}',

            'void main (void) {',
                'vec3 normal = texture2D(u_normalMap, vUV).rgb;',

                'vec3 view = normalize(u_cameraPosition - vPos);',
                'float fresnel = 0.02 + 0.98 * pow(1.0 - dot(normal, view), 5.0);',
                'vec3 sky = fresnel * u_skyColor;',

                'float diffuse = clamp(dot(normal, normalize(u_sunDirection)), 0.0, 1.0);',
                'vec3 water = (1.0 - fresnel) * u_oceanColor * u_skyColor * diffuse;',

                'vec3 color = sky + water;',

                'gl_FragColor = vec4(hdr(color, u_exposure), 1.0);',
            '}'
        ].join( '\n' )
    }
});

M.fx.shadersEngine.create('OceanNormals', {
	uniforms: function() { 
        return {
            "u_displacementMap": { type: "t", value: null },
            "u_resolution": { type: "f", value: null },
            "u_size": { type: "f", value: null },
        }
    },

	varying: function() {
        return {
            "vUV": { type: "v2" }
        }
    },

	fragment: function() {
        return [
            'precision highp float;',

            'varying vec2 vUV;',

            'uniform sampler2D u_displacementMap;',
            'uniform float u_resolution;',
            'uniform float u_size;',

            'void main (void) {',
                'float texel = 1.0 / u_resolution;',
                'float texelSize = u_size / u_resolution;',

                'vec3 center = texture2D(u_displacementMap, vUV).rgb;',
                'vec3 right = vec3(texelSize, 0.0, 0.0) + texture2D(u_displacementMap, vUV + vec2(texel, 0.0)).rgb - center;',
                'vec3 left = vec3(-texelSize, 0.0, 0.0) + texture2D(u_displacementMap, vUV + vec2(-texel, 0.0)).rgb - center;',
                'vec3 top = vec3(0.0, 0.0, -texelSize) + texture2D(u_displacementMap, vUV + vec2(0.0, -texel)).rgb - center;',
                'vec3 bottom = vec3(0.0, 0.0, texelSize) + texture2D(u_displacementMap, vUV + vec2(0.0, texel)).rgb - center;',

                'vec3 topRight = cross(right, top);',
                'vec3 topLeft = cross(top, left);',
                'vec3 bottomLeft = cross(left, bottom);',
                'vec3 bottomRight = cross(bottom, right);',

                'gl_FragColor = vec4(normalize(topRight + topLeft + bottomLeft + bottomRight), 1.0);',
            '}'
        ].join( '\n' )
    }
});

M.fx.shadersEngine.create('OceanSpectrum', {
	uniforms: function() {
        return {
            "u_size": { type: "f", value: null },
            "u_resolution": { type: "f", value: null },
            "u_choppiness": { type: "f", value: null },
            "u_phases": { type: "t", value: null },
            "u_initialSpectrum": { type: "t", value: null },
        }
    },

	varying: function() { 
        return {
            "vUV": { type: "v2" }
        }
    },

	fragment: function()  {
        return [
            'precision highp float;',
            '#include <common>',

            'const float G = 9.81;',
            'const float KM = 370.0;',

            'varying vec2 vUV;',

            'uniform float u_size;',
            'uniform float u_resolution;',
            'uniform float u_choppiness;',
            'uniform sampler2D u_phases;',
            'uniform sampler2D u_initialSpectrum;',

            'vec2 multiplyComplex (vec2 a, vec2 b) {',
                'return vec2(a[0] * b[0] - a[1] * b[1], a[1] * b[0] + a[0] * b[1]);',
            '}',

            'vec2 multiplyByI (vec2 z) {',
                'return vec2(-z[1], z[0]);',
            '}',

            'float omega (float k) {',
                'return sqrt(G * k * (1.0 + k * k / KM * KM));',
            '}',

            'void main (void) {',
                'vec2 coordinates = gl_FragCoord.xy - 0.5;',
                'float n = (coordinates.x < u_resolution * 0.5) ? coordinates.x : coordinates.x - u_resolution;',
                'float m = (coordinates.y < u_resolution * 0.5) ? coordinates.y : coordinates.y - u_resolution;',
                'vec2 waveVector = (2.0 * PI * vec2(n, m)) / u_size;',

                'float phase = texture2D(u_phases, vUV).r;',
                'vec2 phaseVector = vec2(cos(phase), sin(phase));',

                'vec2 h0 = texture2D(u_initialSpectrum, vUV).rg;',
                'vec2 h0Star = texture2D(u_initialSpectrum, vec2(1.0 - vUV + 1.0 / u_resolution)).rg;',
                'h0Star.y *= -1.0;',

                'vec2 h = multiplyComplex(h0, phaseVector) + multiplyComplex(h0Star, vec2(phaseVector.x, -phaseVector.y));',

                'vec2 hX = -multiplyByI(h * (waveVector.x / length(waveVector))) * u_choppiness;',
                'vec2 hZ = -multiplyByI(h * (waveVector.y / length(waveVector))) * u_choppiness;',

                //no DC term
                'if (waveVector.x == 0.0 && waveVector.y == 0.0) {',
                    'h = vec2(0.0);',
                    'hX = vec2(0.0);',
                    'hZ = vec2(0.0);',
                '}',

                'gl_FragColor = vec4(hX + multiplyByI(h), hZ);',
            '}'
        ].join( '\n' )
    }
});

M.fx.shadersEngine.create('OceanPhase', {
    uniforms: function() {
        return {
            "u_phases": { type: "t", value: null },
            "u_deltaTime": { type: "f", value: null },
            "u_resolution": { type: "f", value: null },
            "u_size": { type: "f", value: null },
        }
    },
	varying: function() {
        return {
            "vUV": { type: "v2" }
        }
    },
	fragment: function() {
        return [
            'precision highp float;',
            '#include <common>',

            'const float G = 9.81;',
            'const float KM = 370.0;',

            'varying vec2 vUV;',

            'uniform sampler2D u_phases;',
            'uniform float u_deltaTime;',
            'uniform float u_resolution;',
            'uniform float u_size;',

            'float omega (float k) {',
                'return sqrt(G * k * (1.0 + k * k / KM * KM));',
            '}',

            'void main (void) {',
                'float deltaTime = 1.0 / 60.0;',
                'vec2 coordinates = gl_FragCoord.xy - 0.5;',
                'float n = (coordinates.x < u_resolution * 0.5) ? coordinates.x : coordinates.x - u_resolution;',
                'float m = (coordinates.y < u_resolution * 0.5) ? coordinates.y : coordinates.y - u_resolution;',
                'vec2 waveVector = (2.0 * PI * vec2(n, m)) / u_size;',

                'float phase = texture2D(u_phases, vUV).r;',
                'float deltaPhase = omega(length(waveVector)) * u_deltaTime;',
                'phase = mod(phase + deltaPhase, 2.0 * PI);',

                'gl_FragColor = vec4(phase, 0.0, 0.0, 0.0);',
            '}'
        ].join( '\n' )
    }
});

M.fx.shadersEngine.create('OceanInitialSpectrum', {
    uniforms: function() {
        return {
            "u_wind": { type: "v2", value: new THREE.Vector2( 10.0, 10.0 ) },
            "u_resolution": { type: "f", value: 512.0 },
            "u_size": { type: "f", value: 250.0 },
        }
    },

	fragment: function() {
        return [
            'precision highp float;',
            '#include <common>',

            'const float G = 9.81;',
            'const float KM = 370.0;',
            'const float CM = 0.23;',

            'uniform vec2 u_wind;',
            'uniform float u_resolution;',
            'uniform float u_size;',

            'float omega (float k) {',
                'return sqrt(G * k * (1.0 + pow2(k / KM)));',
            '}',

            'float tanh (float x) {',
                'return (1.0 - exp(-2.0 * x)) / (1.0 + exp(-2.0 * x));',
            '}',

            'void main (void) {',
                'vec2 coordinates = gl_FragCoord.xy - 0.5;',

                'float n = (coordinates.x < u_resolution * 0.5) ? coordinates.x : coordinates.x - u_resolution;',
                'float m = (coordinates.y < u_resolution * 0.5) ? coordinates.y : coordinates.y - u_resolution;',

                'vec2 K = (2.0 * PI * vec2(n, m)) / u_size;',
                'float k = length(K);',

                'float l_wind = length(u_wind);',

                'float Omega = 0.84;',
                'float kp = G * pow2(Omega / l_wind);',

                'float c = omega(k) / k;',
                'float cp = omega(kp) / kp;',

                'float Lpm = exp(-1.25 * pow2(kp / k));',
                'float gamma = 1.7;',
                'float sigma = 0.08 * (1.0 + 4.0 * pow(Omega, -3.0));',
                'float Gamma = exp(-pow2(sqrt(k / kp) - 1.0) / 2.0 * pow2(sigma));',
                'float Jp = pow(gamma, Gamma);',
                'float Fp = Lpm * Jp * exp(-Omega / sqrt(10.0) * (sqrt(k / kp) - 1.0));',
                'float alphap = 0.006 * sqrt(Omega);',
                'float Bl = 0.5 * alphap * cp / c * Fp;',

                'float z0 = 0.000037 * pow2(l_wind) / G * pow(l_wind / cp, 0.9);',
                'float uStar = 0.41 * l_wind / log(10.0 / z0);',
                'float alpham = 0.01 * ((uStar < CM) ? (1.0 + log(uStar / CM)) : (1.0 + 3.0 * log(uStar / CM)));',
                'float Fm = exp(-0.25 * pow2(k / KM - 1.0));',
                'float Bh = 0.5 * alpham * CM / c * Fm * Lpm;',

                'float a0 = log(2.0) / 4.0;',
                'float am = 0.13 * uStar / CM;',
                'float Delta = tanh(a0 + 4.0 * pow(c / cp, 2.5) + am * pow(CM / c, 2.5));',

                'float cosPhi = dot(normalize(u_wind), normalize(K));',

                'float S = (1.0 / (2.0 * PI)) * pow(k, -4.0) * (Bl + Bh) * (1.0 + Delta * (2.0 * cosPhi * cosPhi - 1.0));',

                'float dk = 2.0 * PI / u_size;',
                'float h = sqrt(S / 2.0) * dk;',

                'if (K.x == 0.0 && K.y == 0.0) {',
                    'h = 0.0;', //no DC term
                '}',
                'gl_FragColor = vec4(h, 0.0, 0.0, 0.0);',
            '}'
        ].join( '\n' )
    }
});

M.fx.shadersEngine.create('OceanSubtransform', {
    uniforms: function() {
        return {
            "u_input": { type: "t", value: null },
            "u_transformSize": { type: "f", value: 512.0 },
            "u_subtransformSize": { type: "f", value: 250.0 }
        }
    },
	varying: function() {
        return {
            "vUV": { type: "v2" }
        }
    },
	fragment: function() {
        return [
            //GPU FFT using a Stockham formulation

            'precision highp float;',
            '#include <common>',

            'uniform sampler2D u_input;',
            'uniform float u_transformSize;',
            'uniform float u_subtransformSize;',

            'varying vec2 vUV;',

            'vec2 multiplyComplex (vec2 a, vec2 b) {',
                'return vec2(a[0] * b[0] - a[1] * b[1], a[1] * b[0] + a[0] * b[1]);',
            '}',

            'void main (void) {',
                '#ifdef HORIZONTAL',
                'float index = vUV.x * u_transformSize - 0.5;',
                '#else',
                'float index = vUV.y * u_transformSize - 0.5;',
                '#endif',

                'float evenIndex = floor(index / u_subtransformSize) * (u_subtransformSize * 0.5) + mod(index, u_subtransformSize * 0.5);',

                //transform two complex sequences simultaneously
                '#ifdef HORIZONTAL',
                'vec4 even = texture2D(u_input, vec2(evenIndex + 0.5, gl_FragCoord.y) / u_transformSize).rgba;',
                'vec4 odd = texture2D(u_input, vec2(evenIndex + u_transformSize * 0.5 + 0.5, gl_FragCoord.y) / u_transformSize).rgba;',
                '#else',
                'vec4 even = texture2D(u_input, vec2(gl_FragCoord.x, evenIndex + 0.5) / u_transformSize).rgba;',
                'vec4 odd = texture2D(u_input, vec2(gl_FragCoord.x, evenIndex + u_transformSize * 0.5 + 0.5) / u_transformSize).rgba;',
                '#endif',

                'float twiddleArgument = -2.0 * PI * (index / u_subtransformSize);',
                'vec2 twiddle = vec2(cos(twiddleArgument), sin(twiddleArgument));',

                'vec2 outputA = even.xy + multiplyComplex(twiddle, odd.xy);',
                'vec2 outputB = even.zw + multiplyComplex(twiddle, odd.zw);',

                'gl_FragColor = vec4(outputA, outputB);',
            '}'
        ].join( '\n' )
    }
})

M.fx.shadersEngine.create('OceanSimVertex', {
    varying: function() {
        return {
            "vUV": { type: "v2" }
        }
    },
	vertex: function() {
        return [
            'varying vec2 vUV;',

            'void main (void) {',
                'vUV = position.xy * 0.5 + 0.5;',
                'gl_Position = vec4(position, 1.0 );',
            '}'
        ].join( '\n' )
    }
});;
M.fx.shadersEngine.create('Ocean', {
    instance: (function() {
        var Ocean = function ( renderer, camera, scene, options ) {

            // flag used to trigger parameter changes
            this.changed = true;
            this.initial = true;

            // Assign required parameters as object properties
            this.oceanCamera = new THREE.OrthographicCamera(); //camera.clone();
            this.oceanCamera.position.z = 1;
            this.renderer = renderer;
            this.renderer.clearColor( 0xffffff );

            this.scene = new THREE.Scene();

            // Assign optional parameters as variables and object properties
            function optionalParameter( value, defaultValue ) {

                return value !== undefined ? value : defaultValue;

            }
            options = options || {};
            this.clearColor = optionalParameter( options.CLEAR_COLOR, [ 1.0, 1.0, 1.0, 0.0 ] );
            this.geometryOrigin = optionalParameter( options.GEOMETRY_ORIGIN, [ - 1000.0, - 1000.0 ] );
            this.sunDirectionX = optionalParameter( options.SUN_DIRECTION[ 0 ], - 1.0 );
            this.sunDirectionY = optionalParameter( options.SUN_DIRECTION[ 1 ], 1.0 );
            this.sunDirectionZ = optionalParameter( options.SUN_DIRECTION[ 2 ], 1.0 );
            this.oceanColor = optionalParameter( options.OCEAN_COLOR, new THREE.Vector3( 0.004, 0.016, 0.047 ) );
            this.skyColor = optionalParameter( options.SKY_COLOR, new THREE.Vector3( 3.2, 9.6, 12.8 ) );
            this.exposure = optionalParameter( options.EXPOSURE, 0.35 );
            this.geometryResolution = optionalParameter( options.GEOMETRY_RESOLUTION, 32 );
            this.geometrySize = optionalParameter( options.GEOMETRY_SIZE, 2000 );
            this.resolution = optionalParameter( options.RESOLUTION, 64 );
            this.floatSize = optionalParameter( options.SIZE_OF_FLOAT, 4 );
            this.windX = optionalParameter( options.INITIAL_WIND[ 0 ], 10.0 ),
            this.windY = optionalParameter( options.INITIAL_WIND[ 1 ], 10.0 ),
            this.size = optionalParameter( options.INITIAL_SIZE, 250.0 ),
            this.choppiness = optionalParameter( options.INITIAL_CHOPPINESS, 1.5 );

            //
            this.matrixNeedsUpdate = false;

            // Setup framebuffer pipeline
            var renderTargetType = optionalParameter( options.USE_HALF_FLOAT, false ) ? THREE.HalfFloatType : THREE.FloatType;
            var LinearClampParams = {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                wrapS: THREE.ClampToEdgeWrapping,
                wrapT: THREE.ClampToEdgeWrapping,
                format: THREE.RGBAFormat,
                stencilBuffer: false,
                depthBuffer: false,
                premultiplyAlpha: false,
                type: renderTargetType
            };
            var NearestClampParams = {
                minFilter: THREE.NearestFilter,
                magFilter: THREE.NearestFilter,
                wrapS: THREE.ClampToEdgeWrapping,
                wrapT: THREE.ClampToEdgeWrapping,
                format: THREE.RGBAFormat,
                stencilBuffer: false,
                depthBuffer: false,
                premultiplyAlpha: false,
                type: renderTargetType
            };
            var NearestRepeatParams = {
                minFilter: THREE.NearestFilter,
                magFilter: THREE.NearestFilter,
                wrapS: THREE.RepeatWrapping,
                wrapT: THREE.RepeatWrapping,
                format: THREE.RGBAFormat,
                stencilBuffer: false,
                depthBuffer: false,
                premultiplyAlpha: false,
                type: renderTargetType
            };
            this.initialSpectrumFramebuffer = new THREE.WebGLRenderTarget( this.resolution, this.resolution, NearestRepeatParams );
            this.spectrumFramebuffer = new THREE.WebGLRenderTarget( this.resolution, this.resolution, NearestClampParams );
            this.pingPhaseFramebuffer = new THREE.WebGLRenderTarget( this.resolution, this.resolution, NearestClampParams );
            this.pongPhaseFramebuffer = new THREE.WebGLRenderTarget( this.resolution, this.resolution, NearestClampParams );
            this.pingTransformFramebuffer = new THREE.WebGLRenderTarget( this.resolution, this.resolution, NearestClampParams );
            this.pongTransformFramebuffer = new THREE.WebGLRenderTarget( this.resolution, this.resolution, NearestClampParams );
            this.displacementMapFramebuffer = new THREE.WebGLRenderTarget( this.resolution, this.resolution, LinearClampParams );
            this.normalMapFramebuffer = new THREE.WebGLRenderTarget( this.resolution, this.resolution, LinearClampParams );

            // Define shaders and constant uniforms
            ////////////////////////////////////////

            // 0 - The vertex shader used in all of the simulation steps
            var fullscreeenVertexShader = M.fx.shadersEngine.get('OceanSimVertex');

            // 1 - Horizontal wave vertices used for FFT
            var oceanHorizontalShader = M.fx.shadersEngine.get('OceanSubtransform');
            var oceanHorizontalUniforms = THREE.UniformsUtils.clone( oceanHorizontalShader.uniforms() );
            this.materialOceanHorizontal = new THREE.ShaderMaterial( {
                uniforms: oceanHorizontalUniforms,
                vertexShader: fullscreeenVertexShader.vertex(),
                fragmentShader: "#define HORIZONTAL \n" + oceanHorizontalShader.fragment()
            } );
            this.materialOceanHorizontal.uniforms.u_transformSize = { type: "f", value: this.resolution };
            this.materialOceanHorizontal.uniforms.u_subtransformSize = { type: "f", value: null };
            this.materialOceanHorizontal.uniforms.u_input = { type: "t", value: null };
            this.materialOceanHorizontal.depthTest = false;

            // 2 - Vertical wave vertices used for FFT
            var oceanVerticalShader = M.fx.shadersEngine.get('OceanSubtransform');
            var oceanVerticalUniforms = THREE.UniformsUtils.clone( oceanVerticalShader.uniforms() );
            this.materialOceanVertical = new THREE.ShaderMaterial( {
                uniforms: oceanVerticalUniforms,
                vertexShader: fullscreeenVertexShader.vertex(),
                fragmentShader: oceanVerticalShader.fragment()
            } );
            this.materialOceanVertical.uniforms.u_transformSize = { type: "f", value: this.resolution };
            this.materialOceanVertical.uniforms.u_subtransformSize = { type: "f", value: null };
            this.materialOceanVertical.uniforms.u_input = { type: "t", value: null };
            this.materialOceanVertical.depthTest = false;

            // 3 - Initial spectrum used to generate height map
            var initialSpectrumShader = M.fx.shadersEngine.get('OceanInitialSpectrum');
            var initialSpectrumUniforms = THREE.UniformsUtils.clone( initialSpectrumShader.uniforms() );
            this.materialInitialSpectrum = new THREE.ShaderMaterial( {
                uniforms: initialSpectrumUniforms,
                vertexShader: fullscreeenVertexShader.vertex(),
                fragmentShader: initialSpectrumShader.fragment()
            } );
            this.materialInitialSpectrum.uniforms.u_wind = { type: "v2", value: new THREE.Vector2() };
            this.materialInitialSpectrum.uniforms.u_resolution = { type: "f", value: this.resolution };
            this.materialInitialSpectrum.depthTest = false;

            // 4 - Phases used to animate heightmap
            var phaseShader = M.fx.shadersEngine.get('OceanPhase');
            var phaseUniforms = THREE.UniformsUtils.clone( phaseShader.uniforms() );
            this.materialPhase = new THREE.ShaderMaterial( {
                uniforms: phaseUniforms,
                vertexShader: fullscreeenVertexShader.vertex(),
                fragmentShader: phaseShader.fragment()
            } );
            this.materialPhase.uniforms.u_resolution = { type: "f", value: this.resolution };
            this.materialPhase.depthTest = false;

            // 5 - Shader used to update spectrum
            var spectrumShader = M.fx.shadersEngine.get('OceanSpectrum');
            var spectrumUniforms = THREE.UniformsUtils.clone( spectrumShader.uniforms() );
            this.materialSpectrum = new THREE.ShaderMaterial( {
                uniforms: spectrumUniforms,
                vertexShader: fullscreeenVertexShader.vertex(),
                fragmentShader: spectrumShader.fragment()
            } );
            this.materialSpectrum.uniforms.u_initialSpectrum = { type: "t", value: null };
            this.materialSpectrum.uniforms.u_resolution = { type: "f", value: this.resolution };
            this.materialSpectrum.depthTest = false;

            // 6 - Shader used to update spectrum normals
            var normalShader = M.fx.shadersEngine.get('OceanNormals');
            var normalUniforms = THREE.UniformsUtils.clone( normalShader.uniforms() );
            this.materialNormal = new THREE.ShaderMaterial( {
                uniforms: normalUniforms,
                vertexShader: fullscreeenVertexShader.vertex(),
                fragmentShader: normalShader.fragment()
            } );
            this.materialNormal.uniforms.u_displacementMap = { type: "t", value: null };
            this.materialNormal.uniforms.u_resolution = { type: "f", value: this.resolution };
            this.materialNormal.depthTest = false;

            // 7 - Shader used to update normals
            var oceanShader = M.fx.shadersEngine.get('OceanMain');
            var oceanUniforms = THREE.UniformsUtils.clone( oceanShader.uniforms() );
            this.materialOcean = new THREE.ShaderMaterial( {
                uniforms: oceanUniforms,
                vertexShader: oceanShader.vertex(),
                fragmentShader: oceanShader.fragment()
            } );
            // this.materialOcean.wireframe = true;
            this.materialOcean.uniforms.u_geometrySize = { type: "f", value: this.resolution };
            this.materialOcean.uniforms.u_displacementMap = { type: "t", value: this.displacementMapFramebuffer.texture };
            this.materialOcean.uniforms.u_normalMap = { type: "t", value: this.normalMapFramebuffer.texture };
            this.materialOcean.uniforms.u_oceanColor = { type: "v3", value: this.oceanColor };
            this.materialOcean.uniforms.u_skyColor = { type: "v3", value: this.skyColor };
            this.materialOcean.uniforms.u_sunDirection = { type: "v3", value: new THREE.Vector3( this.sunDirectionX, this.sunDirectionY, this.sunDirectionZ ) };
            this.materialOcean.uniforms.u_exposure = { type: "f", value: this.exposure };

            // Disable blending to prevent default premultiplied alpha values
            this.materialOceanHorizontal.blending = 0;
            this.materialOceanVertical.blending = 0;
            this.materialInitialSpectrum.blending = 0;
            this.materialPhase.blending = 0;
            this.materialSpectrum.blending = 0;
            this.materialNormal.blending = 0;
            this.materialOcean.blending = 0;

            // Create the simulation plane
            this.screenQuad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ) );
            this.scene.add( this.screenQuad );

            // Initialise spectrum data
            this.generateSeedPhaseTexture();

            // Generate the ocean mesh
            this.generateMesh();

        };

        Ocean.prototype.generateMesh = function () {

            var geometry = new THREE.PlaneBufferGeometry( this.geometrySize, this.geometrySize, this.geometryResolution, this.geometryResolution );

            geometry.rotateX( - Math.PI / 2 );

            this.oceanMesh = new THREE.Mesh( geometry, this.materialOcean );

        };

        Ocean.prototype.update = function () {

            this.scene.overrideMaterial = null;

            if ( this.changed )
                this.renderInitialSpectrum();

            this.renderWavePhase();
            this.renderSpectrum();
            this.renderSpectrumFFT();
            this.renderNormalMap();
            this.scene.overrideMaterial = null;

        };

        Ocean.prototype.generateSeedPhaseTexture = function() {

            // Setup the seed texture
            this.pingPhase = true;
            var phaseArray = new Float32Array( this.resolution * this.resolution * 4 );
            for ( var i = 0; i < this.resolution; i ++ ) {

                for ( var j = 0; j < this.resolution; j ++ ) {

                    phaseArray[ i * this.resolution * 4 + j * 4 ] =  Math.random() * 2.0 * Math.PI;
                    phaseArray[ i * this.resolution * 4 + j * 4 + 1 ] = 0.0;
                    phaseArray[ i * this.resolution * 4 + j * 4 + 2 ] = 0.0;
                    phaseArray[ i * this.resolution * 4 + j * 4 + 3 ] = 0.0;

                }

            }

            this.pingPhaseTexture = new THREE.DataTexture( phaseArray, this.resolution, this.resolution, THREE.RGBAFormat );
            this.pingPhaseTexture.wrapS = THREE.ClampToEdgeWrapping;
            this.pingPhaseTexture.wrapT = THREE.ClampToEdgeWrapping;
            this.pingPhaseTexture.type = THREE.FloatType;
            this.pingPhaseTexture.needsUpdate = true;

        };

        Ocean.prototype.renderInitialSpectrum = function () {

            this.scene.overrideMaterial = this.materialInitialSpectrum;
            this.materialInitialSpectrum.uniforms.u_wind.value.set( this.windX, this.windY );
            this.materialInitialSpectrum.uniforms.u_size.value = this.size;
            this.renderer.render( this.scene, this.oceanCamera, this.initialSpectrumFramebuffer, true );

        };

        Ocean.prototype.renderWavePhase = function () {

            this.scene.overrideMaterial = this.materialPhase;
            this.screenQuad.material = this.materialPhase;
            if ( this.initial ) {

                this.materialPhase.uniforms.u_phases.value = this.pingPhaseTexture;
                this.initial = false;

            }else {

                this.materialPhase.uniforms.u_phases.value = this.pingPhase ? this.pingPhaseFramebuffer.texture : this.pongPhaseFramebuffer.texture;

            }
            this.materialPhase.uniforms.u_deltaTime.value = this.deltaTime;
            this.materialPhase.uniforms.u_size.value = this.size;
            this.renderer.render( this.scene, this.oceanCamera, this.pingPhase ? this.pongPhaseFramebuffer : this.pingPhaseFramebuffer );
            this.pingPhase = ! this.pingPhase;

        };

        Ocean.prototype.renderSpectrum = function () {

            this.scene.overrideMaterial = this.materialSpectrum;
            this.materialSpectrum.uniforms.u_initialSpectrum.value = this.initialSpectrumFramebuffer.texture;
            this.materialSpectrum.uniforms.u_phases.value = this.pingPhase ? this.pingPhaseFramebuffer.texture : this.pongPhaseFramebuffer.texture;
            this.materialSpectrum.uniforms.u_choppiness.value = this.choppiness;
            this.materialSpectrum.uniforms.u_size.value = this.size;
            this.renderer.render( this.scene, this.oceanCamera, this.spectrumFramebuffer );

        };

        Ocean.prototype.renderSpectrumFFT = function() {

            // GPU FFT using Stockham formulation
            var iterations = Math.log( this.resolution ) / Math.log( 2 ); // log2

            this.scene.overrideMaterial = this.materialOceanHorizontal;

            for ( var i = 0; i < iterations; i ++ ) {

                if ( i === 0 ) {

                    this.materialOceanHorizontal.uniforms.u_input.value = this.spectrumFramebuffer.texture;
                    this.materialOceanHorizontal.uniforms.u_subtransformSize.value = Math.pow( 2, ( i % ( iterations ) ) + 1 );
                    this.renderer.render( this.scene, this.oceanCamera, this.pingTransformFramebuffer );

                } else if ( i % 2 === 1 ) {

                    this.materialOceanHorizontal.uniforms.u_input.value = this.pingTransformFramebuffer.texture;
                    this.materialOceanHorizontal.uniforms.u_subtransformSize.value = Math.pow( 2, ( i % ( iterations ) ) + 1 );
                    this.renderer.render( this.scene, this.oceanCamera, this.pongTransformFramebuffer );

                } else {

                    this.materialOceanHorizontal.uniforms.u_input.value = this.pongTransformFramebuffer.texture;
                    this.materialOceanHorizontal.uniforms.u_subtransformSize.value = Math.pow( 2, ( i % ( iterations ) ) + 1 );
                    this.renderer.render( this.scene, this.oceanCamera, this.pingTransformFramebuffer );

                }

            }
            this.scene.overrideMaterial = this.materialOceanVertical;
            for ( var i = iterations; i < iterations * 2; i ++ ) {

                if ( i === iterations * 2 - 1 ) {

                    this.materialOceanVertical.uniforms.u_input.value = ( iterations % 2 === 0 ) ? this.pingTransformFramebuffer.texture : this.pongTransformFramebuffer.texture;
                    this.materialOceanVertical.uniforms.u_subtransformSize.value = Math.pow( 2, ( i % ( iterations ) ) + 1 );
                    this.renderer.render( this.scene, this.oceanCamera, this.displacementMapFramebuffer );

                } else if ( i % 2 === 1 ) {

                    this.materialOceanVertical.uniforms.u_input.value = this.pingTransformFramebuffer.texture;
                    this.materialOceanVertical.uniforms.u_subtransformSize.value = Math.pow( 2, ( i % ( iterations ) ) + 1 );
                    this.renderer.render( this.scene, this.oceanCamera, this.pongTransformFramebuffer );

                } else {

                    this.materialOceanVertical.uniforms.u_input.value = this.pongTransformFramebuffer.texture;
                    this.materialOceanVertical.uniforms.u_subtransformSize.value = Math.pow( 2, ( i % ( iterations ) ) + 1 );
                    this.renderer.render( this.scene, this.oceanCamera, this.pingTransformFramebuffer );

                }

            }

        };

        Ocean.prototype.renderNormalMap = function () {

            this.scene.overrideMaterial = this.materialNormal;
            if ( this.changed ) this.materialNormal.uniforms.u_size.value = this.size;
            this.materialNormal.uniforms.u_displacementMap.value = this.displacementMapFramebuffer.texture;
            this.renderer.render( this.scene, this.oceanCamera, this.normalMapFramebuffer, true );

        };

        return function(renderer, camera, scene, options) {
            var gsize = 512,
                res = 1024,
                gres = res / 2,
                origx = -gsize / 2,
                origz = -gsize / 2;

            ocean = new Ocean(renderer, camera, scene, {
                USE_HALF_FLOAT : true,
                INITIAL_SIZE : 256.0,
                INITIAL_WIND : [10.0, 10.0],
                INITIAL_CHOPPINESS : 1.5,
                CLEAR_COLOR : [1.0, 1.0, 1.0, 0.0],
                GEOMETRY_ORIGIN : [origx, origz],
                SUN_DIRECTION : [-1.0, 1.0, 1.0],
                OCEAN_COLOR: new THREE.Vector3(0.004, 0.016, 0.047),
                SKY_COLOR: new THREE.Vector3(3.2, 9.6, 12.8),
                EXPOSURE : 0.35,
                GEOMETRY_RESOLUTION: gres,
                GEOMETRY_SIZE : gsize,
                RESOLUTION : res
            });
            ocean.materialOcean.uniforms.u_projectionMatrix = { type: "m4", value: camera.projectionMatrix };
            ocean.materialOcean.uniforms.u_viewMatrix = { type: "m4", value: camera.matrixWorldInverse };
            ocean.materialOcean.uniforms.u_cameraPosition = { type: "v3", value: camera.position };

            ocean.render = function() {
                var currentTime = new Date().getTime();
                ocean.deltaTime = (currentTime - lastTime) / 1000 || 0.0;
                lastTime = currentTime;
                ocean.update(ocean.deltaTime);
                ocean.overrideMaterial = ocean.materialOcean;
                if (ocean.changed) {
                    ocean.materialOcean.uniforms.u_size.value = ocean.size;
                    ocean.materialOcean.uniforms.u_sunDirection.value.set( ocean.sunDirectionX, ocean.sunDirectionY, ocean.sunDirectionZ );
                    ocean.materialOcean.uniforms.u_exposure.value = ocean.exposure;
                    ocean.changed = false;
                }
                ocean.materialOcean.uniforms.u_normalMap.value = ocean.normalMapFramebuffer.texture;
                ocean.materialOcean.uniforms.u_displacementMap.value = ocean.displacementMapFramebuffer.texture;
                ocean.materialOcean.uniforms.u_projectionMatrix.value = this.ms_Camera.projectionMatrix;
                ocean.materialOcean.uniforms.u_viewMatrix.value = this.ms_Camera.matrixWorldInverse;
                ocean.materialOcean.uniforms.u_cameraPosition.value = this.ms_Camera.position;
                ocean.materialOcean.depthTest = true;
            }
            
            return ocean;
            //this.ms_Scene.__lights[1].position.x = this.ms_Scene.__lights[1].position.x + 0.01;
        }
    })()
});;
Class("App", {

    App: function() {

        this.log_types = {
    		"e" : "error",
    		"w" : "warn",
    		"i" : "info"
    	};

        //util
        this.util = _.extend({
    		h : window.innerHeight,
    		w : window.innerWidth,
    		ratio : (window.innerWidth/window.innerHeight),
    		frameRate : 60,

    		camera : {
    			//handling useful informations about our camera.
    			fov : 75,
    			near : 0.1,
    			far : 100
    		}
    	}, config);

    	//importing libraries
    	this.threeLib = undefined;

    	//scnee parameters
        this.camera = undefined;
        this.user = undefined;
        this.scene = undefined;
        this.renderer= undefined;
        this.clearColor = 0x000000;
        Object.defineProperty(this, 'clearColor', {
            set: function(value) {
                try {
                    if (this.renderer) {
                        this.renderer.setClearColor(value);
                        this.clearColor = value;
                    }
                } catch (e) {}
            }
        })

    	//debug mode
        this.debug = true;

        //CLOCK!
        this.clock = new THREE.Clock();

        //window and mouse variables
        this.mouseX = 0;
        this.mouseY = 0;
        this.zoom = 0;

        this.windowHalfX = window.innerWidth / 2;
        this.windowHalfY = window.innerHeight / 2;
        this.CAMERA_MAX_Z = 1000;
        this.CAMERA_MIN_Z = 250;

        // registering listener for events from parent
        window.addEventListener("onmessage", this.onMessage, false);
        window.addEventListener("message", this.onMessage, false);

    },

    //onCreate method, ovveride to start creating stuff
    onCreate: function() {},

    //this methods helps you loading heavy stuff
    preload: function(callback) {
        callback();
    },

    //do stuff before onCreate method( prepare meshes, whatever )
    prepareScene: function() {},

    //this is what happens during game loading, the progress animation
    progressAnimation: function(callback) {
        $('#loader').animate({"opacity" : "0", "margin-top" : "250px"}, 1000 , function () {
    		$('#loader').remove();
    		$('body').animate({backgroundColor : "#fff"}, 200 , callback);
    	});
    },

    //needed if user wants to add a customRender method
    _render: function() {},

    //setupleap motion device
    setUpLeap: function() {},

    //leap motion socket connected
    onLeapSocketConnected: function() {},

    //leap motion device connected
    onLeapDeviceConnected: function() {},

    //leap motion device disconnected
    onLeapDeviceDisconnected: function() {},

    render : function () {

        //handling user input
        //M.user.handleUserInput();
        //updating game and engines
        M.game.update();
        M.audioEngine.update();
        M.lightEngine.update();
        //updating universe
        M.universe.update();
        M.control.update();

        //updating camera if we need to do so.
        if (app.camera.update) {
            app.camera.update(app.clock.getDelta());
        }

        app.renderer.autoClear = false;
        app.renderer.clear(app.clearColor);
        app._render();
        app.renderer.render(app.scene, app.camera.object);

        /*
        setTimeout(function() {
            if (app.util.physics_enabled) {
                if (Physijs._isLoaded) {
                    app.scene.simulate();
                }
            }
            if (app.util.tween_enabled) {
                TWEEN.update();
            }
            requestAnimFrame(app.render);
        }, 1000 / app.util.frameRate);
        */
        if (app.util.physics_enabled && Physijs._isLoaded) {
            app.scene.simulate();
        }
        if (app.util.tween_enabled) {
            TWEEN.update();
        }
        requestAnimFrame(app.render);

    },

    add : function(mesh, element) {

		//method to be called when creating a new element
		this.scene.add(mesh);
		M.universe.reality.put(mesh.uuid, element);

	},

	remove : function(mesh) {

		this.scene.remove(mesh);
		M.universe.reality.remove(mesh.uuid);

	},

    init: function() {

        app.three = THREE;
        var c_util 	= app.util.camera; //camera util
        var util 	= app.util;

        if (window.keypress) {
            app._keylistener =  new window.keypress.Listener();
        }

        //try{
            //configuring threejs and physijs
            if (config) {
                app.log("config loaded");
                if (app.util.physics_enabled) {
                    app.log("physics enabled.");
                    try {
                        Physijs.scripts.worker = 'workers/physijs_worker.js';
                        Physijs.scripts.ammo = 'ammo.js';
                        app.scene = new Physijs.Scene();
                        Physijs._isLoaded = true;
                    } catch (ex) {
                        app.log("something bad trying to create physijs scene", "e");
                        app.log(ex);
                        Physijs._isLoaded = false;
                        app.scene = new app.three.Scene();
                    }
                } else {
                    app.log("physics not enabled.");
                    Physijs._isLoaded = false;
                    app.scene = new app.three.Scene();
                }
            } else {
                app.log("config not loaded, switching to three.js");
                Physijs._isLoaded = false;
                app.scene = new app.three.Scene();
            }
            //setting up camera
            var cameraOptions = {
                fov : c_util.fov,
                ratio : util.ratio,
                near : c_util.near,
                far : c_util.far
            };
            if (config) {
                if (app.util.camera) {
                    cameraOptions.fov = app.util.camera.fov ? app.util.camera.fov : cameraOptions.fov;
                    cameraOptions.ratio = app.util.camera.ratio ? app.util.camera.ratio : cameraOptions.ratio;
                    cameraOptions.near = app.util.camera.near ? app.util.camera.near : cameraOptions.near;
                    cameraOptions.far = app.util.camera.far ? app.util.camera.far : cameraOptions.far;
                }
            }
            app.camera = new Camera(cameraOptions);
            var alphaRenderer = false;
            if (app.util.alpha) {
                alphaRenderer = true;
            }
            app.renderer = new app.three.WebGLRenderer({alpha:alphaRenderer, antialias: true});
            if (app.util.cast_shadow) {
                app.renderer.shadowMap.enabled = true;
                app.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
                app.renderer.sortObjects = false;
            }
            //this.renderer.setClearColor(new THREE.Color('#000000'));
            app.renderer.setPixelRatio( window.devicePixelRatio );
            app.renderer.setSize( util.w , util.h );
            //document.body.appendChild( app.renderer.domElement );
            document.getElementById("gameContainer").appendChild(app.renderer.domElement);
            //handling user input
            //M.user.handleUserInput();
            //updating game
            M.game.update();
            //updating universe
            M.universe.update();

            //launch render method
            M.control.init();
            app.render();

            //we are pretty sure we can add stuff to our universe
            if (app.onCreate instanceof Function) {
                app.onCreate();
            } else {
                console.log("Something wrong in your onCreate method");
            }

        //} catch( error ) {
        //	console.error(error);
        //	console.trace();
        //}

    },

    load: function() {

        console.log("inside load");
        if (!(typeof this.progressAnimation == "function")) {
            this.progressAnimation = function(callback) {
                console.log("def progressAnimation");
                callback();
            }
        }
        this.progressAnimation(app.init);

    },

    sendMessage: function(message) {
		parent.postMessage(message, location.origin);
    },

    onMessage: function() {
        var origin = event.origin || event.originalEvent.origin;
        if (origin !== location.origin)
            return;

    },

    onkey: function(key, callback) {
        if (app._keylistener) {
            app._keylistener.simple_combo(key, callback);
        }
    },

    //utilities methods
    log: function() {

    	if (this.debug) {
    		if (arguments.length>1) {
    			if (arguments[1] in this.log_types) {
    				console[this.log_types[arguments[1]]](arguments[0]);
    			} else {
    				console.log(arguments[0]);
    			}
    		} else {
    			console.log(arguments[0]);
    		}
    	}

    },

    //document input method
    onDocumentMouseWheel: function(event) {

    	event.preventDefault();
    	app.zoom = event.wheelDelta * 0.05;
    	app.camera.object.position.z += app.zoom;

    },

    onDocumentMouseMove: function(event) {

    	app.mouseX = event.clientX - app.windowHalfX;
    	app.mouseY = event.clientY - app.windowHalfY;

    },

    onDocumentTouchStart: function(event) {

    	if ( event.touches.length === 1 ) {

    		event.preventDefault();

    		app.mouseX = event.touches[ 0 ].pageX - app.windowHalfX;
    		app.mouseY = event.touches[ 0 ].pageY - app.windowHalfY;

    	}

    },

    onDocumentTouchMove: function(event) {

    	if ( event.touches.length === 1 ) {

    		event.preventDefault();

    		app.mouseX = event.touches[ 0 ].pageX - app.windowHalfX;
    		app.mouseY = event.touches[ 0 ].pageY - app.windowHalfY;

    	}

    },

    //keyup event
    keyup: function(event) {},

    //keydown event
    keydown: function(event) {},

    //handling failed tests
    onFailedTest: function(message, test) {},

    //handling succesful tests
    onSuccededTest: function(message) {}

});

// retrieving M object
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    console.log(window);
    module.exports = M;

    delete window['M'];
} else {
    // we're inside our favourite browser
    window.app = {};
    M.started = false;
    M.start = function() {
        if (M.started) {
            console.log('app already started');
            return;
        }
        M.started = true;
        console.log("inside window onload");
        //creating app object
        if (window.subClasses["App"]) {
            var subName = window.subClasses["App"];
            app = new window[subName]();
        } else {
            app = new App();
        }

        //before starting loading stuff, be sure to pass all tests
        M.util.start();

        if (M.util.check.start(app.onSuccededTest, app.onFailedTest)) {
            //we passed every test, we can go
            app.preload(function() {
                M.assetsManager.load(function() {
                    app.prepareScene();
                    app.load();
                });
            });
        }
    };

    M.resize = function () {
        app.util.h 	= window.innerHeight;
        app.util.w 	= window.innerWidth;
        app.util.ratio = app.util.w/app.util.h;

        if (!app.camera || !app.renderer) return;
        app.camera.object.aspect = app.util.ratio;
        app.camera.object.updateProjectionMatrix();
        app.renderer.setSize(app.util.w, app.util.h);
    };

    window.addEventListener('load', M.start);
    window.addEventListener('resize', M.resize);


    M.version = '0.0.46';
    M.author = {
        name: 'Marco Stagni',
        email: 'mrc.stagni@gmail.com',
        website: 'http://mage.studio'
    };
}

