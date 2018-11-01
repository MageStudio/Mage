/**
 * @author jbouny / https://github.com/jbouny
 *
 * Work based on :
 * @author Slayvin / http://slayvin.net : Flat mirror for three.js
 * @author Stemkoski / http://www.adelphi.edu/~stemkoski : An implementation of water shader based on the flat mirror
 * @author Jonas Wagner / http://29a.ch/ && http://29a.ch/slides/2012/webglwater/ : Water shader explanations in WebGL
 */

import {
    Mesh,
    Color,
    Vector3,
    FrontSide,
    Plane,
    Matrix4,
    Vector4,
    PerspectiveCamera,
    LinearFilter,
    RGBFormat,
    WebGLRenderTarget,
    Math as THREEMath,
    UniformsLib,
    UniformsUtils,
    ShaderChunk,
    ShaderMaterial,
    PlaneBufferGeometry,
    RepeatWrapping
} from 'three';

import ImagesEngine from '../../images/ImagesEngine';
import SceneManager from '../../base/SceneManager';

const mirrorShader = {
    uniforms: UniformsUtils.merge([
        UniformsLib['fog'],
        UniformsLib['lights'],
        {
            normalSampler: {
                value: null
            },
            mirrorSampler: {
                value: null
            },
            alpha: {
                value: 1.0
            },
            time: {
                value: 0.0
            },
            size: {
                value: 1.0
            },
            distortionScale: {
                value: 20.0
            },
            textureMatrix: {
                value: new Matrix4()
            },
            sunColor: {
                value: new Color(0x7F7F7F)
            },
            sunDirection: {
                value: new Vector3(0.70707, 0.70707, 0)
            },
            eye: {
                value: new Vector3()
            },
            waterColor: {
                value: new Color(0x555555)
            }
        }
    ]),

    vertexShader: [
        'uniform mat4 textureMatrix;',
        'uniform float time;',

        'varying vec4 mirrorCoord;',
        'varying vec4 worldPosition;',

        ShaderChunk['fog_pars_vertex'],
        ShaderChunk['shadowmap_pars_vertex'],

        'void main() {',
        '	mirrorCoord = modelMatrix * vec4( position, 1.0 );',
        '	worldPosition = mirrorCoord.xyzw;',
        '	mirrorCoord = textureMatrix * mirrorCoord;',
        '	vec4 mvPosition =  modelViewMatrix * vec4( position, 1.0 );',
        '	gl_Position = projectionMatrix * mvPosition;',

        ShaderChunk['fog_vertex'],
        ShaderChunk['shadowmap_vertex'],

        '}'
    ].join('\n'),

    fragmentShader: [
        'uniform sampler2D mirrorSampler;',
        'uniform float alpha;',
        'uniform float time;',
        'uniform float size;',
        'uniform float distortionScale;',
        'uniform sampler2D normalSampler;',
        'uniform vec3 sunColor;', 'uniform vec3 sunDirection;',
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

        ShaderChunk['common'],
        ShaderChunk['packing'],
        ShaderChunk['bsdfs'],
        ShaderChunk['fog_pars_fragment'],
        ShaderChunk['lights_pars_begin'],
        ShaderChunk['shadowmap_pars_fragment'],
        ShaderChunk['shadowmask_pars_fragment'],

        'void main() {',
        '	vec4 noise = getNoise( worldPosition.xz * size );',
        '	vec3 surfaceNormal = normalize( noise.xzy * vec3( 1.5, 1.0, 1.5 ) );',

        '	vec3 diffuseLight = vec3(0.0);',
        '	vec3 specularLight = vec3(0.0);',

        '	vec3 worldToEye = eye-worldPosition.xyz;',
        '	vec3 eyeDirection = normalize( worldToEye );',
        '	sunLight( surfaceNormal, eyeDirection, 100.0, 2.0, 0.5, diffuseLight, specularLight );',

        '	float distance = length(worldToEye);',

        '	vec2 distortion = surfaceNormal.xz * ( 0.001 + 1.0 / distance ) * distortionScale;',
        '	vec3 reflectionSample = vec3( texture2D( mirrorSampler, mirrorCoord.xy / mirrorCoord.z + distortion ) );',

        '	float theta = max( dot( eyeDirection, surfaceNormal ), 0.0 );',
        '	float rf0 = 0.3;',
        '	float reflectance = rf0 + ( 1.0 - rf0 ) * pow( ( 1.0 - theta ), 5.0 );',
        '	vec3 scatter = max( 0.0, dot( surfaceNormal, eyeDirection ) ) * waterColor;',
        '	vec3 albedo = mix( ( sunColor * diffuseLight * 0.3 + scatter ) * getShadowMask(), ( vec3( 0.1 ) + reflectionSample * 0.9 + reflectionSample * specularLight ), reflectance);',
        '	vec3 outgoingLight = albedo;',
        '	gl_FragColor = vec4( outgoingLight, alpha );',

        ShaderChunk['tonemapping_fragment'],
        ShaderChunk['fog_fragment'],

        '}'
    ].join('\n')

}

export class WaterShader extends Mesh {

    constructor(geometry, options) {
        super(geometry);

        options = options || {};

        var textureWidth = options.textureWidth !== undefined ? options.textureWidth : 512;
        var textureHeight = options.textureHeight !== undefined ? options.textureHeight : 512;

        this.clipBias = options.clipBias !== undefined ? options.clipBias : 0.0;
        var alpha = options.alpha !== undefined ? options.alpha : 1.0;
        var time = options.time !== undefined ? options.time : 0.0;
        var normalSampler = options.waterNormals !== undefined ? options.waterNormals : null;
        var sunDirection = options.sunDirection !== undefined ? options.sunDirection : new Vector3(0.70707, 0.70707, 0.0);
        var sunColor = new Color(options.sunColor !== undefined ? options.sunColor : 0xffffff);
        var waterColor = new Color(options.waterColor !== undefined ? options.waterColor : 0x7F7F7F);
        this.eye = options.eye !== undefined ? options.eye : new Vector3(0, 0, 0);
        var distortionScale = options.distortionScale !== undefined ? options.distortionScale : 20.0;
        var side = options.side !== undefined ? options.side : FrontSide;
        var fog = options.fog !== undefined ? options.fog : false;

        this.mirrorPlane = new Plane();
        this.normal = new Vector3();
        this.mirrorWorldPosition = new Vector3();
        this.cameraWorldPosition = new Vector3();
        this.rotationMatrix = new Matrix4();
        this.lookAtPosition = new Vector3(0, 0, -1);
        this.clipPlane = new Vector4();

        this.view = new Vector3();
        this.target = new Vector3();
        this.q = new Vector4();

        this.textureMatrix = new Matrix4();

        this.mirrorCamera = new PerspectiveCamera();

        var parameters = {
            minFilter: LinearFilter,
            magFilter: LinearFilter,
            format: RGBFormat,
            stencilBuffer: false
        };

        this.renderTarget = new WebGLRenderTarget(textureWidth, textureHeight, parameters);

        if (!THREEMath.isPowerOfTwo(textureWidth) || !THREEMath.isPowerOfTwo(textureHeight)) {
          this.renderTarget.texture.generateMipmaps = false;
        }

        this.material = new ShaderMaterial({
            fragmentShader: mirrorShader.fragmentShader,
            vertexShader: mirrorShader.vertexShader,
            uniforms: UniformsUtils.clone(mirrorShader.uniforms),
            transparent: true,
            lights: true,
            side: side,
            fog: fog
        });

        this.material.uniforms.mirrorSampler.value = this.renderTarget.texture;
        this.material.uniforms.textureMatrix.value = this.textureMatrix;
        this.material.uniforms.alpha.value = alpha;
        this.material.uniforms.time.value = time;
        this.material.uniforms.normalSampler.value = normalSampler;
        this.material.uniforms.sunColor.value = sunColor;
        this.material.uniforms.waterColor.value = waterColor;
        this.material.uniforms.sunDirection.value = sunDirection;
        this.material.uniforms.distortionScale.value = distortionScale;

        this.material.uniforms.eye.value = this.eye;
    }

    onBeforeRender = (renderer, scene, camera) => {

        this.mirrorWorldPosition.setFromMatrixPosition(this.matrixWorld);
        this.cameraWorldPosition.setFromMatrixPosition(camera.matrixWorld);

        this.rotationMatrix.extractRotation(this.matrixWorld);

        this.normal.set(0, 0, 1);
        this.normal.applyMatrix4(this.rotationMatrix);

        this.view.subVectors(this.mirrorWorldPosition, this.cameraWorldPosition);

        // Avoid rendering when mirror is facing away
        if (this.view.dot(this.normal) > 0) return;

        this.view.reflect(this.normal).negate();
        this.view.add(this.mirrorWorldPosition);

        this.rotationMatrix.extractRotation(camera.matrixWorld);

        this.lookAtPosition.set(0, 0, -1);
        this.lookAtPosition.applyMatrix4(this.rotationMatrix);
        this.lookAtPosition.add(this.cameraWorldPosition);

        this.target.subVectors(this.mirrorWorldPosition, this.lookAtPosition);
        this.target.reflect(this.normal).negate();
        this.target.add(this.mirrorWorldPosition);

        this.mirrorCamera.position.copy(this.view);
        this.mirrorCamera.up.set(0, 1, 0);
        this.mirrorCamera.up.applyMatrix4(this.rotationMatrix);
        this.mirrorCamera.up.reflect(this.normal);
        this.mirrorCamera.lookAt(this.target);

        this.mirrorCamera.far = camera.far; // Used in WebGLBackground
        this.mirrorCamera.updateMatrixWorld();
        this.mirrorCamera.projectionMatrix.copy(camera.projectionMatrix);

        // Update the texture matrix
        this.textureMatrix.set(
            0.5, 0.0, 0.0, 0.5,
            0.0, 0.5, 0.0, 0.5,
            0.0, 0.0, 0.5, 0.5,
            0.0, 0.0, 0.0, 1.0
        );
        this.textureMatrix.multiply(this.mirrorCamera.projectionMatrix);
        this.textureMatrix.multiply(this.mirrorCamera.matrixWorldInverse);

        // Now update projection matrix with new clip plane, implementing code from: http://www.terathon.com/code/oblique.html
        // Paper explaining this technique: http://www.terathon.com/lengyel/Lengyel-Oblique.pdf
        this.mirrorPlane.setFromNormalAndCoplanarPoint(this.normal, this.mirrorWorldPosition);
        this.mirrorPlane.applyMatrix4(this.mirrorCamera.matrixWorldInverse);

        this.clipPlane.set(this.mirrorPlane.normal.x, this.mirrorPlane.normal.y, this.mirrorPlane.normal.z, this.mirrorPlane.constant);

        var projectionMatrix = this.mirrorCamera.projectionMatrix;

        this.q.x = (window.Math.sign(this.clipPlane.x) + projectionMatrix.elements[8]) / projectionMatrix.elements[0];
        this.q.y = (window.Math.sign(this.clipPlane.y) + projectionMatrix.elements[9]) / projectionMatrix.elements[5];
        this.q.z = -1.0;
        this.q.w = (1.0 + projectionMatrix.elements[10]) / projectionMatrix.elements[14];

        // Calculate the scaled plane vector
        this.clipPlane.multiplyScalar(2.0 / this.clipPlane.dot(this.q));

        // Replacing the third row of the projection matrix
        projectionMatrix.elements[2] = this.clipPlane.x;
        projectionMatrix.elements[6] = this.clipPlane.y;
        projectionMatrix.elements[10] = this.clipPlane.z + 1.0 - this.clipBias;
        projectionMatrix.elements[14] = this.clipPlane.w;

        this.eye.setFromMatrixPosition(camera.matrixWorld);

        //
        var currentRenderTarget = renderer.getRenderTarget();

        var currentVrEnabled = renderer.vr.enabled;
        var currentShadowAutoUpdate = renderer.shadowMap.autoUpdate;

        this.visible = false;

        renderer.vr.enabled = false; // Avoid camera modification and recursion
        renderer.shadowMap.autoUpdate = false; // Avoid re-computing shadows
        renderer.render(scene, this.mirrorCamera, this.renderTarget, true);

        this.visible = true;

        renderer.vr.enabled = currentVrEnabled;
        renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;

        renderer.setRenderTarget(currentRenderTarget);
    }
}

export default class Water {

    constructor(options) {

        const waterNormals = options.texture || ImagesEngine.get(options.textureNormalName || 'waterNormal');
		waterNormals.wrapS = waterNormals.wrapT = RepeatWrapping;

        const width = options.width || 512,
			height = options.height || 512;

        const geometry = new PlaneBufferGeometry(width * 500, height * 500 );

        this.water = new WaterShader(
			geometry,
			{
				textureWidth: options.textureWidth || 512,
				textureHeight: options.textureHeight || 512,
				waterNormals,
				alpha: options.alpha || 1.0,
				sunDirection: new Vector3(-0.5773502691896258, 0.5773502691896258, -0.5773502691896258),
				sunColor: 0xffffff,
				waterColor: 0x001e0f,
				distortionScale:  options.distortionScale || 50.0,
				fog: SceneManager.scene.fog !== undefined
			}
		);
		this.water.rotation.x = - window.Math.PI / 2;

        SceneManager.add(this.water, this);
    }

    render = () => {
        this.water.material.uniforms.time.value += 1.0 / 60.0;
    }
}
