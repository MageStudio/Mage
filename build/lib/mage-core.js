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
    window = window || {};
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

		load: function() {
			//loading images
			M.imagesEngine.map = new HashMap();
			M.imagesEngine.images = [];
			M.imagesEngine.numImages = 0;
			M.imagesEngine.loader = new THREE.TextureLoader();

			for (var image in Assets.Images) {
				M.imagesEngine.numImages++;
				M.imagesEngine.loadSingleFile(image, Assets.Images[image]);
			}

			if (M.imagesEngine.numImages == 0) {
				M.assetsManager.completed.images = true;
			}
		},

		get: function(key) {
			return M.imagesEngine.map.get(key) || false;
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

	SHADERS: ['Atmoshpere', 'Mirror', 'Water'],

	shaders: {},
	numShaders : 0,
	shadersLoaded : 0,
	update: function() {
		//console.log("inside old update ShadersEngine");
	},

	load: function() {

		M.fx.shadersEngine.map = new HashMap();
		M.fx.shadersEngine.shaders = [];
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
};
;
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

