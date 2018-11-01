/**
 * @author jbouny / https://github.com/jbouny
 *
 * Work based on :
 * @author Slayvin / http://slayvin.net : Flat mirror for three.js
 * @author Stemkoski / http://www.adelphi.edu/~stemkoski : An implementation of water shader based on the flat mirror
 * @author Jonas Wagner / http://29a.ch/ && http://29a.ch/slides/2012/webglwater/ : Water shader explanations in WebGL
 */

import {
	UniformsUtils,
	UniformsLib,
	PerspectiveCamera,
	WebGLRenderTarget,
	ShaderChunk,
	Matrix4,
	Color,
	Vector3,
	Plane,
	Vector4,
	Mesh,
	Math,
	ShaderMaterial,
	PlaneBufferGeometry,
	RepeatWrapping,
	LinearFilter,
	Scene,
	FrontSide
} from 'three';

import Mirror from './Mirror';
import ImagesEngine from '../../images/ImagesEngine';
import SceneManager from '../../base/SceneManager';

export class WaterShader extends Mirror {

	wateruniforms() {
		return UniformsUtils.merge(	[
            UniformsLib["fog"], {
                "normalSampler":    { type: "t", value: null },
                "mirrorSampler":    { type: "t", value: null },
                "alpha":            { type: "f", value: 1.0 },
                "time":             { type: "f", value: 0.0 },
                "distortionScale":  { type: "f", value: 20.0 },
                "noiseScale":       { type: "f", value: 1.0 },
                "textureMatrix" :   { type: "m4", value: new Matrix4() },
                "sunColor":         { type: "c", value: new Color( 0x7F7F7F ) },
                "sunDirection":     { type: "v3", value: new Vector3( 0.70707, 0.70707, 0 ) },
                "eye":              { type: "v3", value: new Vector3() },
                "waterColor":       { type: "c", value: new Color( 0x555555 ) }
            }
        ])
	}

	watervertex() {
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
        ].join('\n');
    }

	waterfragment() {
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

            ShaderChunk[ "common" ],
            ShaderChunk[ "fog_pars_fragment" ],

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
                ShaderChunk[ "fog_fragment" ],
            '	gl_FragColor = vec4( outgoingLight, alpha );',
            '}'
        ].join( '\n' );
    }

	constructor(renderer, camera, scene, options) {
		super(renderer, camera, scene, options);

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
		this.sunDirection = optionalParameter( options.sunDirection, new Vector3( 0.70707, 0.70707, 0.0 ) );
		this.sunColor = new Color( optionalParameter( options.sunColor, 0xffffff ) );
		this.waterColor = new Color( optionalParameter( options.waterColor, 0x7F7F7F ) );
		this.eye = optionalParameter( options.eye, new Vector3( 0, 0, 0 ) );
		this.distortionScale = optionalParameter( options.distortionScale, 20.0 );
		this.side = optionalParameter( options.side, FrontSide );
		this.fog = optionalParameter( options.fog, false );

		this.renderer = renderer;
		this.scene = scene;
		this.mirrorPlane = new Plane();
		this.normal = new Vector3( 0, 0, 1 );
		this.mirrorWorldPosition = new Vector3();
		this.cameraWorldPosition = new Vector3();
		this.rotationMatrix = new Matrix4();
		this.lookAtPosition = new Vector3( 0, 0, - 1 );
		this.clipPlane = new Vector4();

		if ( camera instanceof PerspectiveCamera ) {
			this.camera = camera;
		} else {
			this.camera = new PerspectiveCamera();
			console.log( this.name + ': camera is not a Perspective Camera!' );
		}

		this.textureMatrix = new Matrix4();

		this.mirrorCamera = this.camera.clone();

		this.renderTarget = new WebGLRenderTarget( width, height );
		this.renderTarget2 = new WebGLRenderTarget( width, height );

		this.material = new ShaderMaterial( {
			fragmentShader: this.waterfragment(),
			vertexShader: this.watervertex(),
			uniforms: UniformsUtils.clone(this.wateruniforms()),
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

		if ( ! Math.isPowerOfTwo( width ) || ! Math.isPowerOfTwo( height ) ) {
			this.renderTarget.texture.generateMipmaps = false;
			this.renderTarget.texture.minFilter = LinearFilter;
			this.renderTarget2.texture.generateMipmaps = false;
			this.renderTarget2.texture.minFilter = LinearFilter;
		}

		this.updateTextureMatrix();
		this.render();
	}

	render = () => {
		if ( this.matrixNeedsUpdate ) this.updateTextureMatrix();

		this.matrixNeedsUpdate = true;

		// Render the mirrored view of the current scene into the target texture
		var scene = this;

		while ( scene.parent !== null ) {
			scene = scene.parent;
		}

		if ( scene !== undefined && scene instanceof Scene ) {
			// We can't render ourself to ourself
			var visible = this.material.visible;
			this.material.visible = false;

			this.renderer.render(scene, this.mirrorCamera, this.renderTarget, true);

			this.material.visible = visible;
		}
	}
}

export default class Water {

	constructor(renderer, camera, scene, options) {
		var waterNormals = options.texture || ImagesEngine.get(options.textureNormalName || 'waterNormal');
		waterNormals.wrapS = waterNormals.wrapT = RepeatWrapping;

		this.water = new WaterShader(renderer, camera, scene, {
			textureWidth: options.textureWidth || 512,
			textureHeight: options.textureHeight || 512,
			waterNormals: waterNormals,
			alpha: 1.0, //options.alpha || 1.0,
			sunDirection: new Vector3(-0.5773502691896258, 0.5773502691896258, -0.5773502691896258),//options.light ? options.light.position.clone().normalize() : new THREE.Vector3( - 1, 1, - 1).normalize(),
			sunColor: 0xffffff,//options.sunColor || 0xffffff,
			waterColor: 0x001e0f, //options.waterColor || 0x001e0f,
			distortionScale: options.distortionScale || 50.0
		});

		var width = options.width || 512,
			height = options.height || 512;

		this.mesh = new Mesh(
			new PlaneBufferGeometry(width * 500, height * 500 ),
			this.water.material
		);

		this.mesh.add(this.water);
		this.mesh.rotation.x = - window.Math.PI * 0.5;

		SceneManager.add(this.mesh, this);
	}

	render() {
		this.water.material.uniforms.time.value += 1.0 / 60.0;
		this.water.render();
	}

	updateTextureMatrix() {
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

		var q = new Vector4();
		var projectionMatrix = this.mirrorCamera.projectionMatrix;

		q.x = ( Math.sign( this.clipPlane.x ) + projectionMatrix.elements[ 8 ] ) / projectionMatrix.elements[ 0 ];
		q.y = ( Math.sign( this.clipPlane.y ) + projectionMatrix.elements[ 9 ] ) / projectionMatrix.elements[ 5 ];
		q.z = - 1.0;
		q.w = ( 1.0 + projectionMatrix.elements[ 10 ] ) / projectionMatrix.elements[ 14 ];

		// Calculate the scaled plane vector
		var c = new Vector4();
		c = this.clipPlane.multiplyScalar( 2.0 / this.clipPlane.dot( q ) );

		// Replacing the third row of the projection matrix
		projectionMatrix.elements[ 2 ] = c.x;
		projectionMatrix.elements[ 6 ] = c.y;
		projectionMatrix.elements[ 10 ] = c.z + 1.0 - this.clipBias;
		projectionMatrix.elements[ 14 ] = c.w;

	}
}
