import {
    PlaneGeometry,
    Mesh,
    Vector3,
    Matrix4,
    Plane,
    Vector4,
    LinearFilter,
    RGBFormat,
    WebGLRenderTarget,
    ShaderMaterial,
    UniformsUtils,
    Color,
    PerspectiveCamera,
} from "three";
import Element from "../../entities/Element";
import { ENTITY_TYPES } from "../../entities/constants";
import { generateRandomName } from "../../lib/uuid";
import Scene from "../../core/Scene";

const DEFAULT_TEXTURE_WIDTH = 512;
const DEFAULT_TEXTURE_HEIGHT = 512;
const DEFAULT_CLIP_BIAS = 0.003;
const DEFAULT_COLOR = 0x7f7f7f;
const DEFAULT_WIDTH = 100;
const DEFAULT_HEIGHT = 100;

// Mirror shader uniforms
const mirrorUniforms = () => ({
    mirrorColor: { type: "c", value: new Color(0x7f7f7f) },
    mirrorSampler: { type: "t", value: null },
    textureMatrix: { type: "m4", value: new Matrix4() },
});

// Mirror vertex shader
const mirrorVertexShader = `
    uniform mat4 textureMatrix;
    varying vec4 mirrorCoord;
    void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        mirrorCoord = textureMatrix * worldPosition;
        gl_Position = projectionMatrix * mvPosition;
    }
`;

// Mirror fragment shader
const mirrorFragmentShader = `
    uniform vec3 mirrorColor;
    uniform sampler2D mirrorSampler;
    varying vec4 mirrorCoord;
    float blendOverlay(float base, float blend) {
        return(base < 0.5 ? (2.0 * base * blend) : (1.0 - 2.0 * (1.0 - base) * (1.0 - blend)));
    }
    void main() {
        vec4 color = texture2DProj(mirrorSampler, mirrorCoord);
        color = vec4(blendOverlay(mirrorColor.r, color.r), blendOverlay(mirrorColor.g, color.g), blendOverlay(mirrorColor.b, color.b), 1.0);
        gl_FragColor = color;
    }
`;

/**
 * MirrorElement wraps mirror reflection rendering to fit the Entity system.
 * - Entity lifecycle management (serialization, deserialization)
 * - Integration with the editor's hierarchy and inspector
 * - Automatic render loop hook via onBeforeRender
 */
export default class MirrorElement extends Element {
    constructor(options = {}) {
        const {
            name = generateRandomName("Mirror"),
            textureWidth = DEFAULT_TEXTURE_WIDTH,
            textureHeight = DEFAULT_TEXTURE_HEIGHT,
            clipBias = DEFAULT_CLIP_BIAS,
            color = DEFAULT_COLOR,
            width = DEFAULT_WIDTH,
            height = DEFAULT_HEIGHT,
        } = options;

        const cleanedOptions = {
            textureWidth,
            textureHeight,
            clipBias,
            color,
            width,
            height,
        };

        super({ name, ...cleanedOptions });

        // Store references
        this.renderer = Scene.getRenderer();
        this.clipBias = clipBias;
        this.textureWidth = textureWidth;
        this.textureHeight = textureHeight;

        // Create render target for mirror reflection
        const parameters = {
            minFilter: LinearFilter,
            magFilter: LinearFilter,
            format: RGBFormat,
            stencilBuffer: false,
        };
        this.renderTarget = new WebGLRenderTarget(textureWidth, textureHeight, parameters);

        // Create mirror camera - only renders layer 0, excludes layer 1 (editor-only objects)
        this.mirrorCamera = new PerspectiveCamera();
        this.mirrorCamera.matrixAutoUpdate = true;
        this.mirrorCamera.layers.set(0); // Only see layer 0

        // Create mirror material
        this.mirrorMaterial = new ShaderMaterial({
            fragmentShader: mirrorFragmentShader,
            vertexShader: mirrorVertexShader,
            uniforms: UniformsUtils.clone(mirrorUniforms()),
        });

        this.mirrorMaterial.uniforms.mirrorSampler.value = this.renderTarget.texture;
        this.mirrorMaterial.uniforms.mirrorColor.value = new Color(color);

        // Reflection calculation helpers
        this.mirrorPlane = new Plane();
        this.normal = new Vector3(0, 0, 1);
        this.mirrorWorldPosition = new Vector3();
        this.cameraWorldPosition = new Vector3();
        this.rotationMatrix = new Matrix4();
        this.lookAtPosition = new Vector3(0, 0, -1);
        this.clipPlane = new Vector4();
        this.textureMatrix = new Matrix4();

        // Create a plane geometry for the mirror surface
        const geometry = new PlaneGeometry(width, height);
        const body = new Mesh(geometry, this.mirrorMaterial);

        // Set mirror to layer 1 ONLY so it doesn't reflect itself
        // The mirrorCamera only sees layer 0, so it won't render the mirror
        // Main camera has layer 1 enabled so it can see the mirror
        body.layers.set(1);

        // Hook mirror rendering into THREE.js render loop
        const self = this;
        body.onBeforeRender = function (renderer, scene, camera) {
            self.renderMirror(renderer, scene, camera, this);
        };

        this.setBody({ body });
        this.setEntityType(ENTITY_TYPES.SCENERY.TYPE);
        this.setEntitySubtype(ENTITY_TYPES.SCENERY.SUBTYPES.MIRROR);
    }

    renderMirror(renderer, scene, camera, mesh) {
        // Update matrices
        mesh.updateMatrixWorld();
        camera.updateMatrixWorld();

        this.mirrorWorldPosition.setFromMatrixPosition(mesh.matrixWorld);
        this.cameraWorldPosition.setFromMatrixPosition(camera.matrixWorld);

        this.rotationMatrix.extractRotation(mesh.matrixWorld);

        this.normal.set(0, 0, 1);
        this.normal.applyMatrix4(this.rotationMatrix);

        const view = this.mirrorWorldPosition.clone().sub(this.cameraWorldPosition);
        view.reflect(this.normal).negate();
        view.add(this.mirrorWorldPosition);

        this.rotationMatrix.extractRotation(camera.matrixWorld);

        this.lookAtPosition.set(0, 0, -1);
        this.lookAtPosition.applyMatrix4(this.rotationMatrix);
        this.lookAtPosition.add(this.cameraWorldPosition);

        const target = this.mirrorWorldPosition.clone().sub(this.lookAtPosition);
        target.reflect(this.normal).negate();
        target.add(this.mirrorWorldPosition);

        this.mirrorCamera.position.copy(view);
        this.mirrorCamera.up.set(0, -1, 0);
        this.mirrorCamera.up.applyMatrix4(this.rotationMatrix);
        this.mirrorCamera.up.reflect(this.normal).negate();
        this.mirrorCamera.lookAt(target);

        this.mirrorCamera.far = camera.far;
        this.mirrorCamera.updateProjectionMatrix();
        this.mirrorCamera.projectionMatrix.copy(camera.projectionMatrix);
        this.mirrorCamera.updateMatrixWorld();
        this.mirrorCamera.matrixWorldInverse.copy(this.mirrorCamera.matrixWorld).invert();

        // Update the texture matrix
        this.textureMatrix.set(
            0.5,
            0.0,
            0.0,
            0.5,
            0.0,
            0.5,
            0.0,
            0.5,
            0.0,
            0.0,
            0.5,
            0.5,
            0.0,
            0.0,
            0.0,
            1.0,
        );
        this.textureMatrix.multiply(this.mirrorCamera.projectionMatrix);
        this.textureMatrix.multiply(this.mirrorCamera.matrixWorldInverse);

        // Update clip plane
        this.mirrorPlane.setFromNormalAndCoplanarPoint(this.normal, this.mirrorWorldPosition);
        this.mirrorPlane.applyMatrix4(this.mirrorCamera.matrixWorldInverse);

        this.clipPlane.set(
            this.mirrorPlane.normal.x,
            this.mirrorPlane.normal.y,
            this.mirrorPlane.normal.z,
            this.mirrorPlane.constant,
        );

        const q = new Vector4();
        const projectionMatrix = this.mirrorCamera.projectionMatrix;

        q.x =
            (Math.sign(this.clipPlane.x) + projectionMatrix.elements[8]) /
            projectionMatrix.elements[0];
        q.y =
            (Math.sign(this.clipPlane.y) + projectionMatrix.elements[9]) /
            projectionMatrix.elements[5];
        q.z = -1.0;
        q.w = (1.0 + projectionMatrix.elements[10]) / projectionMatrix.elements[14];

        // Calculate the scaled plane vector
        this.clipPlane.multiplyScalar(2.0 / this.clipPlane.dot(q));

        // Replacing the third row of the projection matrix
        projectionMatrix.elements[2] = this.clipPlane.x;
        projectionMatrix.elements[6] = this.clipPlane.y;
        projectionMatrix.elements[10] = this.clipPlane.z + 1.0 - this.clipBias;
        projectionMatrix.elements[14] = this.clipPlane.w;

        this.mirrorMaterial.uniforms.textureMatrix.value = this.textureMatrix;

        // Render the mirrored scene
        mesh.visible = false;
        const currentRenderTarget = renderer.getRenderTarget();

        // Save current clear color and set to scene background if available
        const currentClearColor = renderer.getClearColor(new Color());
        const currentClearAlpha = renderer.getClearAlpha();

        // Use scene background color for mirror clear if available
        if (scene.background && scene.background.isColor) {
            renderer.setClearColor(scene.background, 1);
        }

        renderer.setRenderTarget(this.renderTarget);
        renderer.clear();
        renderer.render(scene, this.mirrorCamera);
        renderer.setRenderTarget(currentRenderTarget);

        // Restore clear color
        renderer.setClearColor(currentClearColor, currentClearAlpha);

        mesh.visible = true;
    }

    /**
     * Set the mirror color
     * @param {number|string} color - The color value (hex number or string)
     */
    setColor(color) {
        this.setData("color", color);
        if (this.mirrorMaterial) {
            this.mirrorMaterial.uniforms.mirrorColor.value.set(color);
        }
    }

    /**
     * Set the clip bias for the mirror
     * @param {number} bias - The clip bias value
     */
    setClipBias(bias) {
        this.setData("clipBias", bias);
        this.clipBias = bias;
    }

    /**
     * Dispose the mirror and its resources
     */
    dispose() {
        if (this.renderTarget) {
            this.renderTarget.dispose();
        }
        if (this.mirrorMaterial) {
            this.mirrorMaterial.dispose();
        }
        super.dispose();
    }

    /**
     * Factory method for deserialization
     * @param {object} data - The serialized data
     * @returns {MirrorElement} A new MirrorElement instance
     */
    static create(data) {
        return new MirrorElement(data.options || data);
    }
}
