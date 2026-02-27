/**
 * @author jbouny / https://github.com/jbouny
 *
 * Work based on :
 * @author Slayvin / http://slayvin.net : Flat mirror for three.js
 * @author Stemkoski / http://www.adelphi.edu/~stemkoski : An implementation of water shader based on the flat mirror
 * @author Jonas Wagner / http://29a.ch/ && http://29a.ch/slides/2012/webglwater/ : Water shader explanations in WebGL
 */

import {
    RepeatWrapping,
    PlaneBufferGeometry,
    Color,
    FrontSide,
    LinearEncoding,
    LinearFilter,
    MathUtils,
    Matrix4,
    Mesh,
    NoToneMapping,
    PerspectiveCamera,
    Plane,
    RGBFormat,
    ShaderMaterial,
    UniformsLib,
    UniformsUtils,
    Vector3,
    Vector4,
    WebGLRenderTarget,
    DataTexture,
    RGBAFormat,
    UnsignedByteType
} from 'three';

import Images from '../../images/Images';
import Scene from '../../core/Scene';
import { ENTITY_TYPES } from '../../entities/constants';
import Element from '../../entities/Element';
import { clamp } from '../../lib/math';

var WaterMesh = function ( geometry, options ) {

	Mesh.call( this, geometry );

	var scope = this;

	options = options || {};

	var textureWidth = options.textureWidth !== undefined ? options.textureWidth : 512;
	var textureHeight = options.textureHeight !== undefined ? options.textureHeight : 512;

	var clipBias = options.clipBias !== undefined ? options.clipBias : 0.0;
	var alpha = options.alpha !== undefined ? options.alpha : 1.0;
	var time = options.time !== undefined ? options.time : 0.0;
	var normalSampler = options.waterNormals !== undefined ? options.waterNormals : null;
	var sunDirection = options.sunDirection !== undefined ? options.sunDirection : new Vector3( 0.70707, 0.70707, 0.0 );
	var sunColor = new Color( options.sunColor !== undefined ? options.sunColor : 0xffffff );
	var waterColor = new Color( options.waterColor !== undefined ? options.waterColor : 0x7F7F7F );
	var eye = options.eye !== undefined ? options.eye : new Vector3( 0, 0, 0 );
	var distortionScale = options.distortionScale !== undefined ? options.distortionScale : 20.0;
	var side = options.side !== undefined ? options.side : FrontSide;
	var fog = options.fog !== undefined ? options.fog : false;

	//

	var mirrorPlane = new Plane();
	var normal = new Vector3();
	var mirrorWorldPosition = new Vector3();
	var cameraWorldPosition = new Vector3();
	var rotationMatrix = new Matrix4();
	var lookAtPosition = new Vector3( 0, 0, - 1 );
	var clipPlane = new Vector4();

	var view = new Vector3();
	var target = new Vector3();
	var q = new Vector4();

	var textureMatrix = new Matrix4();

	var mirrorCamera = new PerspectiveCamera();

	var parameters = {
		minFilter: LinearFilter,
		magFilter: LinearFilter,
		format: RGBFormat
	};

	var renderTarget = new WebGLRenderTarget( textureWidth, textureHeight, parameters );

	if ( ! MathUtils.isPowerOfTwo( textureWidth ) || ! MathUtils.isPowerOfTwo( textureHeight ) ) {

		renderTarget.texture.generateMipmaps = false;

	}

	var mirrorShader = {

		uniforms: UniformsUtils.merge( [
			UniformsLib[ 'fog' ],
			UniformsLib[ 'lights' ],
			{
				'normalSampler': { value: null },
				'mirrorSampler': { value: null },
				'alpha': { value: 1.0 },
				'time': { value: 0.0 },
				'size': { value: 1.0 },
				'distortionScale': { value: 20.0 },
				'textureMatrix': { value: new Matrix4() },
				'sunColor': { value: new Color( 0x7F7F7F ) },
				'sunDirection': { value: new Vector3( 0.70707, 0.70707, 0 ) },
				'eye': { value: new Vector3() },
				'waterColor': { value: new Color( 0x555555 ) }
			}
		] ),

		vertexShader: [
			'uniform mat4 textureMatrix;',
			'uniform float time;',

			'varying vec4 mirrorCoord;',
			'varying vec4 worldPosition;',

		 	'#include <common>',
		 	'#include <fog_pars_vertex>',
			'#include <shadowmap_pars_vertex>',
			'#include <logdepthbuf_pars_vertex>',

			'void main() {',
			'	mirrorCoord = modelMatrix * vec4( position, 1.0 );',
			'	worldPosition = mirrorCoord.xyzw;',
			'	mirrorCoord = textureMatrix * mirrorCoord;',
			'	vec4 mvPosition =  modelViewMatrix * vec4( position, 1.0 );',
			'	gl_Position = projectionMatrix * mvPosition;',

			'#include <beginnormal_vertex>',
			'#include <defaultnormal_vertex>',
			'#include <logdepthbuf_vertex>',
			'#include <fog_vertex>',
			'#include <shadowmap_vertex>',
			'}'
		].join( '\n' ),

		fragmentShader: [
			'uniform sampler2D mirrorSampler;',
			'uniform float alpha;',
			'uniform float time;',
			'uniform float size;',
			'uniform float distortionScale;',
			'uniform sampler2D normalSampler;',
			'uniform vec3 sunColor;',
			'uniform vec3 sunDirection;',
			'uniform vec3 eye;',
			'uniform vec3 waterColor;',

			'varying vec4 mirrorCoord;',
			'varying vec4 worldPosition;',

			'vec4 getNoise( vec2 uv ) {',
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

			'void sunLight( const vec3 surfaceNormal, const vec3 eyeDirection, float shiny, float spec, float diffuse, inout vec3 diffuseColor, inout vec3 specularColor ) {',
			'	vec3 reflection = normalize( reflect( -sunDirection, surfaceNormal ) );',
			'	float direction = max( 0.0, dot( eyeDirection, reflection ) );',
			'	specularColor += pow( direction, shiny ) * sunColor * spec;',
			'	diffuseColor += max( dot( sunDirection, surfaceNormal ), 0.0 ) * sunColor * diffuse;',
			'}',

			'#include <common>',
			'#include <packing>',
			'#include <bsdfs>',
			'#include <fog_pars_fragment>',
			'#include <logdepthbuf_pars_fragment>',
			'#include <lights_pars_begin>',
			'#include <shadowmap_pars_fragment>',
			'#include <shadowmask_pars_fragment>',

			'void main() {',

			'#include <logdepthbuf_fragment>',
			'	vec4 noise = getNoise( worldPosition.xz * size );',
			'	vec3 surfaceNormal = normalize( noise.xzy * vec3( 1.5, 1.0, 1.5 ) );',

			'	vec3 diffuseLight = vec3(0.0);',
			'	vec3 specularLight = vec3(0.0);',

			'	vec3 worldToEye = eye-worldPosition.xyz;',
			'	vec3 eyeDirection = normalize( worldToEye );',
			'	sunLight( surfaceNormal, eyeDirection, 100.0, 2.0, 0.5, diffuseLight, specularLight );',

			'	float distance = length(worldToEye);',

			'	vec2 distortion = surfaceNormal.xz * ( 0.001 + 1.0 / distance ) * distortionScale;',
			'	vec3 reflectionSample = vec3( texture2D( mirrorSampler, mirrorCoord.xy / mirrorCoord.w + distortion ) );',

			'	float theta = max( dot( eyeDirection, surfaceNormal ), 0.0 );',
			'	float rf0 = 0.3;',
			'	float reflectance = rf0 + ( 1.0 - rf0 ) * pow( ( 1.0 - theta ), 5.0 );',
			'	vec3 scatter = max( 0.0, dot( surfaceNormal, eyeDirection ) ) * waterColor;',
			'	vec3 albedo = mix( ( sunColor * diffuseLight * 0.3 + scatter ) * getShadowMask(), ( vec3( 0.1 ) + reflectionSample * 0.9 + reflectionSample * specularLight ), reflectance);',
			'	vec3 outgoingLight = albedo;',
			'	gl_FragColor = vec4( outgoingLight, alpha );',

			'#include <tonemapping_fragment>',
			'#include <fog_fragment>',
			'}'
		].join( '\n' )

	};

	var material = new ShaderMaterial( {
		fragmentShader: mirrorShader.fragmentShader,
		vertexShader: mirrorShader.vertexShader,
		uniforms: UniformsUtils.clone( mirrorShader.uniforms ),
		lights: true,
		side: side,
		fog: fog,
		depthWrite: false // Water should not write to depth buffer so gizmos render on top
	} );

	material.uniforms[ 'mirrorSampler' ].value = renderTarget.texture;
	material.uniforms[ 'textureMatrix' ].value = textureMatrix;
	material.uniforms[ 'alpha' ].value = alpha;
	material.uniforms[ 'time' ].value = time;
	material.uniforms[ 'normalSampler' ].value = normalSampler;
	material.uniforms[ 'sunColor' ].value = sunColor;
	material.uniforms[ 'waterColor' ].value = waterColor;
	material.uniforms[ 'sunDirection' ].value = sunDirection;
	material.uniforms[ 'distortionScale' ].value = distortionScale;

	material.uniforms[ 'eye' ].value = eye;

	scope.material = material;

	scope.onBeforeRender = function ( renderer, scene, camera ) {

		mirrorWorldPosition.setFromMatrixPosition( scope.matrixWorld );
		cameraWorldPosition.setFromMatrixPosition( camera.matrixWorld );

		rotationMatrix.extractRotation( scope.matrixWorld );

		normal.set( 0, 0, 1 );
		normal.applyMatrix4( rotationMatrix );

		view.subVectors( mirrorWorldPosition, cameraWorldPosition );

		// Avoid rendering when mirror is facing away

		if ( view.dot( normal ) > 0 ) return;

		view.reflect( normal ).negate();
		view.add( mirrorWorldPosition );

		rotationMatrix.extractRotation( camera.matrixWorld );

		lookAtPosition.set( 0, 0, - 1 );
		lookAtPosition.applyMatrix4( rotationMatrix );
		lookAtPosition.add( cameraWorldPosition );

		target.subVectors( mirrorWorldPosition, lookAtPosition );
		target.reflect( normal ).negate();
		target.add( mirrorWorldPosition );

		mirrorCamera.position.copy( view );
		mirrorCamera.up.set( 0, 1, 0 );
		mirrorCamera.up.applyMatrix4( rotationMatrix );
		mirrorCamera.up.reflect( normal );
		mirrorCamera.lookAt( target );

		mirrorCamera.far = camera.far; // Used in WebGLBackground

		mirrorCamera.updateMatrixWorld();
		mirrorCamera.projectionMatrix.copy( camera.projectionMatrix );

		// Update the texture matrix
		textureMatrix.set(
			0.5, 0.0, 0.0, 0.5,
			0.0, 0.5, 0.0, 0.5,
			0.0, 0.0, 0.5, 0.5,
			0.0, 0.0, 0.0, 1.0
		);
		textureMatrix.multiply( mirrorCamera.projectionMatrix );
		textureMatrix.multiply( mirrorCamera.matrixWorldInverse );

		// Now update projection matrix with new clip plane, implementing code from: http://www.terathon.com/code/oblique.html
		// Paper explaining this technique: http://www.terathon.com/lengyel/Lengyel-Oblique.pdf
		mirrorPlane.setFromNormalAndCoplanarPoint( normal, mirrorWorldPosition );
		mirrorPlane.applyMatrix4( mirrorCamera.matrixWorldInverse );

		clipPlane.set( mirrorPlane.normal.x, mirrorPlane.normal.y, mirrorPlane.normal.z, mirrorPlane.constant );

		var projectionMatrix = mirrorCamera.projectionMatrix;

		q.x = ( Math.sign( clipPlane.x ) + projectionMatrix.elements[ 8 ] ) / projectionMatrix.elements[ 0 ];
		q.y = ( Math.sign( clipPlane.y ) + projectionMatrix.elements[ 9 ] ) / projectionMatrix.elements[ 5 ];
		q.z = - 1.0;
		q.w = ( 1.0 + projectionMatrix.elements[ 10 ] ) / projectionMatrix.elements[ 14 ];

		// Calculate the scaled plane vector
		clipPlane.multiplyScalar( 2.0 / clipPlane.dot( q ) );

		// Replacing the third row of the projection matrix
		projectionMatrix.elements[ 2 ] = clipPlane.x;
		projectionMatrix.elements[ 6 ] = clipPlane.y;
		projectionMatrix.elements[ 10 ] = clipPlane.z + 1.0 - clipBias;
		projectionMatrix.elements[ 14 ] = clipPlane.w;

		eye.setFromMatrixPosition( camera.matrixWorld );

		// Render

		if ( renderer.outputEncoding !== LinearEncoding ) {

			console.warn( 'THREE.WaterMesh: WebGLRenderer must use LinearEncoding as outputEncoding.' );
			scope.onBeforeRender = function () {};

			return;

		}

		if ( renderer.toneMapping !== NoToneMapping ) {

			console.warn( 'THREE.WaterMesh: WebGLRenderer must use NoToneMapping as toneMapping.' );
			scope.onBeforeRender = function () {};

			return;

		}

		var currentRenderTarget = renderer.getRenderTarget();

		var currentXrEnabled = renderer.xr.enabled;
		var currentShadowAutoUpdate = renderer.shadowMap.autoUpdate;

		scope.visible = false;

		renderer.xr.enabled = false; // Avoid camera modification and recursion
		renderer.shadowMap.autoUpdate = false; // Avoid re-computing shadows

		renderer.setRenderTarget( renderTarget );

		renderer.state.buffers.depth.setMask( true ); // make sure the depth buffer is writable so it can be properly cleared, see #18897

		if ( renderer.autoClear === false ) renderer.clear();
		renderer.render( scene, mirrorCamera );

		scope.visible = true;

		renderer.xr.enabled = currentXrEnabled;
		renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;

		renderer.setRenderTarget( currentRenderTarget );

		// Restore viewport

		var viewport = camera.viewport;

		if ( viewport !== undefined ) {

			renderer.state.viewport( viewport );

		}

	};

};

WaterMesh.prototype = Object.create( Mesh.prototype );
WaterMesh.prototype.constructor = WaterMesh;

const DEFAULT_WATER_HEIGHT = 512;
const DEFAULT_WATER_WIDTH = 512;
const DEFAULT_WATER_ALPHA = 1.0;
const DEFAULT_WATER_DISTORTION_SCALE = 3.7;

// Create a simple procedural normal map for water when no texture is available
const createDefaultWaterNormalTexture = () => {
    const size = 256;
    const data = new Uint8Array(size * size * 4);

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const idx = (i * size + j) * 4;
            // Create a subtle wave pattern using sine waves
            const wave1 = Math.sin(i * 0.1) * 0.5 + 0.5;
            const wave2 = Math.sin(j * 0.1) * 0.5 + 0.5;
            const wave3 = Math.sin((i + j) * 0.05) * 0.5 + 0.5;

            // Normal map colors (x, y, z mapped to r, g, b)
            // Flat normal pointing up is (0.5, 0.5, 1.0) in 0-1 range
            data[idx] = 128 + (wave1 - 0.5) * 20;     // R (X normal)
            data[idx + 1] = 128 + (wave2 - 0.5) * 20; // G (Y normal)
            data[idx + 2] = 255 * (0.9 + wave3 * 0.1); // B (Z normal - mostly up)
            data[idx + 3] = 255; // A
        }
    }

    const texture = new DataTexture(data, size, size, RGBAFormat, UnsignedByteType);
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.needsUpdate = true;
    return texture;
};

export default class Water extends Element {

    constructor(options = {}) {
        super(options);
        const {
            texture,
            textureNormalName,
            width = DEFAULT_WATER_WIDTH,
            height = DEFAULT_WATER_HEIGHT,
            textureWidth = DEFAULT_WATER_WIDTH,
            textureHeight = DEFAULT_WATER_HEIGHT,
            alpha = DEFAULT_WATER_ALPHA,
            distortionScale = DEFAULT_WATER_DISTORTION_SCALE
        } = options;

        // Get water normal texture, falling back to a procedural one if not available
        let waterNormals = texture || Images.get(textureNormalName || 'waterNormal');
        if (!waterNormals || waterNormals === false) {
            waterNormals = createDefaultWaterNormalTexture();
        } else {
            waterNormals.wrapS = waterNormals.wrapT = RepeatWrapping;
        }

        const body = new WaterMesh(
            new PlaneBufferGeometry(width * 500, height * 500 ),
            {
                textureWidth,
                textureHeight,
                waterNormals,
                alpha,
                sunDirection: new Vector3(-0.5773502691896258, 0.5773502691896258, -0.5773502691896258),
                sunColor: 0xffffff,
                waterColor: 0x001e0f,
                distortionScale,
                fog: Scene.getScene().fog !== undefined
            }
        );

        this.setBody({ body });
        this.setEntityType(ENTITY_TYPES.SCENERY.TYPE);
        this.setEntitySubtype(ENTITY_TYPES.SCENERY.SUBTYPES.WATER);

        // Store original dimensions for scaling calculations
        this.setData("originalWidth", width);
        this.setData("originalHeight", height);
        this.setData("width", width);
        this.setData("height", height);
        this.setData("alpha", alpha);
        this.setData("distortionScale", distortionScale);
        this.setData("waterColor", 0x001e0f);
        this.setData("sunColor", 0xffffff);
        this.setData("sunDirection", { x: -0.577, y: 0.577, z: -0.577 });

        this.setRotation({ x: - Math.PI / 2 });
    }

    setSize(size) {
        const clampedSize = clamp(size, 0.1, 100);
        this.setData("size", clampedSize);
        this.getBody().material.uniforms.size.value = clampedSize;
    }

    setAlpha(alpha) {
        const clampedAlpha = clamp(alpha, 0, 1);
        this.setData("alpha", clampedAlpha);
        this.getBody().material.uniforms.alpha.value = clampedAlpha;
    }

    setDistortionScale(scale) {
        const clampedScale = clamp(scale, 0, 100);
        this.setData("distortionScale", clampedScale);
        this.getBody().material.uniforms.distortionScale.value = clampedScale;
    }

    setWaterColor(color) {
        this.setData("waterColor", color);
        const colorValue = typeof color === 'object' && color.hex ? color.hex : color;
        this.getBody().material.uniforms.waterColor.value.set(colorValue);
    }

    setSunColor(color) {
        this.setData("sunColor", color);
        const colorValue = typeof color === 'object' && color.hex ? color.hex : color;
        this.getBody().material.uniforms.sunColor.value.set(colorValue);
    }

    setSunDirection(x, y, z) {
        this.setData("sunDirection", { x, y, z });
        this.getBody().material.uniforms.sunDirection.value.set(x, y, z).normalize();
    }

    setWidth(width) {
        const clampedWidth = clamp(width, 1, 10000);
        this.setData("width", clampedWidth);
        this._recreateGeometry();
    }

    setHeight(height) {
        const clampedHeight = clamp(height, 1, 10000);
        this.setData("height", clampedHeight);
        this._recreateGeometry();
    }

    _recreateGeometry() {
        const width = this.getData("width") || 1000;
        const height = this.getData("height") || 1000;

        // Dispose old geometry
        if (this.getBody().geometry) {
            this.getBody().geometry.dispose();
        }

        // Create new geometry with updated dimensions
        this.getBody().geometry = new PlaneBufferGeometry(width * 500, height * 500);
    }

    update = (dt) => {
        super.update(dt);
        this.getBody().material.uniforms.time.value += dt;
    }

    static create(data) {
        return new Water(data.options || data);
    }
}
