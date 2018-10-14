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
export function randomColor() {
	const letters = '0123456789ABCDEF'.split('');
	let color = '#';
	for (let i = 0; i < 6; i++ ) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

export function componentToHex(c) {
	const hex = c.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
}

export function rgbToHex(r, g, b) {
	return "0x" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

export function getIntValueFromHex(hex) {
	return parseInt(hex, 16);
}
;
import AudioEngine from '../audio/AudioEngine';
import VideoEngine from '../video/VideoEngine';
import ImagesEngine from '../images/ImagesEngine';
import ModelsEngine from '../models/ModelsEngine';
import ShadersEngine from '../fx/shaders/ShadersEngine';

export default class AssetsManager {

	constructor() {
		this.completed = {
			sound: false,
			video: true,
			images: false,
			models: false,
			shaders: false
		}

		this.audioEngine = new AudioEngine(this);
		this.videoEngine = new VideoEngine(this);
		this.imagesEngine = new ImagesEngine(this);
		this.modelsEngine = new ModelsEngine(this);
		this.shadersEngine = new ShadersEngine(this);
	}

	load(callback) {

		return Promise.all([
			this.audioEngine.load(),
			this.videoEngine.load(),
			this.imagesEngine.load(),
			this.modelsEngine.load(),
			this.shadersEngine.load()
		]).then(() => {
			callback();
			this.loadingMessage(true);
		}).catch((e) => {
			callback(e);
			this.loadingMessage(false);
		});
	}

	loadingMessage(loaded) {}
}
;
export default class VideoEngine {

    constructor() {}

    load() {}
}
;
export default class ImagesEngine {

	constructor(assetsManager) {
		this.numImages = 0;
		this.imagesLoaded = 0;
		this.defaults = {
			"waterNormal": "assets/images/waternormals.jpg",
			"water": "assets/images/water.jpg",
			'smokeparticle': 'assets/images/smokeparticle.png'
		};

		this.imagesDefault = {
			"skybox": "assets/images/skybox_1.png"
		};

		this.map = {};
		this.images = [];
		this.numImages = 0;
		this.loader = new THREE.TextureLoader();
		this.imageLoader = new THREE.ImageLoader();

		this.assetsManager = assetsManager;
	}

	load() {
		// extending assets images with our defaults
		Object.assign(Assets.Textures, this.defaults);
		Object.assign(Assets.Images, this.imagesDefault);

		for (var image in Assets.Textures) {
			this.numImages++;
			this.loadSingleFile(image, Assets.Textures[image]);
		}

		for (var image in Assets.Images) {
			this.numImages++;
			this.loadSingleImage(image, Assets.Images[image]);
		}

		if (this.numImages == 0) {
			this.assetsManager.completed.images = true;
		}
	}

	get(key) {
		return this.map[key] || false;
	}

	loadSingleImage(id, path) {
		try {
			this.imagesLoaded++;
			this.imageLoader.load(path, function(image) {
				this.map[id] = image;
				this.checkLoad();
			}, function() {
				// displaying progress
			}, function() {
				console.log('An error occurred while fetching texture.');
				this.checkLoad();
			});
		} catch (e) {
			console.log('[MAGE] error loading image ' + id + ' at path ' + path);
		}
	}

	loadSingleFile(id, path) {
		try {
			this.imagesLoaded++;
			this.loader.load(path, function(texture) {
				this.map.put(id, texture);
				this.checkLoad();
			}, function() {
				// displaying progress
			}, function() {
				console.log('An error occurred while fetching texture.');
				this.checkLoad();
			});
		} catch (e) {

		}
	}

	checkLoad() {
		if (this.imagesLoaded == this.numImages) {
			this.assetsManager.completed.images = true;
		}
	}

	add(id, image) {
		if (id && image) {
			this.map.put(id, image);
		}
	}
}
;
class LigthEngine {

    constructor() {
        this.delayFactor = 0.1;
        this.delayStep = 30;
        this.holderRadius = 0.01;
        this.holderSegments = 1;
        this.numLights = 0;

        this.map = {};
        this.lights = [];
    }

    add(light) {
        this.lights.push(light);
    }

    update() {
        var start = new Date();
        for (var index in this.lights) {
            var light = this.lights[index];
            light.update(app.clock.getDelta());
            if ((+new Date() - start) > 50) return;
        }
    }
}

export default new LightEngine();
;
import Mesh from '../entities/Mesh';

export default class ModelsEngine {

	constructor(assetsManager) {
		this.loaders = THREE.JSONLoader(),
		this.numModels = 0;
		this.modelsLoaded = 0;
		this.assetsManager = assetsManager;
	}

	load() {
		this.map = {};
		this.models = [];

		for (var model in Assets.Models) {
			this.numModels++;
			this.loadSingleFile(model, Assets.Models[model]);
		}

		if (this.numModels == 0) {
			this.assetsManager.completed.models = true;
		}
	}

	get(id) {
		var model = this.map[id] || false;
		if (model) {
			model.material.wireframe = false;
			return new Mesh(model.geometry, model.material);
		}
		return false;
	}

	loadSingleFile(id, path) {
		// Load a sound file using an ArrayBuffer XMLHttpRequest.
		this.loader.load(path, function(geometry, materials) {
            var faceMaterial;
            if (materials && materials.length > 0) {
                var material = materials[0];
                material.morphTargets = true;
                faceMaterial = new THREE.MultiMaterial(materials);
            } else {
                faceMaterial = new THREE.MeshLambertMaterial({wireframe: true});
            }

            var model = {
				geometry: geometry,
				material: faceMaterial
			}

			this.map[id] = model;
			this.modelsLoaded++;
			this.checkLoad();
        });
	}

	checkLoad() {
		if (this.modelsLoaded == this.numModels) {
			this.assetsManager.completed.models = true;
		}
	}

	add(model) {
		this.models.push(model);
	}
}
;
export default class ShadersEngine {

	constructor(assetsManager) {
		this.SHADERS_DIR = "app/shaders/";
		this.SHADERS = [];

		this.map = {};
		this.shaders = [];

		this.numShaders = 0;
		this.shadersLoaded = 0;
		this.assetsManager = assetsManager;
	}

	load() {
		if (Assets.Shaders) {
			for (var shader in Assets.Shaders) {
				this.numShaders++;
				this.loadSingleFile(shader, Assets.Shaders[shader]);
			}
		}

		if (this.numShaders == 0) {
			this.assetsManager.completed.shaders = true;
		}
	}

	get(id) {
		return this.map[id] || false;
	}

	loadSingleFile(id, path) {
		const type = path.split(".")[1];

		if ( type == "js" ) {
			include(path.split(".js")[0], this.checkLoad);
		} else {
			const request = new XMLHttpRequest();
			request.open("GET", path, true);
			request.responseType = "text";
			request.onload = (e) => {
				const shader = this.parseShader(request.responseText);
				this.map[id] = shader;
				this.shadersLoaded++;
				this.checkLoad();
			};
			request.send();
		}
	}

	parseShader(text) {
		return {
			name: text.substring(text.indexOf("<name>") + 6, text.indexOf("</name>")),
			vertex: text.substring(text.indexOf("<vertex>") + 8, text.indexOf("</vertex>")),
			fragment: text.substring(text.indexOf("<fragment>") + 10, text.indexOf("</fragment>")),
			options: {},
			attributes: {},
			uniforms: {}
		}
	}

	create(name, params) {
		this.SHADERS.push(name);
		this.map.put(name, {
			name,
			vertex: params.vertex || "",
			fragment: params.fragment || "",
			options: params.options || {},
			attributes: params.attributes || {},
			uniforms: params.uniforms || {},
			instance: params.instance || false
		});
	}

	checkLoad() {
		if (this.shadersLoaded == this.numShaders) {
			this.assetsManager.completed.shaders = true;
		}
	}

	add(shader) {
		this.shaders.push(shader);
	}
}
;
//M.fx.particlesEngine = {
import { include } from '../../base/util';
import Rain from './Rain';
import Clouds from './Clouds';

export default class ParticleEngine {

	constructor(assetsManager) {
		this.PARTICLES_DIR = 'app/particles/';
		this.PARTICLES = [];

		this.map = {
			'Rain': Rain,
			'Clouds': Clouds
		};
		this.particles = [];

		this.particles = {};
		this.numParticles  = 0;
		this.particlesLoaded  = 0;

		this.assetsManager = assetsManager;
	}

	load() {

		if (Assets.Particles) {
			for (var particle in Assets.Particles) {
				this.numParticles++;
				this.loadSingleFile(particle, Assets.particles[particle]);
			}
		}

		if (this.numParticles == 0) {
			this.assetsManager.completed.particles = true;
		}
	}

	get(id) {
		//returning stored particle;
		return this.map[id] || false;
	}

	loadSingleFile(id, path) {
		// @todo this has to be changed. We can load a M.fx.createparticle file, a custom particle or a threejs particle/material.
		const type = path.split(".")[1];
		if ( type == "js" ) {
			include(path.split(".js")[0], this.checkLoad);
		} else {
			const request = new XMLHttpRequest();
			request.open("GET", path, true);
			request.responseType = "text";
			request.onload = (e) => {
				var particle = this.parseParticle(request.responseText);
				this.map[id] = particle;
				this.particlesLoaded++;
				this.checkLoad();
			};
			request.send();
		}
	}

	parseParticle(text) {
		var obj = {};
		obj.name = text.substring(text.indexOf("<name>")+6, text.indexOf("</name>"));
		obj.vertex = text.substring(text.indexOf("<vertex>")+8, text.indexOf("</vertex>"));
		obj.fragment = text.substring(text.indexOf("<fragment>")+10, text.indexOf("</fragment>"));
		obj.options = {};
		obj.attributes = {};
		obj.uniforms = {};
		return obj;
	}

	create(name, params) {
		const obj = {};

		obj.name = name;
		obj.vertex = params.vertex || "";
		obj.fragment = params.fragment || "";
		obj.options = params.options || {};
		obj.attributes = params.attributes || {};
		obj.uniforms = params.uniforms || {};
		obj.instance = params.instance || false;

		this.PARTICLES.push(name);
		this.map[name] = obj;
	}



	checkLoad() {
		if (this.particlesLoaded == this.numParticles) {
			this.assetsManager.completed.particles = true;
		}
	}

	add(particle) {
		this.PARTICLES.push(particle);
	}
}
;
export default class Rain {

    constructor(options) {
        this.particleGroup = new SPE.Group({
            texture: {
                value: options.texture
            }
        });

        this.emitter = new SPE.Emitter({
            maxAge: {
                value: options.maxAge || 2
            },
            position: {
                value: options.positionValue || new THREE.Vector3(0, 0, -50),
                spread: options.positionSpread || new THREE.Vector3( 0, 0, 0 )
            },
            acceleration: {
                value: options.accelerationValue || new THREE.Vector3(0, -10, 0),
                spread: options.accelerationSpread || new THREE.Vector3( 10, 0, 10 )
            },
            velocity: {
                value: options.velocityValue || new THREE.Vector3(0, 25, 0),
                spread: options.velocitySpread || new THREE.Vector3(10, 7.5, 10)
            },
            color: {
                value: options.colorValue || [ new THREE.Color('white'), new THREE.Color('red') ]
            },
            size: {
                value: options.sizeValue || 10
            },
            particleCount: options.particleCount || 2000
        });

        this.particleGroup.addEmitter(this.emitter);
        this.particleGroup.clock = new THREE.Clock();
    }

    render() {
        this.particleGroup.tick(this.particleGroup.clock.getDelta());
    }
}
;
export default Clouds {

    constructor(options) {
        this.particleGroup = new SPE.Group({
            texture: {
                value: options.texture
            },
            blending: THREE.NormalBlending,
            fog: true
        });

        this.emitter = new SPE.Emitter({
            particleCount: options.particleCount || 750,
            maxAge: {
                value: options.maxAge || 3,
            },
            position: {
                value: options.positionValue || new THREE.Vector3(0, -15, -50),
                spread: options.positionSpread || new THREE.Vector3(100, 30, 100 )
            },
            velocity: {
               value: options.velocityValue || new THREE.Vector3(0, 0, 30),
            },
            wiggle: {
                spread: options.wiggle || 10
            },
            size: {
                value: options.sizeValue || 75,
                spread: options.sizeSpread || 50
            },
            opacity: {
                value: options.opacityValue || [ 0, 1, 0 ]
            },
            color: {
                value: options.colorValue || new THREE.Color( 1, 1, 1 ),
                spread: options.colorSpread || new THREE.Color( 0.1, 0.1, 0.1 )
            },
            angle: {
                value: options.angleValue || [ 0, Math.PI * 0.125 ]
            }
        });

        this.particleGroup.addEmitter( emitter );
        this.particleGroup.clock = new THREE.Clock();
    }

    render() {
        this.particleGroup.tick(this.particleGroup.clock.getDelta());
    }
}
;
export default class Skybox {

    static get options() {
        return {
            textureName: {
                name: 'texture',
                type: 'string',
                default: 'skybox',
                mandatory: true
            }
        }
    }

    constructor(imagesEngine, options) {
        this.cubeMap = new THREE.CubeTexture( [] );
        this.cubeMap.format = THREE.RGBFormat;

        if (options.texture) {
            this.buildCube(options.texture);
        } else {
            var textureName = options.textureName || 'skybox';
            this.buildCube(imagesEngine.get(textureName));
        }

        const cubeShader = THREE.ShaderLib[ 'cube' ];
        cubeShader.uniforms[ 'tCube' ].value = this.cubeMap;


        const skyBoxMaterial = new THREE.ShaderMaterial( {
            fragmentShader: cubeShader.fragmentShader,
            vertexShader: cubeShader.vertexShader,
            uniforms: cubeShader.uniforms,
            depthWrite: false,
            side: THREE.BackSide
        });

        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry( 1000000, 1000000, 1000000 ),
            skyBoxMaterial
        );
    }

    buildCube(image) {
        this.cubeMap.images[ 0 ] = this.getSide(image, 2, 1 ); // px
        this.cubeMap.images[ 1 ] = this.getSide(image, 0, 1 ); // nx
        this.cubeMap.images[ 2 ] = this.getSide(image, 1, 0 ); // py
        this.cubeMap.images[ 3 ] = this.getSide(image, 1, 2 ); // ny
        this.cubeMap.images[ 4 ] = this.getSide(image, 1, 1 ); // pz
        this.cubeMap.images[ 5 ] = this.getSide(image, 3, 1 ); // nz
        this.cubeMap.needsUpdate = true;
    }

    getSide(image, x, y ) {
        const size = 1024;
        const canvas = document.createElement( 'canvas' );
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext( '2d' );
        context.drawImage( image, - x * size, - y * size );
        return canvas;
    }
}
;
export default class Atmosphere {

	constructor() {
		this.options = {
			side: THREE.FrontSide,
			blending: THREE.AdditiveBlending,
			transparent: true,
			depthWrite: false,
		};

		this.attributes = {};
	}

	vertex() {
		return [
			'varying vec3 vNormal;',
			'void main(){',
			'	// compute intensity',
			'	vNormal		= normalize( normalMatrix * normal );',
			'	// set gl_Position',
			'	gl_Position	= projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
			'}',
		].join('\n');
	}

	fragment() {
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
	}

	uniforms() {
		return {
			coeficient: {
				type: "f",
				value: 1.0
			},
			power: {
				type: "f",
				value: 2
			},
			glowColor: {
				type: "c",
				value: new THREE.Color('pink')
			},
		};
	}
}
;
/**
 * @author Slayvin / http://slayvin.net
 */
import {
	Object3D,
	Color,
	Matrix4,
	Vector3,
	Vector4,
	ArrowHelper,
	Geometry,
	Line,
	LineBasicMaterial,
	PerspectiveCamera,
	ShaderMaterial,
	WebGLRenderTarget,
	UniformsUtils,
	Math,
	Scene,
	LinearFilter,
	RGBFormat,
	Plane
} from 'three';

export deafult class MirrorShader extends Object3D {

	uniforms() {
        return {
            "mirrorColor": { type: "c", value: new Color(0x7F7F7F) },
			"mirrorSampler": { type: "t", value: null },
			"textureMatrix" : { type: "m4", value: new Matrix4() }
        };
	}

	vertex() {
        return [

            "uniform mat4 textureMatrix;",

            "varying vec4 mirrorCoord;",

            "void main() {",

                "vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);",
                "vec4 worldPosition = modelMatrix * vec4(position, 1.0);",
                "mirrorCoord = textureMatrix * worldPosition;",

                "gl_Position = projectionMatrix * mvPosition;",

            "}"

        ].join("\n");
    }

	fragment() {
        return [

            "uniform vec3 mirrorColor;",
            "uniform sampler2D mirrorSampler;",

            "varying vec4 mirrorCoord;",

            "float blendOverlay(float base, float blend) {",
                "return(base < 0.5 ? (2.0 * base * blend) : (1.0 - 2.0 * (1.0 - base) * (1.0 - blend)));",
            "}",

            "void main() {",

                "vec4 color = texture2DProj(mirrorSampler, mirrorCoord);",
                "color = vec4(blendOverlay(mirrorColor.r, color.r), blendOverlay(mirrorColor.g, color.g), blendOverlay(mirrorColor.b, color.b), 1.0);",

                "gl_FragColor = color;",

            "}"

        ].join("\n");
    }

	constructor(renderer, camera, scene, options) {
		super();

		this.name = 'mirror_' + this.id;

		options = options || {};

		this.matrixNeedsUpdate = true;

		var width = options.textureWidth !== undefined ? options.textureWidth : 512;
		var height = options.textureHeight !== undefined ? options.textureHeight : 512;

		this.clipBias = options.clipBias !== undefined ? options.clipBias : 0.0;

		var mirrorColor = options.color !== undefined ? new Color(options.color) : new Color(0x7F7F7F);

		this.renderer = renderer;
		this.mirrorPlane = new Plane();
		this.normal = new Vector3(0, 0, 1);
		this.mirrorWorldPosition = new Vector3();
		this.cameraWorldPosition = new Vector3();
		this.rotationMatrix = new Matrix4();
		this.lookAtPosition = new Vector3(0, 0, - 1);
		this.clipPlane = new Vector4();

		// For debug only, show the normal and plane of the mirror
		var debugMode = options.debugMode !== undefined ? options.debugMode : false;

		if (debugMode) {

			var arrow = new ArrowHelper(new Vector3(0, 0, 1), new Vector3(0, 0, 0), 10, 0xffff80);
			var planeGeometry = new Geometry();
			planeGeometry.vertices.push(new Vector3(- 10, - 10, 0));
			planeGeometry.vertices.push(new Vector3(10, - 10, 0));
			planeGeometry.vertices.push(new Vector3(10, 10, 0));
			planeGeometry.vertices.push(new Vector3(- 10, 10, 0));
			planeGeometry.vertices.push(planeGeometry.vertices[ 0 ]);
			var plane = new Line(planeGeometry, new LineBasicMaterial({ color: 0xffff80 }));

			this.add(arrow);
			this.add(plane);

		}

		if (camera instanceof PerspectiveCamera) {

			this.camera = camera;

		} else {

			this.camera = new PerspectiveCamera();
			console.log(this.name + ': camera is not a Perspective Camera!');

		}

		this.textureMatrix = new Matrix4();

		this.mirrorCamera = this.camera.clone();
		this.mirrorCamera.matrixAutoUpdate = true;

		var parameters = { minFilter: LinearFilter, magFilter: LinearFilter, format: RGBFormat, stencilBuffer: false };

		this.renderTarget = new WebGLRenderTarget(width, height, parameters);
		this.renderTarget2 = new WebGLRenderTarget(width, height, parameters);

		var mirrorUniforms = UniformsUtils.clone(MirrorShader.uniforms());

		this.material = new ShaderMaterial({

			fragmentShader: MirrorShader.fragment(),
			vertexShader: MirrorShader.vertex(),
			uniforms: mirrorUniforms

		});

		this.material.uniforms.mirrorSampler.value = this.renderTarget.texture;
		this.material.uniforms.mirrorColor.value = mirrorColor;
		this.material.uniforms.textureMatrix.value = this.textureMatrix;

		if (! Math.isPowerOfTwo(width) || ! Math.isPowerOfTwo(height)) {

			this.renderTarget.texture.generateMipmaps = false;
			this.renderTarget2.texture.generateMipmaps = false;

		}

		this.updateTextureMatrix();
		this.render();
	}

	renderWithMirror(otherMirror) {

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

	}

	renderWithMirror(otherMirror) {

		// update the mirror matrix to mirror the current view
		this.updateTextureMatrix();
		this.matrixNeedsUpdate = false;

		// set the camera of the other mirror so the mirrored view is the reference view
		const tempCamera = otherMirror.camera;
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

	}

	updateTextureMatrix() {

		this.updateMatrixWorld();
		this.camera.updateMatrixWorld();

		this.mirrorWorldPosition.setFromMatrixPosition(this.matrixWorld);
		this.cameraWorldPosition.setFromMatrixPosition(this.camera.matrixWorld);

		this.rotationMatrix.extractRotation(this.matrixWorld);

		this.normal.set(0, 0, 1);
		this.normal.applyMatrix4(this.rotationMatrix);

		var view = this.mirrorWorldPosition.clone().sub(this.cameraWorldPosition);
		view.reflect(this.normal).negate();
		view.add(this.mirrorWorldPosition);

		this.rotationMatrix.extractRotation(this.camera.matrixWorld);

		this.lookAtPosition.set(0, 0, - 1);
		this.lookAtPosition.applyMatrix4(this.rotationMatrix);
		this.lookAtPosition.add(this.cameraWorldPosition);

		var target = this.mirrorWorldPosition.clone().sub(this.lookAtPosition);
		target.reflect(this.normal).negate();
		target.add(this.mirrorWorldPosition);

		this.up.set(0, - 1, 0);
		this.up.applyMatrix4(this.rotationMatrix);
		this.up.reflect(this.normal).negate();

		this.mirrorCamera.position.copy(view);
		this.mirrorCamera.up = this.up;
		this.mirrorCamera.lookAt(target);

		this.mirrorCamera.updateProjectionMatrix();
		this.mirrorCamera.updateMatrixWorld();
		this.mirrorCamera.matrixWorldInverse.getInverse(this.mirrorCamera.matrixWorld);

		// Update the texture matrix
		this.textureMatrix.set(0.5, 0.0, 0.0, 0.5,
								0.0, 0.5, 0.0, 0.5,
								0.0, 0.0, 0.5, 0.5,
								0.0, 0.0, 0.0, 1.0);
		this.textureMatrix.multiply(this.mirrorCamera.projectionMatrix);
		this.textureMatrix.multiply(this.mirrorCamera.matrixWorldInverse);

		// Now update projection matrix with new clip plane, implementing code from: http://www.terathon.com/code/oblique.html
		// Paper explaining this technique: http://www.terathon.com/lengyel/Lengyel-Oblique.pdf
		this.mirrorPlane.setFromNormalAndCoplanarPoint(this.normal, this.mirrorWorldPosition);
		this.mirrorPlane.applyMatrix4(this.mirrorCamera.matrixWorldInverse);

		this.clipPlane.set(this.mirrorPlane.normal.x, this.mirrorPlane.normal.y, this.mirrorPlane.normal.z, this.mirrorPlane.constant);

		var q = new Vector4();
		var projectionMatrix = this.mirrorCamera.projectionMatrix;

		q.x = (Math.sign(this.clipPlane.x) + projectionMatrix.elements[ 8 ]) / projectionMatrix.elements[ 0 ];
		q.y = (Math.sign(this.clipPlane.y) + projectionMatrix.elements[ 9 ]) / projectionMatrix.elements[ 5 ];
		q.z = - 1.0;
		q.w = (1.0 + projectionMatrix.elements[ 10 ]) / projectionMatrix.elements[ 14 ];

		// Calculate the scaled plane vector
		var c = new Vector4();
		c = this.clipPlane.multiplyScalar(2.0 / this.clipPlane.dot(q));

		// Replacing the third row of the projection matrix
		projectionMatrix.elements[ 2 ] = c.x;
		projectionMatrix.elements[ 6 ] = c.y;
		projectionMatrix.elements[ 10 ] = c.z + 1.0 - this.clipBias;
		projectionMatrix.elements[ 14 ] = c.w;

	}

	render() {

		if (this.matrixNeedsUpdate) this.updateTextureMatrix();

		this.matrixNeedsUpdate = true;

		// Render the mirrored view of the current scene into the target texture
		var scene = this;

		while (scene.parent !== null) {

			scene = scene.parent;

		}

		if (scene !== undefined && scene instanceof Scene) {

			// We can't render ourself to ourself
			var visible = this.material.visible;
			this.material.visible = false;

			this.renderer.render(scene, this.mirrorCamera, this.renderTarget, true);

			this.material.visible = visible;

		}

	}
}
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
                textureWidth: options.textureWidth || 512,
                textureHeight: options.textureHeight || 512,
                waterNormals: waterNormals,
                alpha: 1.0, //options.alpha || 1.0,
                sunDirection: new THREE.Vector3(-0.5773502691896258,0.5773502691896258, -0.5773502691896258),//options.light ? options.light.position.clone().normalize() : new THREE.Vector3( - 1, 1, - 1).normalize(),
                sunColor: 0xffffff,//options.sunColor || 0xffffff,
                waterColor: 0x001e0f, //options.waterColor || 0x001e0f,
                distortionScale: options.distortionScale || 50.0
            });

            var width = options.width || 512,
                height = options.height || 512;

            var mirrorMesh = new THREE.Mesh(
                new THREE.PlaneBufferGeometry(width * 500, height * 500 ),
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
export class OceanMain {

    static uniforms() {
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
    }

	static varying() {
       return {
            "vPos": { type: "v3" },
            "vUV": { type: "v2" }
        }
    }

	static vertex() {
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
    }

	static fragment() {
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
}

export class OceanNormals {

	static uniforms() {
        return {
            "u_displacementMap": { type: "t", value: null },
            "u_resolution": { type: "f", value: null },
            "u_size": { type: "f", value: null },
        }
    }

	static varying() {
        return {
            "vUV": { type: "v2" }
        }
    }

	static fragment() {
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
}

export class OceanSpectrum {

	static uniforms() {
        return {
            "u_size": { type: "f", value: null },
            "u_resolution": { type: "f", value: null },
            "u_choppiness": { type: "f", value: null },
            "u_phases": { type: "t", value: null },
            "u_initialSpectrum": { type: "t", value: null },
        }
    },

	static varying() {
        return {
            "vUV": { type: "v2" }
        }
    }

	static fragment()  {
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
}

export class OceanPhase {

    static uniforms() {
        return {
            "u_phases": { type: "t", value: null },
            "u_deltaTime": { type: "f", value: null },
            "u_resolution": { type: "f", value: null },
            "u_size": { type: "f", value: null },
        }
    }

	static varying() {
        return {
            "vUV": { type: "v2" }
        }
    }

	static fragment() {
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
}

export class OceanInitialSpectrum {

    static uniforms() {
        return {
            "u_wind": { type: "v2", value: new THREE.Vector2( 10.0, 10.0 ) },
            "u_resolution": { type: "f", value: 512.0 },
            "u_size": { type: "f", value: 250.0 },
        }
    }

	static fragment() {
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
}

export class OceanSubTransform {

    static uniforms() {
        return {
            "u_input": { type: "t", value: null },
            "u_transformSize": { type: "f", value: 512.0 },
            "u_subtransformSize": { type: "f", value: 250.0 }
        }
    }

	static varying() {
        return {
            "vUV": { type: "v2" }
        }
    }

	static fragment() {
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
}

export class OceanSimVertex {

    static varying() {
        return {
            "vUV": { type: "v2" }
        }
    }

	static vertex() {
        return [
            'varying vec2 vUV;',

            'void main (void) {',
                'vUV = position.xy * 0.5 + 0.5;',
                'gl_Position = vec4(position, 1.0 );',
            '}'
        ].join( '\n' )
    }
}
;
import {
    OceanSimVertex,
    OceanSubTransform,
    OceanInitialSpectrum,
    OceanNormals,
    OceanPhase,
    OceanMain,
    OceanSpectrum
} from './OceanShaders';

class OceanShader {

    constructor(renderer, camera, scene, options) {

        // flag used to trigger parameter changes
        this.changed = true;
        this.initial = true;

        // Assign required parameters as object properties
        this.oceanCamera = new THREE.OrthographicCamera(); //camera.clone();
        this.oceanCamera.position.z = 1;
        this.renderer = renderer;
        this.renderer.clearColor(0xffffff);

        this.scene = new THREE.Scene();

        // Assign optional parameters as variables and object properties
        function optionalParameter(value, defaultValue) {

            return value !== undefined ? value : defaultValue;

        }
        options = options || {};
        this.clearColor = optionalParameter(options.CLEAR_COLOR, [ 1.0, 1.0, 1.0, 0.0 ]);
        this.geometryOrigin = optionalParameter(options.GEOMETRY_ORIGIN, [ - 1000.0, - 1000.0 ]);
        this.sunDirectionX = optionalParameter(options.SUN_DIRECTION[ 0 ], - 1.0);
        this.sunDirectionY = optionalParameter(options.SUN_DIRECTION[ 1 ], 1.0);
        this.sunDirectionZ = optionalParameter(options.SUN_DIRECTION[ 2 ], 1.0);
        this.oceanColor = optionalParameter(options.OCEAN_COLOR, new THREE.Vector3(0.004, 0.016, 0.047));
        this.skyColor = optionalParameter(options.SKY_COLOR, new THREE.Vector3(3.2, 9.6, 12.8));
        this.exposure = optionalParameter(options.EXPOSURE, 0.35);
        this.geometryResolution = optionalParameter(options.GEOMETRY_RESOLUTION, 32);
        this.geometrySize = optionalParameter(options.GEOMETRY_SIZE, 2000);
        this.resolution = optionalParameter(options.RESOLUTION, 64);
        this.floatSize = optionalParameter(options.SIZE_OF_FLOAT, 4);
        this.windX = optionalParameter(options.INITIAL_WIND[ 0 ], 10.0),
        this.windY = optionalParameter(options.INITIAL_WIND[ 1 ], 10.0),
        this.size = optionalParameter(options.INITIAL_SIZE, 250.0),
        this.choppiness = optionalParameter(options.INITIAL_CHOPPINESS, 1.5);

        //
        this.matrixNeedsUpdate = false;

        // Setup framebuffer pipeline
        const renderTargetType = optionalParameter(options.USE_HALF_FLOAT, false) ? THREE.HalfFloatType : THREE.FloatType;
        const LinearClampParams = {
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
        const NearestClampParams = {
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
        const NearestRepeatParams = {
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
        this.initialSpectrumFramebuffer = new THREE.WebGLRenderTarget(this.resolution, this.resolution, NearestRepeatParams);
        this.spectrumFramebuffer = new THREE.WebGLRenderTarget(this.resolution, this.resolution, NearestClampParams);
        this.pingPhaseFramebuffer = new THREE.WebGLRenderTarget(this.resolution, this.resolution, NearestClampParams);
        this.pongPhaseFramebuffer = new THREE.WebGLRenderTarget(this.resolution, this.resolution, NearestClampParams);
        this.pingTransformFramebuffer = new THREE.WebGLRenderTarget(this.resolution, this.resolution, NearestClampParams);
        this.pongTransformFramebuffer = new THREE.WebGLRenderTarget(this.resolution, this.resolution, NearestClampParams);
        this.displacementMapFramebuffer = new THREE.WebGLRenderTarget(this.resolution, this.resolution, LinearClampParams);
        this.normalMapFramebuffer = new THREE.WebGLRenderTarget(this.resolution, this.resolution, LinearClampParams);

        // Define shaders and constant uniforms
        ////////////////////////////////////////


        // 1 - Horizontal wave vertices used for FFT
        this.materialOceanHorizontal = new THREE.ShaderMaterial({
            uniforms: THREE.UniformsUtils.clone(OceanSubTransform.uniforms()),
            vertexShader: OceanSimVertex.vertex(),
            fragmentShader: "#define HORIZONTAL \n" + OceanSubTransform.fragment()
        });

        this.materialOceanHorizontal.uniforms.u_transformSize = { type: "f", value: this.resolution };
        this.materialOceanHorizontal.uniforms.u_subtransformSize = { type: "f", value: null };
        this.materialOceanHorizontal.uniforms.u_input = { type: "t", value: null };
        this.materialOceanHorizontal.depthTest = false;

        // 2 - Vertical wave vertices used for FFT
        this.materialOceanVertical = new THREE.ShaderMaterial({
            uniforms: THREE.UniformsUtils.clone(OceanSubTransform.uniforms()),
            vertexShader: OceanSimVertex.vertex(),
            fragmentShader: OceanSubTransform.fragment()
        });
        this.materialOceanVertical.uniforms.u_transformSize = { type: "f", value: this.resolution };
        this.materialOceanVertical.uniforms.u_subtransformSize = { type: "f", value: null };
        this.materialOceanVertical.uniforms.u_input = { type: "t", value: null };
        this.materialOceanVertical.depthTest = false;

        // 3 - Initial spectrum used to generate height map
        this.materialInitialSpectrum = new THREE.ShaderMaterial({
            uniforms: THREE.UniformsUtils.clone(OceanInitialSpectrum.uniforms());,
            vertexShader: OceanSimVertex.vertex(),
            fragmentShader: OceanInitialSpectrum.fragment()
        });
        this.materialInitialSpectrum.uniforms.u_wind = { type: "v2", value: new THREE.Vector2() };
        this.materialInitialSpectrum.uniforms.u_resolution = { type: "f", value: this.resolution };
        this.materialInitialSpectrum.depthTest = false;

        // 4 - Phases used to animate heightmap
        this.materialPhase = new THREE.ShaderMaterial({
            uniforms: THREE.UniformsUtils.clone(OceanPhase.uniforms());,
            vertexShader: OceanSimVertex.vertex(),
            fragmentShader: OceanPhase.fragment()
        });
        this.materialPhase.uniforms.u_resolution = { type: "f", value: this.resolution };
        this.materialPhase.depthTest = false;

        // 5 - Shader used to update spectrum
        this.materialSpectrum = new THREE.ShaderMaterial({
            uniforms: THREE.UniformsUtils.clone(OceanSpectrum.uniforms()),
            vertexShader: OceanSimVertex.vertex(),
            fragmentShader: OceanSpectrum.fragment()
        });
        this.materialSpectrum.uniforms.u_initialSpectrum = { type: "t", value: null };
        this.materialSpectrum.uniforms.u_resolution = { type: "f", value: this.resolution };
        this.materialSpectrum.depthTest = false;

        // 6 - Shader used to update spectrum normals
        this.materialNormal = new THREE.ShaderMaterial({
            uniforms: THREE.UniformsUtils.clone(OceanNormals.uniforms()),
            vertexShader: OceanSimVertex.vertex(),
            fragmentShader: OceanNormals.fragment()
        });
        this.materialNormal.uniforms.u_displacementMap = { type: "t", value: null };
        this.materialNormal.uniforms.u_resolution = { type: "f", value: this.resolution };
        this.materialNormal.depthTest = false;

        // 7 - Shader used to update normals
        this.materialOcean = new THREE.ShaderMaterial({
            uniforms: THREE.UniformsUtils.clone(OceanMain.uniforms()),
            vertexShader: OceanMain.vertex(),
            fragmentShader: OceanMain.fragment()
        });
        // this.materialOcean.wireframe = true;
        this.materialOcean.uniforms.u_geometrySize = { type: "f", value: this.resolution };
        this.materialOcean.uniforms.u_displacementMap = { type: "t", value: this.displacementMapFramebuffer.texture };
        this.materialOcean.uniforms.u_normalMap = { type: "t", value: this.normalMapFramebuffer.texture };
        this.materialOcean.uniforms.u_oceanColor = { type: "v3", value: this.oceanColor };
        this.materialOcean.uniforms.u_skyColor = { type: "v3", value: this.skyColor };
        this.materialOcean.uniforms.u_sunDirection = { type: "v3", value: new THREE.Vector3(this.sunDirectionX, this.sunDirectionY, this.sunDirectionZ) };
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
        this.screenQuad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2));
        this.scene.add(this.screenQuad);

        // Initialise spectrum data
        this.generateSeedPhaseTexture();

        // Generate the ocean mesh
        this.generateMesh();

    }

    generateMesh() {

        const geometry = new THREE.PlaneBufferGeometry(this.geometrySize, this.geometrySize, this.geometryResolution, this.geometryResolution);

        geometry.rotateX(- Math.PI / 2);

        this.oceanMesh = new THREE.Mesh(geometry, this.materialOcean);

    }

    update() {

        this.scene.overrideMaterial = null;

        if (this.changed)
            this.renderInitialSpectrum();

        this.renderWavePhase();
        this.renderSpectrum();
        this.renderSpectrumFFT();
        this.renderNormalMap();
        this.scene.overrideMaterial = null;

    }

    generateSeedPhaseTexture() {

        // Setup the seed texture
        this.pingPhase = true;
        const phaseArray = new Float32Array(this.resolution * this.resolution * 4);
        for (var i = 0; i < this.resolution; i ++) {

            for (var j = 0; j < this.resolution; j ++) {

                phaseArray[ i * this.resolution * 4 + j * 4 ] =  Math.random() * 2.0 * Math.PI;
                phaseArray[ i * this.resolution * 4 + j * 4 + 1 ] = 0.0;
                phaseArray[ i * this.resolution * 4 + j * 4 + 2 ] = 0.0;
                phaseArray[ i * this.resolution * 4 + j * 4 + 3 ] = 0.0;

            }

        }

        this.pingPhaseTexture = new THREE.DataTexture(phaseArray, this.resolution, this.resolution, THREE.RGBAFormat);
        this.pingPhaseTexture.wrapS = THREE.ClampToEdgeWrapping;
        this.pingPhaseTexture.wrapT = THREE.ClampToEdgeWrapping;
        this.pingPhaseTexture.type = THREE.FloatType;
        this.pingPhaseTexture.needsUpdate = true;

    }

    renderInitialSpectrum() {

        this.scene.overrideMaterial = this.materialInitialSpectrum;
        this.materialInitialSpectrum.uniforms.u_wind.value.set(this.windX, this.windY);
        this.materialInitialSpectrum.uniforms.u_size.value = this.size;
        this.renderer.render(this.scene, this.oceanCamera, this.initialSpectrumFramebuffer, true);

    }

    renderWavePhase() {

        this.scene.overrideMaterial = this.materialPhase;
        this.screenQuad.material = this.materialPhase;
        if (this.initial) {

            this.materialPhase.uniforms.u_phases.value = this.pingPhaseTexture;
            this.initial = false;

        } else {

            this.materialPhase.uniforms.u_phases.value = this.pingPhase ? this.pingPhaseFramebuffer.texture : this.pongPhaseFramebuffer.texture;

        }
        this.materialPhase.uniforms.u_deltaTime.value = this.deltaTime;
        this.materialPhase.uniforms.u_size.value = this.size;
        this.renderer.render(this.scene, this.oceanCamera, this.pingPhase ? this.pongPhaseFramebuffer : this.pingPhaseFramebuffer);
        this.pingPhase = ! this.pingPhase;

    }

    renderSpectrum() {

        this.scene.overrideMaterial = this.materialSpectrum;
        this.materialSpectrum.uniforms.u_initialSpectrum.value = this.initialSpectrumFramebuffer.texture;
        this.materialSpectrum.uniforms.u_phases.value = this.pingPhase ? this.pingPhaseFramebuffer.texture : this.pongPhaseFramebuffer.texture;
        this.materialSpectrum.uniforms.u_choppiness.value = this.choppiness;
        this.materialSpectrum.uniforms.u_size.value = this.size;
        this.renderer.render(this.scene, this.oceanCamera, this.spectrumFramebuffer);

    }

    renderSpectrumFFT() {

        // GPU FFT using Stockham formulation
        var iterations = Math.log(this.resolution) / Math.log(2); // log2

        this.scene.overrideMaterial = this.materialOceanHorizontal;

        for (var i = 0; i < iterations; i ++) {

            if (i === 0) {

                this.materialOceanHorizontal.uniforms.u_input.value = this.spectrumFramebuffer.texture;
                this.materialOceanHorizontal.uniforms.u_subtransformSize.value = Math.pow(2, (i % (iterations)) + 1);
                this.renderer.render(this.scene, this.oceanCamera, this.pingTransformFramebuffer);

            } else if (i % 2 === 1) {

                this.materialOceanHorizontal.uniforms.u_input.value = this.pingTransformFramebuffer.texture;
                this.materialOceanHorizontal.uniforms.u_subtransformSize.value = Math.pow(2, (i % (iterations)) + 1);
                this.renderer.render(this.scene, this.oceanCamera, this.pongTransformFramebuffer);

            } else {

                this.materialOceanHorizontal.uniforms.u_input.value = this.pongTransformFramebuffer.texture;
                this.materialOceanHorizontal.uniforms.u_subtransformSize.value = Math.pow(2, (i % (iterations)) + 1);
                this.renderer.render(this.scene, this.oceanCamera, this.pingTransformFramebuffer);

            }

        }
        this.scene.overrideMaterial = this.materialOceanVertical;
        for (var i = iterations; i < iterations * 2; i ++) {

            if (i === iterations * 2 - 1) {

                this.materialOceanVertical.uniforms.u_input.value = (iterations % 2 === 0) ? this.pingTransformFramebuffer.texture : this.pongTransformFramebuffer.texture;
                this.materialOceanVertical.uniforms.u_subtransformSize.value = Math.pow(2, (i % (iterations)) + 1);
                this.renderer.render(this.scene, this.oceanCamera, this.displacementMapFramebuffer);

            } else if (i % 2 === 1) {

                this.materialOceanVertical.uniforms.u_input.value = this.pingTransformFramebuffer.texture;
                this.materialOceanVertical.uniforms.u_subtransformSize.value = Math.pow(2, (i % (iterations)) + 1);
                this.renderer.render(this.scene, this.oceanCamera, this.pongTransformFramebuffer);

            } else {

                this.materialOceanVertical.uniforms.u_input.value = this.pongTransformFramebuffer.texture;
                this.materialOceanVertical.uniforms.u_subtransformSize.value = Math.pow(2, (i % (iterations)) + 1);
                this.renderer.render(this.scene, this.oceanCamera, this.pingTransformFramebuffer);

            }

        }

    }

    renderNormalMap() {
        this.scene.overrideMaterial = this.materialNormal;
        if (this.changed) this.materialNormal.uniforms.u_size.value = this.size;
        this.materialNormal.uniforms.u_displacementMap.value = this.displacementMapFramebuffer.texture;
        this.renderer.render(this.scene, this.oceanCamera, this.normalMapFramebuffer, true);

    }
}

export default class Ocean {

    constructor() {
        const gsize = options.geometrySize || 512,
            res = options.resolution || 1024,
            gres = res / 2,
            origx = -gsize / 2,
            origz = -gsize / 2;

        this.ocean = new OceanShader(renderer, camera, scene, {
            USE_HALF_FLOAT : true,
            INITIAL_SIZE : options.initial.size || 256.0,
            INITIAL_WIND : options.initial.wind || [10.0, 10.0],
            INITIAL_CHOPPINESS : options.initial.choppiness || 1.5,
            CLEAR_COLOR : options.clearColor || [1.0, 1.0, 1.0, 0.0],
            GEOMETRY_ORIGIN : [origx, origz],
            SUN_DIRECTION : options.sunDirection || [-1.0, 1.0, 1.0],
            OCEAN_COLOR: options.oceanColor || new THREE.Vector3(0.004, 0.016, 0.047),
            SKY_COLOR: options.skyColor || new THREE.Vector3(3.2, 9.6, 12.8),
            EXPOSURE : options.exposure || 0.35,
            GEOMETRY_RESOLUTION: gres,
            GEOMETRY_SIZE : gsize,
            RESOLUTION : res
        });

        this.ocean.lastTime = (new Date()).getTime();
        this.ocean.materialOcean.uniforms.u_projectionMatrix = { type: "m4", value: camera.projectionMatrix };
        this.ocean.materialOcean.uniforms.u_viewMatrix = { type: "m4", value: camera.matrixWorldInverse };
        this.ocean.materialOcean.uniforms.u_cameraPosition = { type: "v3", value: camera.position };
    }

    render() {
        const currentTime = new Date().getTime();
        this.ocean.deltaTime = (currentTime - this.ocean.lastTime) / 1000 || 0.0;
        this.ocean.lastTime = currentTime;
        this.ocean.update(this.ocean.deltaTime);
        this.ocean.overrideMaterial = this.ocean.materialOcean;
        if (this.ocean.changed) {
            this.ocean.materialOcean.uniforms.u_size.value = this.ocean.size;
            this.ocean.materialOcean.uniforms.u_sunDirection.value.set(this.ocean.sunDirectionX, this.ocean.sunDirectionY, this.ocean.sunDirectionZ);
            this.ocean.materialOcean.uniforms.u_exposure.value = this.ocean.exposure;
            this.ocean.changed = false;
        }
        this.ocean.materialOcean.uniforms.u_normalMap.value = this.ocean.normalMapFramebuffer.texture;
        this.ocean.materialOcean.uniforms.u_displacementMap.value = this.ocean.displacementMapFramebuffer.texture;
        this.ocean.materialOcean.uniforms.u_projectionMatrix.value = camera.projectionMatrix;
        this.ocean.materialOcean.uniforms.u_viewMatrix.value = camera.matrixWorldInverse;
        this.ocean.materialOcean.uniforms.u_cameraPosition.value = camera.position;
        this.ocean.materialOcean.depthTest = true;
    }
}
;
export default class App {

    constructor() {

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

    }

    //onCreate method, ovveride to start creating stuff
    onCreate() {}

    //this methods helps you loading heavy stuff
    preload(callback) {
        callback();
    }

    //do stuff before onCreate method( prepare meshes, whatever )
    prepareScene() {}

    //this is what happens during game loading, the progress animation
    progressAnimation(callback) {
        $('#loader').animate({"opacity" : "0", "margin-top" : "250px"}, 1000 , function () {
    		$('#loader').remove();
    		$('body').animate({backgroundColor : "#fff"}, 200 , callback);
    	});
    }

    //needed if user wants to add a customRender method
    _render() {}

    //setupleap motion device
    setUpLeap() {}

    //leap motion socket connected
    onLeapSocketConnected() {}

    //leap motion device connected
    onLeapDeviceConnected() {}

    //leap motion device disconnected
    onLeapDeviceDisconnected() {}

    render() {

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
        if (this.camera.update) {
            this.camera.update(this.clock.getDelta());
        }

        this.renderer.autoClear = false;
        this.renderer.clear(this.clearColor);
        this._render();
        this.renderer.render(this.scene, this.camera.object);

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
        if (this.util.physics_enabled && Physijs._isLoaded) {
            this.scene.simulate();
        }
        if (this.util.tween_enabled) {
            TWEEN.update();
        }
        requestAnimFrame(this.render.bind(this));

    }

    add(mesh, element) {
		this.scene.add(mesh);
		M.universe.reality.put(mesh.uuid, element);
	}

	remove(mesh) {
		this.scene.remove(mesh);
		M.universe.reality.remove(mesh.uuid);
	}

    init() {

        this.three = THREE;
        var c_util = this.util.camera; //camera util
        var util = this.util;

        if (window.keypress) {
            this._keylistener =  new window.keypress.Listener();
        }

        //try{
            //configuring threejs and physijs
            if (config) {
                this.log("config loaded");
                if (this.util.physics_enabled) {
                    this.log("physics enabled.");
                    try {
                        Physijs.scripts.worker = 'workers/physijs_worker.js';
                        Physijs.scripts.ammo = 'ammo.js';
                        this.scene = new Physijs.Scene();
                        Physijs._isLoaded = true;
                    } catch (ex) {
                        this.log("something bad trying to create physijs scene", "e");
                        this.log(ex);
                        Physijs._isLoaded = false;
                        this.scene = new this.three.Scene();
                    }
                } else {
                    this.log("physics not enabled.");
                    Physijs._isLoaded = false;
                    this.scene = new this.three.Scene();
                }
            } else {
                this.log("config not loaded, switching to three.js");
                Physijs._isLoaded = false;
                this.scene = new this.three.Scene();
            }
            //setting up camera
            var cameraOptions = {
                fov : c_util.fov,
                ratio : util.ratio,
                near : c_util.near,
                far : c_util.far
            };
            if (config) {
                if (this.util.camera) {
                    cameraOptions.fov = this.util.camera.fov ? this.util.camera.fov : cameraOptions.fov;
                    cameraOptions.ratio = this.util.camera.ratio ? this.util.camera.ratio : cameraOptions.ratio;
                    cameraOptions.near = this.util.camera.near ? this.util.camera.near : cameraOptions.near;
                    cameraOptions.far = this.util.camera.far ? this.util.camera.far : cameraOptions.far;
                }
            }
            this.camera = new Camera(cameraOptions);
            var alphaRenderer = false;
            if (this.util.alpha) {
                alphaRenderer = true;
            }
            this.renderer = new this.three.WebGLRenderer({alpha:alphaRenderer, antialias: true});
            if (this.util.cast_shadow) {
                this.renderer.shadowMap.enabled = true;
                this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
                this.renderer.sortObjects = false;
            }
            //this.renderer.setClearColor(new THREE.Color('#000000'));
            this.renderer.setPixelRatio( window.devicePixelRatio );
            this.renderer.setSize( util.w , util.h );
            //document.body.appendChild( this.renderer.domElement );
            document.getElementById("gameContainer").appendChild(this.renderer.domElement);
            //handling user input
            //M.user.handleUserInput();
            //updating game
            M.game.update();
            //updating universe
            M.universe.update();

            //launch render method
            M.control.init();
            this.render();

            //we are pretty sure we can add stuff to our universe
            if (this.onCreate instanceof Function) {
                this.onCreate();
            } else {
                console.log("Something wrong in your onCreate method");
            }

        //} catch( error ) {
        //	console.error(error);
        //	console.trace();
        //}

    }

    load() {

        console.log("inside load");
        if (!(typeof this.progressAnimation == "function")) {
            this.progressAnimation = function(callback) {
                console.log("def progressAnimation");
                callback();
            }
        }
        this.progressAnimation(this.init);

    }

    sendMessage(message) {
		parent.postMessage(message, location.origin);
    }

    onMessage() {
        const origin = event.origin || event.originalEvent.origin;
        if (origin !== location.origin)
            return;

    }

    onkey(key, callback) {
        if (this._keylistener) {
            this._keylistener.simple_combo(key, callback);
        }
    }

    //utilities methods
    log() {

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

    }

    onDocumentMouseWheel(event) {

    	event.preventDefault();
    	this.zoom = event.wheelDelta * 0.05;
    	this.camera.object.position.z += this.zoom;

    }

    onDocumentMouseMove(event) {

    	this.mouseX = event.clientX - this.windowHalfX;
    	this.mouseY = event.clientY - this.windowHalfY;

    }

    onDocumentTouchStart(event) {

    	if (event.touches.length === 1) {

    		event.preventDefault();

    		this.mouseX = event.touches[ 0 ].pageX - this.windowHalfX;
    		this.mouseY = event.touches[ 0 ].pageY - this.windowHalfY;

    	}
    }

    onDocumentTouchMove(event) {

    	if (event.touches.length === 1) {

    		event.preventDefault();

    		this.mouseX = event.touches[ 0 ].pageX - this.windowHalfX;
    		this.mouseY = event.touches[ 0 ].pageY - this.windowHalfY;

    	}

    }

    //keyup event
    keyup(event) {}

    //keydown event
    keydown(event) {}

    //handling failed tests
    onFailedTest(message, test) {}

    //handling succesful tests
    onSuccededTest(message) {}

}

// retrieving M object
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    console.log(window);
    module.exports = M;

    delete window['M'];
} else {
    // we're inside our favourite browser
    window.app = {};
    M.started = false;
    M.start = function(_app) {
        if (M.started) {
            console.log('app already started');
            return;
        }
        M.started = true;
        console.log("inside window onload");
        //creating app object
        if (_app)
            app = _app;
        } else {
            app = new App();
        }

        //before starting loading stuff, be sure to pass all tests
        M.util.start();

        M.util.check.start(app.onSuccededTest, app.onFailedTest)
            .then(() => {
                app.preload(function() {
                    M.assetsManager.load(function() {
                        app.prepareScene();
                        app.load();
                    });
                });
            })
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

    //window.addEventListener('load', M.start);
    window.addEventListener('resize', M.resize);


    M.version = '0.0.46';
    M.author = {
        name: 'Marco Stagni',
        email: 'mrc.stagni@gmail.com',
        website: 'http://mage.studio'
    };
}
