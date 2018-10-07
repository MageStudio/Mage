import {
    OceanSimVertex,
    OceanSubTransform,
    OceanInitialSpectrum,
    OceanNormals,
    OceanPhase,
    OceanMain,
    OceanSpectrum
} from './OceanShaders';

import {
    OrthographicCamera,
    Scene,
    HalfFloatType,
    LinearFilter,
    ClampToEdgeWrapping,
    RGBAFormat,
    NearestFilter,
    WebGLRenderTarget,
    ShaderMaterial,
    UniformsUtils,
    Vector2,
    Mesh as THREEMesh,
    PlaneBufferGeometry,
    DataTexture
} from 'three';

class OceanShader {

    constructor(renderer, camera, scene, options) {

        // flag used to trigger parameter changes
        this.changed = true;
        this.initial = true;

        // Assign required parameters as object properties
        this.oceanCamera = new OrthographicCamera(); //camera.clone();
        this.oceanCamera.position.z = 1;
        this.renderer = renderer;
        this.renderer.clearColor(0xffffff);

        this.scene = new Scene();

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
        this.oceanColor = optionalParameter(options.OCEAN_COLOR, new Vector3(0.004, 0.016, 0.047));
        this.skyColor = optionalParameter(options.SKY_COLOR, new Vector3(3.2, 9.6, 12.8));
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
        const renderTargetType = optionalParameter(options.USE_HALF_FLOAT, false) ? HalfFloatType : THREE.FloatType;
        const LinearClampParams = {
            minFilter: LinearFilter,
            magFilter: LinearFilter,
            wrapS: ClampToEdgeWrapping,
            wrapT: ClampToEdgeWrapping,
            format: RGBAFormat,
            stencilBuffer: false,
            depthBuffer: false,
            premultiplyAlpha: false,
            type: renderTargetType
        };
        const NearestClampParams = {
            minFilter: NearestFilter,
            magFilter: NearestFilter,
            wrapS: ClampToEdgeWrapping,
            wrapT: ClampToEdgeWrapping,
            format: RGBAFormat,
            stencilBuffer: false,
            depthBuffer: false,
            premultiplyAlpha: false,
            type: renderTargetType
        };
        const NearestRepeatParams = {
            minFilter: NearestFilter,
            magFilter: NearestFilter,
            wrapS: RepeatWrapping,
            wrapT: RepeatWrapping,
            format: RGBAFormat,
            stencilBuffer: false,
            depthBuffer: false,
            premultiplyAlpha: false,
            type: renderTargetType
        };
        this.initialSpectrumFramebuffer = new WebGLRenderTarget(this.resolution, this.resolution, NearestRepeatParams);
        this.spectrumFramebuffer = new WebGLRenderTarget(this.resolution, this.resolution, NearestClampParams);
        this.pingPhaseFramebuffer = new WebGLRenderTarget(this.resolution, this.resolution, NearestClampParams);
        this.pongPhaseFramebuffer = new WebGLRenderTarget(this.resolution, this.resolution, NearestClampParams);
        this.pingTransformFramebuffer = new WebGLRenderTarget(this.resolution, this.resolution, NearestClampParams);
        this.pongTransformFramebuffer = new WebGLRenderTarget(this.resolution, this.resolution, NearestClampParams);
        this.displacementMapFramebuffer = new WebGLRenderTarget(this.resolution, this.resolution, LinearClampParams);
        this.normalMapFramebuffer = new WebGLRenderTarget(this.resolution, this.resolution, LinearClampParams);

        // Define shaders and constant uniforms
        ////////////////////////////////////////


        // 1 - Horizontal wave vertices used for FFT
        this.materialOceanHorizontal = new ShaderMaterial({
            uniforms: UniformsUtils.clone(OceanSubTransform.uniforms()),
            vertexShader: OceanSimVertex.vertex(),
            fragmentShader: "#define HORIZONTAL \n" + OceanSubTransform.fragment()
        });

        this.materialOceanHorizontal.uniforms.u_transformSize = { type: "f", value: this.resolution };
        this.materialOceanHorizontal.uniforms.u_subtransformSize = { type: "f", value: null };
        this.materialOceanHorizontal.uniforms.u_input = { type: "t", value: null };
        this.materialOceanHorizontal.depthTest = false;

        // 2 - Vertical wave vertices used for FFT
        this.materialOceanVertical = new ShaderMaterial({
            uniforms: UniformsUtils.clone(OceanSubTransform.uniforms()),
            vertexShader: OceanSimVertex.vertex(),
            fragmentShader: OceanSubTransform.fragment()
        });
        this.materialOceanVertical.uniforms.u_transformSize = { type: "f", value: this.resolution };
        this.materialOceanVertical.uniforms.u_subtransformSize = { type: "f", value: null };
        this.materialOceanVertical.uniforms.u_input = { type: "t", value: null };
        this.materialOceanVertical.depthTest = false;

        // 3 - Initial spectrum used to generate height map
        this.materialInitialSpectrum = new ShaderMaterial({
            uniforms: UniformsUtils.clone(OceanInitialSpectrum.uniforms());,
            vertexShader: OceanSimVertex.vertex(),
            fragmentShader: OceanInitialSpectrum.fragment()
        });
        this.materialInitialSpectrum.uniforms.u_wind = { type: "v2", value: new Vector2() };
        this.materialInitialSpectrum.uniforms.u_resolution = { type: "f", value: this.resolution };
        this.materialInitialSpectrum.depthTest = false;

        // 4 - Phases used to animate heightmap
        this.materialPhase = new ShaderMaterial({
            uniforms: UniformsUtils.clone(OceanPhase.uniforms());,
            vertexShader: OceanSimVertex.vertex(),
            fragmentShader: OceanPhase.fragment()
        });
        this.materialPhase.uniforms.u_resolution = { type: "f", value: this.resolution };
        this.materialPhase.depthTest = false;

        // 5 - Shader used to update spectrum
        this.materialSpectrum = new ShaderMaterial({
            uniforms: UniformsUtils.clone(OceanSpectrum.uniforms()),
            vertexShader: OceanSimVertex.vertex(),
            fragmentShader: OceanSpectrum.fragment()
        });
        this.materialSpectrum.uniforms.u_initialSpectrum = { type: "t", value: null };
        this.materialSpectrum.uniforms.u_resolution = { type: "f", value: this.resolution };
        this.materialSpectrum.depthTest = false;

        // 6 - Shader used to update spectrum normals
        this.materialNormal = new ShaderMaterial({
            uniforms: UniformsUtils.clone(OceanNormals.uniforms()),
            vertexShader: OceanSimVertex.vertex(),
            fragmentShader: OceanNormals.fragment()
        });
        this.materialNormal.uniforms.u_displacementMap = { type: "t", value: null };
        this.materialNormal.uniforms.u_resolution = { type: "f", value: this.resolution };
        this.materialNormal.depthTest = false;

        // 7 - Shader used to update normals
        this.materialOcean = new ShaderMaterial({
            uniforms: UniformsUtils.clone(OceanMain.uniforms()),
            vertexShader: OceanMain.vertex(),
            fragmentShader: OceanMain.fragment()
        });
        // this.materialOcean.wireframe = true;
        this.materialOcean.uniforms.u_geometrySize = { type: "f", value: this.resolution };
        this.materialOcean.uniforms.u_displacementMap = { type: "t", value: this.displacementMapFramebuffer.texture };
        this.materialOcean.uniforms.u_normalMap = { type: "t", value: this.normalMapFramebuffer.texture };
        this.materialOcean.uniforms.u_oceanColor = { type: "v3", value: this.oceanColor };
        this.materialOcean.uniforms.u_skyColor = { type: "v3", value: this.skyColor };
        this.materialOcean.uniforms.u_sunDirection = { type: "v3", value: new Vector3(this.sunDirectionX, this.sunDirectionY, this.sunDirectionZ) };
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
        this.screenQuad = new THREEMesh(new PlaneBufferGeometry(2, 2));
        this.scene.add(this.screenQuad);

        // Initialise spectrum data
        this.generateSeedPhaseTexture();

        // Generate the ocean mesh
        this.generateMesh();

    }

    generateMesh() {

        const geometry = new PlaneBufferGeometry(this.geometrySize, this.geometrySize, this.geometryResolution, this.geometryResolution);

        geometry.rotateX(- Math.PI / 2);

        this.oceanMesh = new THREEMesh(geometry, this.materialOcean);

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

        this.pingPhaseTexture = new DataTexture(phaseArray, this.resolution, this.resolution, THREE.RGBAFormat);
        this.pingPhaseTexture.wrapS = ClampToEdgeWrapping;
        this.pingPhaseTexture.wrapT = ClampToEdgeWrapping;
        this.pingPhaseTexture.type = FloatType;
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
            OCEAN_COLOR: options.oceanColor || new Vector3(0.004, 0.016, 0.047),
            SKY_COLOR: options.skyColor || new Vector3(3.2, 9.6, 12.8),
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
