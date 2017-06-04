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
/* shader-particle-engine 1.0.6
 * 
 * (c) 2015 Luke Moody (http://www.github.com/squarefeet)
 *     Originally based on Lee Stemkoski's original work (https://github.com/stemkoski/stemkoski.github.com/blob/master/Three.js/js/ParticleEngine.js).
 *
 * shader-particle-engine may be freely distributed under the MIT license (See LICENSE at root of this repository.)
 */
var SPE={distributions:{BOX:1,SPHERE:2,DISC:3},valueOverLifetimeLength:4};"function"==typeof define&&define.amd?define("spe",SPE):"undefined"!=typeof exports&&"undefined"!=typeof module&&(module.exports=SPE),SPE.TypedArrayHelper=function(a,b,c,d){"use strict";this.componentSize=c||1,this.size=b||1,this.TypedArrayConstructor=a||Float32Array,this.array=new a(b*this.componentSize),this.indexOffset=d||0},SPE.TypedArrayHelper.constructor=SPE.TypedArrayHelper,SPE.TypedArrayHelper.prototype.setSize=function(a,b){"use strict";var c=this.array.length;return b||(a*=this.componentSize),c>a?this.shrink(a):a>c?this.grow(a):void console.info("TypedArray is already of size:",a+".","Will not resize.")},SPE.TypedArrayHelper.prototype.shrink=function(a){"use strict";return this.array=this.array.subarray(0,a),this.size=a,this},SPE.TypedArrayHelper.prototype.grow=function(a){"use strict";var b=this.array,c=new this.TypedArrayConstructor(a);return c.set(b),this.array=c,this.size=a,this},SPE.TypedArrayHelper.prototype.splice=function(a,b){
"use strict";a*=this.componentSize,b*=this.componentSize;for(var c=[],d=this.array,e=d.length,f=0;e>f;++f)(a>f||f>=b)&&c.push(d[f]);return this.setFromArray(0,c),this},SPE.TypedArrayHelper.prototype.setFromArray=function(a,b){"use strict";var c=b.length,d=a+c;return d>this.array.length?this.grow(d):d<this.array.length&&this.shrink(d),this.array.set(b,this.indexOffset+a),this},SPE.TypedArrayHelper.prototype.setVec2=function(a,b){"use strict";return this.setVec2Components(a,b.x,b.y)},SPE.TypedArrayHelper.prototype.setVec2Components=function(a,b,c){"use strict";var d=this.array,e=this.indexOffset+a*this.componentSize;return d[e]=b,d[e+1]=c,this},SPE.TypedArrayHelper.prototype.setVec3=function(a,b){"use strict";return this.setVec3Components(a,b.x,b.y,b.z)},SPE.TypedArrayHelper.prototype.setVec3Components=function(a,b,c,d){"use strict";var e=this.array,f=this.indexOffset+a*this.componentSize;return e[f]=b,e[f+1]=c,e[f+2]=d,this},SPE.TypedArrayHelper.prototype.setVec4=function(a,b){"use strict";
return this.setVec4Components(a,b.x,b.y,b.z,b.w)},SPE.TypedArrayHelper.prototype.setVec4Components=function(a,b,c,d,e){"use strict";var f=this.array,g=this.indexOffset+a*this.componentSize;return f[g]=b,f[g+1]=c,f[g+2]=d,f[g+3]=e,this},SPE.TypedArrayHelper.prototype.setMat3=function(a,b){"use strict";return this.setFromArray(this.indexOffset+a*this.componentSize,b.elements)},SPE.TypedArrayHelper.prototype.setMat4=function(a,b){"use strict";return this.setFromArray(this.indexOffset+a*this.componentSize,b.elements)},SPE.TypedArrayHelper.prototype.setColor=function(a,b){"use strict";return this.setVec3Components(a,b.r,b.g,b.b)},SPE.TypedArrayHelper.prototype.setNumber=function(a,b){"use strict";return this.array[this.indexOffset+a*this.componentSize]=b,this},SPE.TypedArrayHelper.prototype.getValueAtIndex=function(a){"use strict";return this.array[this.indexOffset+a]},SPE.TypedArrayHelper.prototype.getComponentValueAtIndex=function(a){"use strict";return this.array.subarray(this.indexOffset+a*this.componentSize);
},SPE.ShaderAttribute=function(a,b,c){"use strict";var d=SPE.ShaderAttribute.typeSizeMap;this.type="string"==typeof a&&d.hasOwnProperty(a)?a:"f",this.componentSize=d[this.type],this.arrayType=c||Float32Array,this.typedArray=null,this.bufferAttribute=null,this.dynamicBuffer=!!b,this.updateMin=0,this.updateMax=0},SPE.ShaderAttribute.constructor=SPE.ShaderAttribute,SPE.ShaderAttribute.typeSizeMap={f:1,v2:2,v3:3,v4:4,c:3,m3:9,m4:16},SPE.ShaderAttribute.prototype.setUpdateRange=function(a,b){"use strict";this.updateMin=Math.min(a*this.componentSize,this.updateMin*this.componentSize),this.updateMax=Math.max(b*this.componentSize,this.updateMax*this.componentSize)},SPE.ShaderAttribute.prototype.flagUpdate=function(){"use strict";var a=this.bufferAttribute,b=a.updateRange;b.offset=this.updateMin,b.count=Math.min(this.updateMax-this.updateMin+this.componentSize,this.typedArray.array.length),a.needsUpdate=!0},SPE.ShaderAttribute.prototype.resetUpdateRange=function(){"use strict";this.updateMin=0,this.updateMax=0;
},SPE.ShaderAttribute.prototype.resetDynamic=function(){"use strict";this.bufferAttribute.dynamic=this.dynamicBuffer},SPE.ShaderAttribute.prototype.splice=function(a,b){"use strict";this.typedArray.splice(a,b),this.forceUpdateAll()},SPE.ShaderAttribute.prototype.forceUpdateAll=function(){"use strict";this.bufferAttribute.array=this.typedArray.array,this.bufferAttribute.updateRange.offset=0,this.bufferAttribute.updateRange.count=-1,this.bufferAttribute.dynamic=!1,this.bufferAttribute.needsUpdate=!0},SPE.ShaderAttribute.prototype._ensureTypedArray=function(a){"use strict";null!==this.typedArray&&this.typedArray.size===a*this.componentSize||(null!==this.typedArray&&this.typedArray.size!==a?this.typedArray.setSize(a):null===this.typedArray&&(this.typedArray=new SPE.TypedArrayHelper(this.arrayType,a,this.componentSize)))},SPE.ShaderAttribute.prototype._createBufferAttribute=function(a){"use strict";return this._ensureTypedArray(a),null!==this.bufferAttribute?(this.bufferAttribute.array=this.typedArray.array,
parseFloat(THREE.REVISION)>=81&&(this.bufferAttribute.count=this.bufferAttribute.array.length/this.bufferAttribute.itemSize),void(this.bufferAttribute.needsUpdate=!0)):(this.bufferAttribute=new THREE.BufferAttribute(this.typedArray.array,this.componentSize),void(this.bufferAttribute.dynamic=this.dynamicBuffer))},SPE.ShaderAttribute.prototype.getLength=function(){"use strict";return null===this.typedArray?0:this.typedArray.array.length},SPE.shaderChunks={defines:["#define PACKED_COLOR_SIZE 256.0","#define PACKED_COLOR_DIVISOR 255.0"].join("\n"),uniforms:["uniform float deltaTime;","uniform float runTime;","uniform sampler2D texture;","uniform vec4 textureAnimation;","uniform float scale;"].join("\n"),attributes:["attribute vec4 acceleration;","attribute vec3 velocity;","attribute vec4 rotation;","attribute vec3 rotationCenter;","attribute vec4 params;","attribute vec4 size;","attribute vec4 angle;","attribute vec4 color;","attribute vec4 opacity;"].join("\n"),varyings:["varying vec4 vColor;","#ifdef SHOULD_ROTATE_TEXTURE","    varying float vAngle;","#endif","#ifdef SHOULD_CALCULATE_SPRITE","    varying vec4 vSpriteSheet;","#endif"].join("\n"),
branchAvoidanceFunctions:["float when_gt(float x, float y) {","    return max(sign(x - y), 0.0);","}","float when_lt(float x, float y) {","    return min( max(1.0 - sign(x - y), 0.0), 1.0 );","}","float when_eq( float x, float y ) {","    return 1.0 - abs( sign( x - y ) );","}","float when_ge(float x, float y) {","  return 1.0 - when_lt(x, y);","}","float when_le(float x, float y) {","  return 1.0 - when_gt(x, y);","}","float and(float a, float b) {","    return a * b;","}","float or(float a, float b) {","    return min(a + b, 1.0);","}"].join("\n"),unpackColor:["vec3 unpackColor( in float hex ) {","   vec3 c = vec3( 0.0 );","   float r = mod( (hex / PACKED_COLOR_SIZE / PACKED_COLOR_SIZE), PACKED_COLOR_SIZE );","   float g = mod( (hex / PACKED_COLOR_SIZE), PACKED_COLOR_SIZE );","   float b = mod( hex, PACKED_COLOR_SIZE );","   c.r = r / PACKED_COLOR_DIVISOR;","   c.g = g / PACKED_COLOR_DIVISOR;","   c.b = b / PACKED_COLOR_DIVISOR;","   return c;","}"].join("\n"),unpackRotationAxis:["vec3 unpackRotationAxis( in float hex ) {","   vec3 c = vec3( 0.0 );","   float r = mod( (hex / PACKED_COLOR_SIZE / PACKED_COLOR_SIZE), PACKED_COLOR_SIZE );","   float g = mod( (hex / PACKED_COLOR_SIZE), PACKED_COLOR_SIZE );","   float b = mod( hex, PACKED_COLOR_SIZE );","   c.r = r / PACKED_COLOR_DIVISOR;","   c.g = g / PACKED_COLOR_DIVISOR;","   c.b = b / PACKED_COLOR_DIVISOR;","   c *= vec3( 2.0 );","   c -= vec3( 1.0 );","   return c;","}"].join("\n"),
floatOverLifetime:["float getFloatOverLifetime( in float positionInTime, in vec4 attr ) {","    highp float value = 0.0;","    float deltaAge = positionInTime * float( VALUE_OVER_LIFETIME_LENGTH - 1 );","    float fIndex = 0.0;","    float shouldApplyValue = 0.0;","    value += attr[ 0 ] * when_eq( deltaAge, 0.0 );","","    for( int i = 0; i < VALUE_OVER_LIFETIME_LENGTH - 1; ++i ) {","       fIndex = float( i );","       shouldApplyValue = and( when_gt( deltaAge, fIndex ), when_le( deltaAge, fIndex + 1.0 ) );","       value += shouldApplyValue * mix( attr[ i ], attr[ i + 1 ], deltaAge - fIndex );","    }","","    return value;","}"].join("\n"),colorOverLifetime:["vec3 getColorOverLifetime( in float positionInTime, in vec3 color1, in vec3 color2, in vec3 color3, in vec3 color4 ) {","    vec3 value = vec3( 0.0 );","    value.x = getFloatOverLifetime( positionInTime, vec4( color1.x, color2.x, color3.x, color4.x ) );","    value.y = getFloatOverLifetime( positionInTime, vec4( color1.y, color2.y, color3.y, color4.y ) );","    value.z = getFloatOverLifetime( positionInTime, vec4( color1.z, color2.z, color3.z, color4.z ) );","    return value;","}"].join("\n"),
paramFetchingFunctions:["float getAlive() {","   return params.x;","}","float getAge() {","   return params.y;","}","float getMaxAge() {","   return params.z;","}","float getWiggle() {","   return params.w;","}"].join("\n"),forceFetchingFunctions:["vec4 getPosition( in float age ) {","   return modelViewMatrix * vec4( position, 1.0 );","}","vec3 getVelocity( in float age ) {","   return velocity * age;","}","vec3 getAcceleration( in float age ) {","   return acceleration.xyz * age;","}"].join("\n"),rotationFunctions:["#ifdef SHOULD_ROTATE_PARTICLES","   mat4 getRotationMatrix( in vec3 axis, in float angle) {","       axis = normalize(axis);","       float s = sin(angle);","       float c = cos(angle);","       float oc = 1.0 - c;","","       return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,","                   oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,","                   oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,","                   0.0,                                0.0,                                0.0,                                1.0);","   }","","   vec3 getRotation( in vec3 pos, in float positionInTime ) {","      if( rotation.y == 0.0 ) {","           return pos;","      }","","      vec3 axis = unpackRotationAxis( rotation.x );","      vec3 center = rotationCenter;","      vec3 translated;","      mat4 rotationMatrix;","      float angle = 0.0;","      angle += when_eq( rotation.z, 0.0 ) * rotation.y;","      angle += when_gt( rotation.z, 0.0 ) * mix( 0.0, rotation.y, positionInTime );","      translated = rotationCenter - pos;","      rotationMatrix = getRotationMatrix( axis, angle );","      return center - vec3( rotationMatrix * vec4( translated, 0.0 ) );","   }","#endif"].join("\n"),
rotateTexture:["    vec2 vUv = vec2( gl_PointCoord.x, 1.0 - gl_PointCoord.y );","","    #ifdef SHOULD_ROTATE_TEXTURE","       float x = gl_PointCoord.x - 0.5;","       float y = 1.0 - gl_PointCoord.y - 0.5;","       float c = cos( -vAngle );","       float s = sin( -vAngle );","       vUv = vec2( c * x + s * y + 0.5, c * y - s * x + 0.5 );","    #endif","","    #ifdef SHOULD_CALCULATE_SPRITE","        float framesX = vSpriteSheet.x;","        float framesY = vSpriteSheet.y;","        float columnNorm = vSpriteSheet.z;","        float rowNorm = vSpriteSheet.w;","        vUv.x = gl_PointCoord.x * framesX + columnNorm;","        vUv.y = 1.0 - (gl_PointCoord.y * framesY + rowNorm);","    #endif","","    vec4 rotatedTexture = texture2D( texture, vUv );"].join("\n")},SPE.shaders={vertex:[SPE.shaderChunks.defines,SPE.shaderChunks.uniforms,SPE.shaderChunks.attributes,SPE.shaderChunks.varyings,THREE.ShaderChunk.common,THREE.ShaderChunk.logdepthbuf_pars_vertex,THREE.ShaderChunk.fog_pars_vertex,SPE.shaderChunks.branchAvoidanceFunctions,SPE.shaderChunks.unpackColor,SPE.shaderChunks.unpackRotationAxis,SPE.shaderChunks.floatOverLifetime,SPE.shaderChunks.colorOverLifetime,SPE.shaderChunks.paramFetchingFunctions,SPE.shaderChunks.forceFetchingFunctions,SPE.shaderChunks.rotationFunctions,"void main() {","    highp float age = getAge();","    highp float alive = getAlive();","    highp float maxAge = getMaxAge();","    highp float positionInTime = (age / maxAge);","    highp float isAlive = when_gt( alive, 0.0 );","    #ifdef SHOULD_WIGGLE_PARTICLES","        float wiggleAmount = positionInTime * getWiggle();","        float wiggleSin = isAlive * sin( wiggleAmount );","        float wiggleCos = isAlive * cos( wiggleAmount );","    #endif","    vec3 vel = getVelocity( age );","    vec3 accel = getAcceleration( age );","    vec3 force = vec3( 0.0 );","    vec3 pos = vec3( position );","    float drag = 1.0 - (positionInTime * 0.5) * acceleration.w;","    force += vel;","    force *= drag;","    force += accel * age;","    pos += force;","    #ifdef SHOULD_WIGGLE_PARTICLES","        pos.x += wiggleSin;","        pos.y += wiggleCos;","        pos.z += wiggleSin;","    #endif","    #ifdef SHOULD_ROTATE_PARTICLES","        pos = getRotation( pos, positionInTime );","    #endif","    vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );","    highp float pointSize = getFloatOverLifetime( positionInTime, size ) * isAlive;","    #ifdef HAS_PERSPECTIVE","        float perspective = scale / length( mvPosition.xyz );","    #else","        float perspective = 1.0;","    #endif","    float pointSizePerspective = pointSize * perspective;","    #ifdef COLORIZE","       vec3 c = isAlive * getColorOverLifetime(","           positionInTime,","           unpackColor( color.x ),","           unpackColor( color.y ),","           unpackColor( color.z ),","           unpackColor( color.w )","       );","    #else","       vec3 c = vec3(1.0);","    #endif","    float o = isAlive * getFloatOverLifetime( positionInTime, opacity );","    vColor = vec4( c, o );","    #ifdef SHOULD_ROTATE_TEXTURE","        vAngle = isAlive * getFloatOverLifetime( positionInTime, angle );","    #endif","    #ifdef SHOULD_CALCULATE_SPRITE","        float framesX = textureAnimation.x;","        float framesY = textureAnimation.y;","        float loopCount = textureAnimation.w;","        float totalFrames = textureAnimation.z;","        float frameNumber = mod( (positionInTime * loopCount) * totalFrames, totalFrames );","        float column = floor(mod( frameNumber, framesX ));","        float row = floor( (frameNumber - column) / framesX );","        float columnNorm = column / framesX;","        float rowNorm = row / framesY;","        vSpriteSheet.x = 1.0 / framesX;","        vSpriteSheet.y = 1.0 / framesY;","        vSpriteSheet.z = columnNorm;","        vSpriteSheet.w = rowNorm;","    #endif","    gl_PointSize = pointSizePerspective;","    gl_Position = projectionMatrix * mvPosition;",THREE.ShaderChunk.logdepthbuf_vertex,THREE.ShaderChunk.fog_vertex,"}"].join("\n"),
fragment:[SPE.shaderChunks.uniforms,THREE.ShaderChunk.common,THREE.ShaderChunk.fog_pars_fragment,THREE.ShaderChunk.logdepthbuf_pars_fragment,SPE.shaderChunks.varyings,SPE.shaderChunks.branchAvoidanceFunctions,"void main() {","    vec3 outgoingLight = vColor.xyz;","    ","    #ifdef ALPHATEST","       if ( vColor.w < float(ALPHATEST) ) discard;","    #endif",SPE.shaderChunks.rotateTexture,THREE.ShaderChunk.logdepthbuf_fragment,"    outgoingLight = vColor.xyz * rotatedTexture.xyz;","    gl_FragColor = vec4( outgoingLight.xyz, rotatedTexture.w * vColor.w );",THREE.ShaderChunk.fog_fragment,"}"].join("\n")},SPE.utils={types:{BOOLEAN:"boolean",STRING:"string",NUMBER:"number",OBJECT:"object"},ensureTypedArg:function(a,b,c){"use strict";return typeof a===b?a:c},ensureArrayTypedArg:function(a,b,c){"use strict";if(Array.isArray(a)){for(var d=a.length-1;d>=0;--d)if(typeof a[d]!==b)return c;return a}return this.ensureTypedArg(a,b,c)},ensureInstanceOf:function(a,b,c){"use strict";return void 0!==b&&a instanceof b?a:c;
},ensureArrayInstanceOf:function(a,b,c){"use strict";if(Array.isArray(a)){for(var d=a.length-1;d>=0;--d)if(void 0!==b&&a[d]instanceof b==!1)return c;return a}return this.ensureInstanceOf(a,b,c)},ensureValueOverLifetimeCompliance:function(a,b,c){"use strict";b=b||3,c=c||3,Array.isArray(a._value)===!1&&(a._value=[a._value]),Array.isArray(a._spread)===!1&&(a._spread=[a._spread]);var d=this.clamp(a._value.length,b,c),e=this.clamp(a._spread.length,b,c),f=Math.max(d,e);a._value.length!==f&&(a._value=this.interpolateArray(a._value,f)),a._spread.length!==f&&(a._spread=this.interpolateArray(a._spread,f))},interpolateArray:function(a,b){"use strict";for(var c=a.length,d=["function"==typeof a[0].clone?a[0].clone():a[0]],e=(c-1)/(b-1),f=1;b-1>f;++f){var g=f*e,h=Math.floor(g),i=Math.ceil(g),j=g-h;d[f]=this.lerpTypeAgnostic(a[h],a[i],j)}return d.push("function"==typeof a[c-1].clone?a[c-1].clone():a[c-1]),d},clamp:function(a,b,c){"use strict";return Math.max(b,Math.min(a,c))},zeroToEpsilon:function(a,b){
"use strict";var c=1e-5,d=a;return d=b?Math.random()*c*10:c,0>a&&a>-c&&(d=-d),d},lerpTypeAgnostic:function(a,b,c){"use strict";var d,e=this.types;return typeof a===e.NUMBER&&typeof b===e.NUMBER?a+(b-a)*c:a instanceof THREE.Vector2&&b instanceof THREE.Vector2?(d=a.clone(),d.x=this.lerp(a.x,b.x,c),d.y=this.lerp(a.y,b.y,c),d):a instanceof THREE.Vector3&&b instanceof THREE.Vector3?(d=a.clone(),d.x=this.lerp(a.x,b.x,c),d.y=this.lerp(a.y,b.y,c),d.z=this.lerp(a.z,b.z,c),d):a instanceof THREE.Vector4&&b instanceof THREE.Vector4?(d=a.clone(),d.x=this.lerp(a.x,b.x,c),d.y=this.lerp(a.y,b.y,c),d.z=this.lerp(a.z,b.z,c),d.w=this.lerp(a.w,b.w,c),d):a instanceof THREE.Color&&b instanceof THREE.Color?(d=a.clone(),d.r=this.lerp(a.r,b.r,c),d.g=this.lerp(a.g,b.g,c),d.b=this.lerp(a.b,b.b,c),d):void console.warn("Invalid argument types, or argument types do not match:",a,b)},lerp:function(a,b,c){"use strict";return a+(b-a)*c},roundToNearestMultiple:function(a,b){"use strict";var c=0;return 0===b?a:(c=Math.abs(a)%b,
0===c?a:0>a?-(Math.abs(a)-c):a+b-c)},arrayValuesAreEqual:function(a){"use strict";for(var b=0;b<a.length-1;++b)if(a[b]!==a[b+1])return!1;return!0},randomFloat:function(a,b){"use strict";return a+b*(Math.random()-.5)},randomVector3:function(a,b,c,d,e){"use strict";var f=c.x+(Math.random()*d.x-.5*d.x),g=c.y+(Math.random()*d.y-.5*d.y),h=c.z+(Math.random()*d.z-.5*d.z);e&&(f=.5*-e.x+this.roundToNearestMultiple(f,e.x),g=.5*-e.y+this.roundToNearestMultiple(g,e.y),h=.5*-e.z+this.roundToNearestMultiple(h,e.z)),a.typedArray.setVec3Components(b,f,g,h)},randomColor:function(a,b,c,d){"use strict";var e=c.r+Math.random()*d.x,f=c.g+Math.random()*d.y,g=c.b+Math.random()*d.z;e=this.clamp(e,0,1),f=this.clamp(f,0,1),g=this.clamp(g,0,1),a.typedArray.setVec3Components(b,e,f,g)},randomColorAsHex:function(){"use strict";var a=new THREE.Color;return function(b,c,d,e){for(var f=d.length,g=[],h=0;f>h;++h){var i=e[h];a.copy(d[h]),a.r+=Math.random()*i.x-.5*i.x,a.g+=Math.random()*i.y-.5*i.y,a.b+=Math.random()*i.z-.5*i.z,
a.r=this.clamp(a.r,0,1),a.g=this.clamp(a.g,0,1),a.b=this.clamp(a.b,0,1),g.push(a.getHex())}b.typedArray.setVec4Components(c,g[0],g[1],g[2],g[3])}}(),randomVector3OnSphere:function(a,b,c,d,e,f,g,h){"use strict";var i=2*Math.random()-1,j=6.2832*Math.random(),k=Math.sqrt(1-i*i),l=this.randomFloat(d,e),m=0,n=0,o=0;g&&(l=Math.round(l/g)*g),m=k*Math.cos(j)*l,n=k*Math.sin(j)*l,o=i*l,m*=f.x,n*=f.y,o*=f.z,m+=c.x,n+=c.y,o+=c.z,a.typedArray.setVec3Components(b,m,n,o)},seededRandom:function(a){var b=1e4*Math.sin(a);return b-(0|b)},randomVector3OnDisc:function(a,b,c,d,e,f,g){"use strict";var h=6.2832*Math.random(),i=Math.abs(this.randomFloat(d,e)),j=0,k=0,l=0;g&&(i=Math.round(i/g)*g),j=Math.cos(h)*i,k=Math.sin(h)*i,j*=f.x,k*=f.y,j+=c.x,k+=c.y,l+=c.z,a.typedArray.setVec3Components(b,j,k,l)},randomDirectionVector3OnSphere:function(){"use strict";var a=new THREE.Vector3;return function(b,c,d,e,f,g,h,i){a.copy(g),a.x-=d,a.y-=e,a.z-=f,a.normalize().multiplyScalar(-this.randomFloat(h,i)),b.typedArray.setVec3Components(c,a.x,a.y,a.z);
}}(),randomDirectionVector3OnDisc:function(){"use strict";var a=new THREE.Vector3;return function(b,c,d,e,f,g,h,i){a.copy(g),a.x-=d,a.y-=e,a.z-=f,a.normalize().multiplyScalar(-this.randomFloat(h,i)),b.typedArray.setVec3Components(c,a.x,a.y,0)}}(),getPackedRotationAxis:function(){"use strict";var a=new THREE.Vector3,b=new THREE.Vector3,c=new THREE.Color,d=new THREE.Vector3(1,1,1);return function(e,f){return a.copy(e).normalize(),b.copy(f).normalize(),a.x+=.5*-f.x+Math.random()*f.x,a.y+=.5*-f.y+Math.random()*f.y,a.z+=.5*-f.z+Math.random()*f.z,a.normalize().add(d).multiplyScalar(.5),c.setRGB(a.x,a.y,a.z),c.getHex()}}()},SPE.Group=function(a){"use strict";var b=SPE.utils,c=b.types;a=b.ensureTypedArg(a,c.OBJECT,{}),a.texture=b.ensureTypedArg(a.texture,c.OBJECT,{}),this.uuid=THREE.Math.generateUUID(),this.fixedTimeStep=b.ensureTypedArg(a.fixedTimeStep,c.NUMBER,.016),this.texture=b.ensureInstanceOf(a.texture.value,THREE.Texture,null),this.textureFrames=b.ensureInstanceOf(a.texture.frames,THREE.Vector2,new THREE.Vector2(1,1)),
this.textureFrameCount=b.ensureTypedArg(a.texture.frameCount,c.NUMBER,this.textureFrames.x*this.textureFrames.y),this.textureLoop=b.ensureTypedArg(a.texture.loop,c.NUMBER,1),this.textureFrames.max(new THREE.Vector2(1,1)),this.hasPerspective=b.ensureTypedArg(a.hasPerspective,c.BOOLEAN,!0),this.colorize=b.ensureTypedArg(a.colorize,c.BOOLEAN,!0),this.maxParticleCount=b.ensureTypedArg(a.maxParticleCount,c.NUMBER,null),this.blending=b.ensureTypedArg(a.blending,c.NUMBER,THREE.AdditiveBlending),this.transparent=b.ensureTypedArg(a.transparent,c.BOOLEAN,!0),this.alphaTest=parseFloat(b.ensureTypedArg(a.alphaTest,c.NUMBER,0)),this.depthWrite=b.ensureTypedArg(a.depthWrite,c.BOOLEAN,!1),this.depthTest=b.ensureTypedArg(a.depthTest,c.BOOLEAN,!0),this.fog=b.ensureTypedArg(a.fog,c.BOOLEAN,!0),this.scale=b.ensureTypedArg(a.scale,c.NUMBER,300),this.emitters=[],this.emitterIDs=[],this._pool=[],this._poolCreationSettings=null,this._createNewWhenPoolEmpty=0,this._attributesNeedRefresh=!1,this._attributesNeedDynamicReset=!1,
this.particleCount=0,this.uniforms={texture:{type:"t",value:this.texture},textureAnimation:{type:"v4",value:new THREE.Vector4(this.textureFrames.x,this.textureFrames.y,this.textureFrameCount,Math.max(Math.abs(this.textureLoop),1))},fogColor:{type:"c",value:null},fogNear:{type:"f",value:10},fogFar:{type:"f",value:200},fogDensity:{type:"f",value:.5},deltaTime:{type:"f",value:0},runTime:{type:"f",value:0},scale:{type:"f",value:this.scale}},this.defines={HAS_PERSPECTIVE:this.hasPerspective,COLORIZE:this.colorize,VALUE_OVER_LIFETIME_LENGTH:SPE.valueOverLifetimeLength,SHOULD_ROTATE_TEXTURE:!1,SHOULD_ROTATE_PARTICLES:!1,SHOULD_WIGGLE_PARTICLES:!1,SHOULD_CALCULATE_SPRITE:this.textureFrames.x>1||this.textureFrames.y>1},this.attributes={position:new SPE.ShaderAttribute("v3",!0),acceleration:new SPE.ShaderAttribute("v4",!0),velocity:new SPE.ShaderAttribute("v3",!0),rotation:new SPE.ShaderAttribute("v4",!0),rotationCenter:new SPE.ShaderAttribute("v3",!0),params:new SPE.ShaderAttribute("v4",!0),size:new SPE.ShaderAttribute("v4",!0),
angle:new SPE.ShaderAttribute("v4",!0),color:new SPE.ShaderAttribute("v4",!0),opacity:new SPE.ShaderAttribute("v4",!0)},this.attributeKeys=Object.keys(this.attributes),this.attributeCount=this.attributeKeys.length,this.material=new THREE.ShaderMaterial({uniforms:this.uniforms,vertexShader:SPE.shaders.vertex,fragmentShader:SPE.shaders.fragment,blending:this.blending,transparent:this.transparent,alphaTest:this.alphaTest,depthWrite:this.depthWrite,depthTest:this.depthTest,defines:this.defines,fog:this.fog}),this.geometry=new THREE.BufferGeometry,this.mesh=new THREE.Points(this.geometry,this.material),null===this.maxParticleCount&&console.warn("SPE.Group: No maxParticleCount specified. Adding emitters after rendering will probably cause errors.")},SPE.Group.constructor=SPE.Group,SPE.Group.prototype._updateDefines=function(){"use strict";var a,b=this.emitters,c=b.length-1,d=this.defines;for(c;c>=0;--c)a=b[c],d.SHOULD_CALCULATE_SPRITE||(d.SHOULD_ROTATE_TEXTURE=d.SHOULD_ROTATE_TEXTURE||!!Math.max(Math.max.apply(null,a.angle.value),Math.max.apply(null,a.angle.spread))),
d.SHOULD_ROTATE_PARTICLES=d.SHOULD_ROTATE_PARTICLES||!!Math.max(a.rotation.angle,a.rotation.angleSpread),d.SHOULD_WIGGLE_PARTICLES=d.SHOULD_WIGGLE_PARTICLES||!!Math.max(a.wiggle.value,a.wiggle.spread);this.material.needsUpdate=!0},SPE.Group.prototype._applyAttributesToGeometry=function(){"use strict";var a,b,c=this.attributes,d=this.geometry,e=d.attributes;for(var f in c)c.hasOwnProperty(f)&&(a=c[f],b=e[f],b?b.array=a.typedArray.array:d.addAttribute(f,a.bufferAttribute),a.bufferAttribute.needsUpdate=!0);this.geometry.setDrawRange(0,this.particleCount)},SPE.Group.prototype.addEmitter=function(a){"use strict";if(a instanceof SPE.Emitter==!1)return void console.error("`emitter` argument must be instance of SPE.Emitter. Was provided with:",a);if(this.emitterIDs.indexOf(a.uuid)>-1)return void console.error("Emitter already exists in this group. Will not add again.");if(null!==a.group)return void console.error("Emitter already belongs to another group. Will not add to requested group.");var b=this.attributes,c=this.particleCount,d=c+a.particleCount;
this.particleCount=d,null!==this.maxParticleCount&&this.particleCount>this.maxParticleCount&&console.warn("SPE.Group: maxParticleCount exceeded. Requesting",this.particleCount,"particles, can support only",this.maxParticleCount),a._calculatePPSValue(a.maxAge._value+a.maxAge._spread),a._setBufferUpdateRanges(this.attributeKeys),a._setAttributeOffset(c),a.group=this,a.attributes=this.attributes;for(var e in b)b.hasOwnProperty(e)&&b[e]._createBufferAttribute(null!==this.maxParticleCount?this.maxParticleCount:this.particleCount);for(var f=c;d>f;++f)a._assignPositionValue(f),a._assignForceValue(f,"velocity"),a._assignForceValue(f,"acceleration"),a._assignAbsLifetimeValue(f,"opacity"),a._assignAbsLifetimeValue(f,"size"),a._assignAngleValue(f),a._assignRotationValue(f),a._assignParamsValue(f),a._assignColorValue(f);return this._applyAttributesToGeometry(),this.emitters.push(a),this.emitterIDs.push(a.uuid),this._updateDefines(a),this.material.needsUpdate=!0,this.geometry.needsUpdate=!0,this._attributesNeedRefresh=!0,
this},SPE.Group.prototype.removeEmitter=function(a){"use strict";var b=this.emitterIDs.indexOf(a.uuid);if(a instanceof SPE.Emitter==!1)return void console.error("`emitter` argument must be instance of SPE.Emitter. Was provided with:",a);if(-1===b)return void console.error("Emitter does not exist in this group. Will not remove.");for(var c=a.attributeOffset,d=c+a.particleCount,e=this.attributes.params.typedArray,f=c;d>f;++f)e.array[4*f]=0,e.array[4*f+1]=0;this.emitters.splice(b,1),this.emitterIDs.splice(b,1);for(var g in this.attributes)this.attributes.hasOwnProperty(g)&&this.attributes[g].splice(c,d);this.particleCount-=a.particleCount,a._onRemove(),this._attributesNeedRefresh=!0},SPE.Group.prototype.getFromPool=function(){"use strict";var a=this._pool,b=this._createNewWhenPoolEmpty;if(a.length)return a.pop();if(b){var c=new SPE.Emitter(this._poolCreationSettings);return this.addEmitter(c),c}return null},SPE.Group.prototype.releaseIntoPool=function(a){"use strict";return a instanceof SPE.Emitter==!1?void console.error("Argument is not instanceof SPE.Emitter:",a):(a.reset(),
this._pool.unshift(a),this)},SPE.Group.prototype.getPool=function(){"use strict";return this._pool},SPE.Group.prototype.addPool=function(a,b,c){"use strict";var d;this._poolCreationSettings=b,this._createNewWhenPoolEmpty=!!c;for(var e=0;a>e;++e)d=Array.isArray(b)?new SPE.Emitter(b[e]):new SPE.Emitter(b),this.addEmitter(d),this.releaseIntoPool(d);return this},SPE.Group.prototype._triggerSingleEmitter=function(a){"use strict";var b=this.getFromPool(),c=this;return null===b?void console.log("SPE.Group pool ran out."):(a instanceof THREE.Vector3&&(b.position.value.copy(a),b.position.value=b.position.value),b.enable(),setTimeout(function(){b.disable(),c.releaseIntoPool(b)},1e3*Math.max(b.duration,b.maxAge.value+b.maxAge.spread)),this)},SPE.Group.prototype.triggerPoolEmitter=function(a,b){"use strict";if("number"==typeof a&&a>1)for(var c=0;a>c;++c)this._triggerSingleEmitter(b);else this._triggerSingleEmitter(b);return this},SPE.Group.prototype._updateUniforms=function(a){"use strict";this.uniforms.runTime.value+=a,
this.uniforms.deltaTime.value=a},SPE.Group.prototype._resetBufferRanges=function(){"use strict";var a=this.attributeKeys,b=this.attributeCount-1,c=this.attributes;for(b;b>=0;--b)c[a[b]].resetUpdateRange()},SPE.Group.prototype._updateBuffers=function(a){"use strict";var b,c,d,e=this.attributeKeys,f=this.attributeCount-1,g=this.attributes,h=a.bufferUpdateRanges;for(f;f>=0;--f)b=e[f],c=h[b],d=g[b],d.setUpdateRange(c.min,c.max),d.flagUpdate()},SPE.Group.prototype.tick=function(a){"use strict";var b,c=this.emitters,d=c.length,e=a||this.fixedTimeStep,f=this.attributeKeys,g=this.attributes;if(this._updateUniforms(e),this._resetBufferRanges(),0!==d||this._attributesNeedRefresh!==!1||this._attributesNeedDynamicReset!==!1){for(var h,b=0;d>b;++b)h=c[b],h.tick(e),this._updateBuffers(h);if(this._attributesNeedDynamicReset===!0){for(b=this.attributeCount-1;b>=0;--b)g[f[b]].resetDynamic();this._attributesNeedDynamicReset=!1}if(this._attributesNeedRefresh===!0){for(b=this.attributeCount-1;b>=0;--b)g[f[b]].forceUpdateAll();
this._attributesNeedRefresh=!1,this._attributesNeedDynamicReset=!0}}},SPE.Group.prototype.dispose=function(){"use strict";return this.geometry.dispose(),this.material.dispose(),this},SPE.Emitter=function(a){"use strict";var b=SPE.utils,c=b.types,d=SPE.valueOverLifetimeLength;a=b.ensureTypedArg(a,c.OBJECT,{}),a.position=b.ensureTypedArg(a.position,c.OBJECT,{}),a.velocity=b.ensureTypedArg(a.velocity,c.OBJECT,{}),a.acceleration=b.ensureTypedArg(a.acceleration,c.OBJECT,{}),a.radius=b.ensureTypedArg(a.radius,c.OBJECT,{}),a.drag=b.ensureTypedArg(a.drag,c.OBJECT,{}),a.rotation=b.ensureTypedArg(a.rotation,c.OBJECT,{}),a.color=b.ensureTypedArg(a.color,c.OBJECT,{}),a.opacity=b.ensureTypedArg(a.opacity,c.OBJECT,{}),a.size=b.ensureTypedArg(a.size,c.OBJECT,{}),a.angle=b.ensureTypedArg(a.angle,c.OBJECT,{}),a.wiggle=b.ensureTypedArg(a.wiggle,c.OBJECT,{}),a.maxAge=b.ensureTypedArg(a.maxAge,c.OBJECT,{}),a.onParticleSpawn&&console.warn("onParticleSpawn has been removed. Please set properties directly to alter values at runtime."),
this.uuid=THREE.Math.generateUUID(),this.type=b.ensureTypedArg(a.type,c.NUMBER,SPE.distributions.BOX),this.position={_value:b.ensureInstanceOf(a.position.value,THREE.Vector3,new THREE.Vector3),_spread:b.ensureInstanceOf(a.position.spread,THREE.Vector3,new THREE.Vector3),_spreadClamp:b.ensureInstanceOf(a.position.spreadClamp,THREE.Vector3,new THREE.Vector3),_distribution:b.ensureTypedArg(a.position.distribution,c.NUMBER,this.type),_randomise:b.ensureTypedArg(a.position.randomise,c.BOOLEAN,!1),_radius:b.ensureTypedArg(a.position.radius,c.NUMBER,10),_radiusScale:b.ensureInstanceOf(a.position.radiusScale,THREE.Vector3,new THREE.Vector3(1,1,1)),_distributionClamp:b.ensureTypedArg(a.position.distributionClamp,c.NUMBER,0)},this.velocity={_value:b.ensureInstanceOf(a.velocity.value,THREE.Vector3,new THREE.Vector3),_spread:b.ensureInstanceOf(a.velocity.spread,THREE.Vector3,new THREE.Vector3),_distribution:b.ensureTypedArg(a.velocity.distribution,c.NUMBER,this.type),_randomise:b.ensureTypedArg(a.position.randomise,c.BOOLEAN,!1)
},this.acceleration={_value:b.ensureInstanceOf(a.acceleration.value,THREE.Vector3,new THREE.Vector3),_spread:b.ensureInstanceOf(a.acceleration.spread,THREE.Vector3,new THREE.Vector3),_distribution:b.ensureTypedArg(a.acceleration.distribution,c.NUMBER,this.type),_randomise:b.ensureTypedArg(a.position.randomise,c.BOOLEAN,!1)},this.drag={_value:b.ensureTypedArg(a.drag.value,c.NUMBER,0),_spread:b.ensureTypedArg(a.drag.spread,c.NUMBER,0),_randomise:b.ensureTypedArg(a.position.randomise,c.BOOLEAN,!1)},this.wiggle={_value:b.ensureTypedArg(a.wiggle.value,c.NUMBER,0),_spread:b.ensureTypedArg(a.wiggle.spread,c.NUMBER,0)},this.rotation={_axis:b.ensureInstanceOf(a.rotation.axis,THREE.Vector3,new THREE.Vector3(0,1,0)),_axisSpread:b.ensureInstanceOf(a.rotation.axisSpread,THREE.Vector3,new THREE.Vector3),_angle:b.ensureTypedArg(a.rotation.angle,c.NUMBER,0),_angleSpread:b.ensureTypedArg(a.rotation.angleSpread,c.NUMBER,0),_static:b.ensureTypedArg(a.rotation["static"],c.BOOLEAN,!1),_center:b.ensureInstanceOf(a.rotation.center,THREE.Vector3,this.position._value.clone()),
_randomise:b.ensureTypedArg(a.position.randomise,c.BOOLEAN,!1)},this.maxAge={_value:b.ensureTypedArg(a.maxAge.value,c.NUMBER,2),_spread:b.ensureTypedArg(a.maxAge.spread,c.NUMBER,0)},this.color={_value:b.ensureArrayInstanceOf(a.color.value,THREE.Color,new THREE.Color),_spread:b.ensureArrayInstanceOf(a.color.spread,THREE.Vector3,new THREE.Vector3),_randomise:b.ensureTypedArg(a.position.randomise,c.BOOLEAN,!1)},this.opacity={_value:b.ensureArrayTypedArg(a.opacity.value,c.NUMBER,1),_spread:b.ensureArrayTypedArg(a.opacity.spread,c.NUMBER,0),_randomise:b.ensureTypedArg(a.position.randomise,c.BOOLEAN,!1)},this.size={_value:b.ensureArrayTypedArg(a.size.value,c.NUMBER,1),_spread:b.ensureArrayTypedArg(a.size.spread,c.NUMBER,0),_randomise:b.ensureTypedArg(a.position.randomise,c.BOOLEAN,!1)},this.angle={_value:b.ensureArrayTypedArg(a.angle.value,c.NUMBER,0),_spread:b.ensureArrayTypedArg(a.angle.spread,c.NUMBER,0),_randomise:b.ensureTypedArg(a.position.randomise,c.BOOLEAN,!1)},this.particleCount=b.ensureTypedArg(a.particleCount,c.NUMBER,100),
this.duration=b.ensureTypedArg(a.duration,c.NUMBER,null),this.isStatic=b.ensureTypedArg(a.isStatic,c.BOOLEAN,!1),this.activeMultiplier=b.ensureTypedArg(a.activeMultiplier,c.NUMBER,1),this.direction=b.ensureTypedArg(a.direction,c.NUMBER,1),this.alive=b.ensureTypedArg(a.alive,c.BOOLEAN,!0),this.particlesPerSecond=0,this.activationIndex=0,this.attributeOffset=0,this.attributeEnd=0,this.age=0,this.activeParticleCount=0,this.group=null,this.attributes=null,this.paramsArray=null,this.resetFlags={position:b.ensureTypedArg(a.position.randomise,c.BOOLEAN,!1)||b.ensureTypedArg(a.radius.randomise,c.BOOLEAN,!1),velocity:b.ensureTypedArg(a.velocity.randomise,c.BOOLEAN,!1),acceleration:b.ensureTypedArg(a.acceleration.randomise,c.BOOLEAN,!1)||b.ensureTypedArg(a.drag.randomise,c.BOOLEAN,!1),rotation:b.ensureTypedArg(a.rotation.randomise,c.BOOLEAN,!1),rotationCenter:b.ensureTypedArg(a.rotation.randomise,c.BOOLEAN,!1),size:b.ensureTypedArg(a.size.randomise,c.BOOLEAN,!1),color:b.ensureTypedArg(a.color.randomise,c.BOOLEAN,!1),
opacity:b.ensureTypedArg(a.opacity.randomise,c.BOOLEAN,!1),angle:b.ensureTypedArg(a.angle.randomise,c.BOOLEAN,!1)},this.updateFlags={},this.updateCounts={},this.updateMap={maxAge:"params",position:"position",velocity:"velocity",acceleration:"acceleration",drag:"acceleration",wiggle:"params",rotation:"rotation",size:"size",color:"color",opacity:"opacity",angle:"angle"};for(var e in this.updateMap)this.updateMap.hasOwnProperty(e)&&(this.updateCounts[this.updateMap[e]]=0,this.updateFlags[this.updateMap[e]]=!1,this._createGetterSetters(this[e],e));this.bufferUpdateRanges={},this.attributeKeys=null,this.attributeCount=0,b.ensureValueOverLifetimeCompliance(this.color,d,d),b.ensureValueOverLifetimeCompliance(this.opacity,d,d),b.ensureValueOverLifetimeCompliance(this.size,d,d),b.ensureValueOverLifetimeCompliance(this.angle,d,d)},SPE.Emitter.constructor=SPE.Emitter,SPE.Emitter.prototype._createGetterSetters=function(a,b){"use strict";var c=this;for(var d in a)if(a.hasOwnProperty(d)){var e=d.replace("_","");
Object.defineProperty(a,e,{get:function(a){return function(){return this[a]}}(d),set:function(a){return function(d){var e=c.updateMap[b],f=this[a],g=SPE.valueOverLifetimeLength;"_rotationCenter"===a?(c.updateFlags.rotationCenter=!0,c.updateCounts.rotationCenter=0):"_randomise"===a?c.resetFlags[e]=d:(c.updateFlags[e]=!0,c.updateCounts[e]=0),c.group._updateDefines(),this[a]=d,Array.isArray(f)&&SPE.utils.ensureValueOverLifetimeCompliance(c[b],g,g)}}(d)})}},SPE.Emitter.prototype._setBufferUpdateRanges=function(a){"use strict";this.attributeKeys=a,this.attributeCount=a.length;for(var b=this.attributeCount-1;b>=0;--b)this.bufferUpdateRanges[a[b]]={min:Number.POSITIVE_INFINITY,max:Number.NEGATIVE_INFINITY}},SPE.Emitter.prototype._calculatePPSValue=function(a){"use strict";var b=this.particleCount;this.duration?this.particlesPerSecond=b/(a<this.duration?a:this.duration):this.particlesPerSecond=b/a},SPE.Emitter.prototype._setAttributeOffset=function(a){this.attributeOffset=a,this.activationIndex=a,
this.activationEnd=a+this.particleCount},SPE.Emitter.prototype._assignValue=function(a,b){"use strict";switch(a){case"position":this._assignPositionValue(b);break;case"velocity":case"acceleration":this._assignForceValue(b,a);break;case"size":case"opacity":this._assignAbsLifetimeValue(b,a);break;case"angle":this._assignAngleValue(b);break;case"params":this._assignParamsValue(b);break;case"rotation":this._assignRotationValue(b);break;case"color":this._assignColorValue(b)}},SPE.Emitter.prototype._assignPositionValue=function(a){"use strict";var b=SPE.distributions,c=SPE.utils,d=this.position,e=this.attributes.position,f=d._value,g=d._spread,h=d._distribution;switch(h){case b.BOX:c.randomVector3(e,a,f,g,d._spreadClamp);break;case b.SPHERE:c.randomVector3OnSphere(e,a,f,d._radius,d._spread.x,d._radiusScale,d._spreadClamp.x,d._distributionClamp||this.particleCount);break;case b.DISC:c.randomVector3OnDisc(e,a,f,d._radius,d._spread.x,d._radiusScale,d._spreadClamp.x)}},SPE.Emitter.prototype._assignForceValue=function(a,b){
"use strict";var c,d,e,f,g,h=SPE.distributions,i=SPE.utils,j=this[b],k=j._value,l=j._spread,m=j._distribution;switch(m){case h.BOX:i.randomVector3(this.attributes[b],a,k,l);break;case h.SPHERE:c=this.attributes.position.typedArray.array,g=3*a,d=c[g],e=c[g+1],f=c[g+2],i.randomDirectionVector3OnSphere(this.attributes[b],a,d,e,f,this.position._value,j._value.x,j._spread.x);break;case h.DISC:c=this.attributes.position.typedArray.array,g=3*a,d=c[g],e=c[g+1],f=c[g+2],i.randomDirectionVector3OnDisc(this.attributes[b],a,d,e,f,this.position._value,j._value.x,j._spread.x)}if("acceleration"===b){var n=i.clamp(i.randomFloat(this.drag._value,this.drag._spread),0,1);this.attributes.acceleration.typedArray.array[4*a+3]=n}},SPE.Emitter.prototype._assignAbsLifetimeValue=function(a,b){"use strict";var c,d=this.attributes[b].typedArray,e=this[b],f=SPE.utils;f.arrayValuesAreEqual(e._value)&&f.arrayValuesAreEqual(e._spread)?(c=Math.abs(f.randomFloat(e._value[0],e._spread[0])),d.setVec4Components(a,c,c,c,c)):d.setVec4Components(a,Math.abs(f.randomFloat(e._value[0],e._spread[0])),Math.abs(f.randomFloat(e._value[1],e._spread[1])),Math.abs(f.randomFloat(e._value[2],e._spread[2])),Math.abs(f.randomFloat(e._value[3],e._spread[3])));
},SPE.Emitter.prototype._assignAngleValue=function(a){"use strict";var b,c=this.attributes.angle.typedArray,d=this.angle,e=SPE.utils;e.arrayValuesAreEqual(d._value)&&e.arrayValuesAreEqual(d._spread)?(b=e.randomFloat(d._value[0],d._spread[0]),c.setVec4Components(a,b,b,b,b)):c.setVec4Components(a,e.randomFloat(d._value[0],d._spread[0]),e.randomFloat(d._value[1],d._spread[1]),e.randomFloat(d._value[2],d._spread[2]),e.randomFloat(d._value[3],d._spread[3]))},SPE.Emitter.prototype._assignParamsValue=function(a){"use strict";this.attributes.params.typedArray.setVec4Components(a,this.isStatic?1:0,0,Math.abs(SPE.utils.randomFloat(this.maxAge._value,this.maxAge._spread)),SPE.utils.randomFloat(this.wiggle._value,this.wiggle._spread))},SPE.Emitter.prototype._assignRotationValue=function(a){"use strict";this.attributes.rotation.typedArray.setVec3Components(a,SPE.utils.getPackedRotationAxis(this.rotation._axis,this.rotation._axisSpread),SPE.utils.randomFloat(this.rotation._angle,this.rotation._angleSpread),this.rotation._static?0:1),
this.attributes.rotationCenter.typedArray.setVec3(a,this.rotation._center)},SPE.Emitter.prototype._assignColorValue=function(a){"use strict";SPE.utils.randomColorAsHex(this.attributes.color,a,this.color._value,this.color._spread)},SPE.Emitter.prototype._resetParticle=function(a){"use strict";for(var b,c,d=this.resetFlags,e=this.updateFlags,f=this.updateCounts,g=this.attributeKeys,h=this.attributeCount-1;h>=0;--h)b=g[h],c=e[b],d[b]!==!0&&c!==!0||(this._assignValue(b,a),this._updateAttributeUpdateRange(b,a),c===!0&&f[b]===this.particleCount?(e[b]=!1,f[b]=0):1==c&&++f[b])},SPE.Emitter.prototype._updateAttributeUpdateRange=function(a,b){"use strict";var c=this.bufferUpdateRanges[a];c.min=Math.min(b,c.min),c.max=Math.max(b,c.max)},SPE.Emitter.prototype._resetBufferRanges=function(){"use strict";var a,b=this.bufferUpdateRanges,c=this.bufferUpdateKeys,d=this.bufferUpdateCount-1;for(d;d>=0;--d)a=c[d],b[a].min=Number.POSITIVE_INFINITY,b[a].max=Number.NEGATIVE_INFINITY},SPE.Emitter.prototype._onRemove=function(){
"use strict";this.particlesPerSecond=0,this.attributeOffset=0,this.activationIndex=0,this.activeParticleCount=0,this.group=null,this.attributes=null,this.paramsArray=null,this.age=0},SPE.Emitter.prototype._decrementParticleCount=function(){"use strict";--this.activeParticleCount},SPE.Emitter.prototype._incrementParticleCount=function(){"use strict";++this.activeParticleCount},SPE.Emitter.prototype._checkParticleAges=function(a,b,c,d){"use strict";for(var e,f,g,h,i=b-1;i>=a;--i)e=4*i,h=c[e],0!==h&&(g=c[e+1],f=c[e+2],1===this.direction?(g+=d,g>=f&&(g=0,h=0,this._decrementParticleCount())):(g-=d,0>=g&&(g=f,h=0,this._decrementParticleCount())),c[e]=h,c[e+1]=g,this._updateAttributeUpdateRange("params",i))},SPE.Emitter.prototype._activateParticles=function(a,b,c,d){"use strict";for(var e,f,g=this.direction,h=a;b>h;++h)e=4*h,0!=c[e]&&1!==this.particleCount||(this._incrementParticleCount(),c[e]=1,this._resetParticle(h),f=d*(h-a),c[e+1]=-1===g?c[e+2]-f:f,this._updateAttributeUpdateRange("params",h));
},SPE.Emitter.prototype.tick=function(a){"use strict";if(!this.isStatic){null===this.paramsArray&&(this.paramsArray=this.attributes.params.typedArray.array);var b=this.attributeOffset,c=b+this.particleCount,d=this.paramsArray,e=this.particlesPerSecond*this.activeMultiplier*a,f=this.activationIndex;if(this._resetBufferRanges(),this._checkParticleAges(b,c,d,a),this.alive===!1)return void(this.age=0);if(null!==this.duration&&this.age>this.duration)return this.alive=!1,void(this.age=0);var g=1===this.particleCount?f:0|f,h=Math.min(g+e,this.activationEnd),i=h-this.activationIndex|0,j=i>0?a/i:0;this._activateParticles(g,h,d,j),this.activationIndex+=e,this.activationIndex>c&&(this.activationIndex=b),this.age+=a}},SPE.Emitter.prototype.reset=function(a){"use strict";if(this.age=0,this.alive=!1,a===!0){for(var b,c=this.attributeOffset,d=c+this.particleCount,e=this.paramsArray,f=this.attributes.params.bufferAttribute,g=d-1;g>=c;--g)b=4*g,e[b]=0,e[b+1]=0;f.updateRange.offset=0,f.updateRange.count=-1,
f.needsUpdate=!0}return this},SPE.Emitter.prototype.enable=function(){"use strict";return this.alive=!0,this},SPE.Emitter.prototype.disable=function(){"use strict";return this.alive=!1,this},SPE.Emitter.prototype.remove=function(){"use strict";return null!==this.group?this.group.removeEmitter(this):console.error("Emitter does not belong to a group, cannot remove."),this};;
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
			"water": "assets/images/water.jpg",
			'smokeparticle': 'assets/images/smokeparticle.png'
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
window.M = window.M || {};
M.fx = M.fx || {},

M.fx.particlesEngine = {

	PARTICLES_DIR : "app/particles/",

	PARTICLES: [],

	map: new HashMap(),
	particles: [],

	particles: {},
	numParticles : 0,
	particlesLoaded : 0,
	update: function() {
		//console.log("inside old update particlesEngine");
	},

	load: function() {

		if (Assets.Particles) {
			for (var particle in Assets.Particles) {
				M.fx.particlesEngine.numParticles++;
				M.fx.particlesEngine.loadSingleFile(particle, Assets.particles[particle]);
			}
		}

		if (M.fx.particlesEngine.numParticles == 0) {
			M.assetsManager.completed.particles = true;
		}
	},

	get: function(id) {
		//returning stored particle;
		return M.fx.particlesEngine.map.get(id) || false;
	},

	loadSingleFile: function(id, path) {
		// @todo this has to be changed. We can load a M.fx.createparticle file, a custom particle or a threejs particle/material.
		var type = path.split(".")[1];
		if ( type == "js" ) {
			include(path.split(".js")[0], this.checkLoad);
		} else {
			var request = new XMLHttpRequest();
			request.open("GET", path, true);
			request.responseType = "text";
			request.onload = function(e) {
				var particle = M.fx.particlesEngine._parseParticle(this.responseText);
				M.fx.particlesEngine.map.put(id, particle);
				M.fx.particlesEngine.particlesLoaded++;
				M.fx.particlesEngine.checkLoad();
			};
			request.send();
		}
	},

	_parseParticle: function(text) {
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

		M.fx.particlesEngine.PARTICLES.push(name);
		M.fx.particlesEngine.map.put( name, obj );
	},

	checkLoad: function() {
		if (M.fx.particlesEngine.particlesLoaded == M.fx.particlesEngine.numParticles) {
			M.assetsManager.completed.particles = true;
		}
	},

	//add method
	add: function(particle) {
		M.fx.particlesEngine.PARTICLES.push(particle);
	},
};;
M.fx.particlesEngine.create('Rain', {
    /*
    instance: function(options) {
        var opts = {
            positionStyle    : Type.CUBE,
            positionBase     : new THREE.Vector3( 0, 200, 0 ),
            positionSpread   : new THREE.Vector3( 600, 0, 600 ),

            velocityStyle    : Type.CUBE,
            velocityBase     : new THREE.Vector3( 0, -400, 0 ),
            velocitySpread   : new THREE.Vector3( 10, 50, 10 ),
            accelerationBase : new THREE.Vector3( 0, -10,0 ),

            //particleTexture : THREE.ImageUtils.loadTexture( 'img/raindrop2flip.png' ),

            sizeBase    : 8.0,
            sizeSpread  : 4.0,
            colorBase   : new THREE.Vector3(0.66, 1.0, 0.7), // H,S,L
            colorSpread : new THREE.Vector3(0.00, 0.0, 0.2),
            opacityBase : 0.6,

            particlesPerSecond : 1000,
            particleDeathAge   : 1.0,
            emitterDeathAge    : 60
        };

        Object.assign(opts, options);

        var system = new ParticleSystem();
	    system.setValues(opts);
	    system.initialize();

        return system;
    },*/

    instance: function(options) {
        var particleGroup = new SPE.Group({
            texture: {
                value: options.texture
            }
        });
        var emitter = new SPE.Emitter({
            maxAge: {
                value: 2
            },
            position: {
                value: new THREE.Vector3(0, 0, -50),
                spread: new THREE.Vector3( 0, 0, 0 )
            },
            acceleration: {
                value: new THREE.Vector3(0, -10, 0),
                spread: new THREE.Vector3( 10, 0, 10 )
            },
            velocity: {
                value: new THREE.Vector3(0, 25, 0),
                spread: new THREE.Vector3(10, 7.5, 10)
            },
            color: {
                value: [ new THREE.Color('white'), new THREE.Color('red') ]
            },
            size: {
                value: 1
            },
            particleCount: 2000
        });
        particleGroup.addEmitter( emitter );
        particleGroup.clock = new THREE.Clock();

        particleGroup.render = function() {
            particleGroup.tick(particleGroup.clock.getDelta());
        }

        return particleGroup;
    }
});;
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
            ocean.lastTime = (new Date()).getTime();
            ocean.materialOcean.uniforms.u_projectionMatrix = { type: "m4", value: camera.projectionMatrix };
            ocean.materialOcean.uniforms.u_viewMatrix = { type: "m4", value: camera.matrixWorldInverse };
            ocean.materialOcean.uniforms.u_cameraPosition = { type: "v3", value: camera.position };

            ocean.render = function() {
                var currentTime = new Date().getTime();
                ocean.deltaTime = (currentTime - ocean.lastTime) / 1000 || 0.0;
                ocean.lastTime = currentTime;
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
                ocean.materialOcean.uniforms.u_projectionMatrix.value = camera.projectionMatrix;
                ocean.materialOcean.uniforms.u_viewMatrix.value = camera.matrixWorldInverse;
                ocean.materialOcean.uniforms.u_cameraPosition.value = camera.position;
                ocean.materialOcean.depthTest = true;
            }
            
            return ocean;
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

