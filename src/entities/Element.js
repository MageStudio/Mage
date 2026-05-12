import { Mesh, RepeatWrapping, Raycaster, Color, Vector3, sRGBEncoding } from "three";

import Entity from "../entities/Entity";
import { ENTITY_TYPES, ENTITY_EVENTS } from "../entities/constants";

import {
    ELEMENT_NOT_SET,
    ANIMATION_HANDLER_NOT_FOUND,
    ELEMENT_SET_COLOR_MISSING_COLOR,
    ELEMENT_MATERIAL_NO_SUPPORT_FOR_TEXTURE,
    DEPRECATIONS,
    ELEMENT_SET_REFLECTIVITY_MISSING_VALUE,
    ELEMENT_SET_REFRACTION_RATIO_MISSING_VALUE,
} from "../lib/messages";
import Images from "../images/Images";
import AnimationHandler from "./animations/AnimationHandler";
import Config from "../core/config";
import Scene from "../core/Scene";
import {
    COLLISION_EVENT,
    MATERIALS,
    MATERIAL_PROPERTIES_DEFAULT_VALUES,
    MATERIAL_PROPERTIES_MAP,
    PROPERTIES,
    TEXTURES,
} from "../lib/constants";
import Universe from "../core/universe";
import Physics from "../physics";
import { DEFAULT_ANGULAR_VELOCITY, DEFAULT_LINEAR_VELOCITY } from "../physics/constants";

import {
    extractBoundingBox,
    extractBiggestBoundingBox,
    extractBoundingSphere,
    extractBiggestBoundingSphere,
    parseBoundingBoxSize,
    getWorldBoundingBoxSize,
    getWorldBoundingSphereRadius,
} from "../physics/utils";

import { clamp } from "../lib/math";
import {
    replaceMaterialByName,
    hasMaterial,
    hasGeometry,
    disposeTextures,
    disposeMaterial,
    disposeGeometry,
    setUpLightsAndShadows,
    applyMaterialChange,
    extractMaterialProperty,
} from "../lib/meshUtils";
import { isTextureMapAllowedForMaterial } from "../materials/helpers";
import { generateRandomName } from "../lib/uuid";
import { tweenTo } from "../lib/easing";
import { populateMap, serializeMap } from "../lib/map";

const COLLIDER_TAG = "collider";
const DEFAULT_COLLIDER_OFFSET = { x: 0, y: 0, z: 0 };
const DEFAULT_PHYSICS_OPTIONS = {
    applyPhysicsUpdate: true,
    mass: 0,
    colliderType: "BOX",
};

export default class Element extends Entity {
    constructor(options = {}) {
        super(options);

        const {
            name = generateRandomName(this.constructor.name),
            geometry,
            material,
            body,
        } = options;

        this.textures = new Map();
        this.opacity = 1;
        this.extendOptions({ name });

        this.physicsOptions = DEFAULT_PHYSICS_OPTIONS;
        this.physicsState = new Map();

        this.setBody({ geometry, material, body });

        this.colliders = [];
        this.collisionsEnabled = true;

        this.animationHandler = undefined;
        this.animations = [];

        this.setMaterialType();
        this.setEntityType(ENTITY_TYPES.MESH.TYPE);
        this.setEntitySubtype(ENTITY_TYPES.MESH.SUBTYPES.DEFAULT);
    }

    setBody({ body, geometry, material }) {
        if (body) {
            this.body = body;
        } else if (geometry && material) {
            this.geometry = geometry;
            this.material = material;
            this.body = new Mesh(this.geometry, this.material);
        }

        if (this.hasBody()) {
            this.postBodyCreation();
            this.addToScene();
        }
    }

    evaluateBoundingBox() {
        if (hasGeometry(this.getBody())) {
            this.boundingBox = extractBoundingBox(this.getBody());
        } else {
            this.boundingBox = extractBiggestBoundingBox(this.getBody());
        }
    }

    evaluateBoundingSphere() {
        if (hasGeometry(this.getBody())) {
            this.boundingSphere = extractBoundingSphere(this.getBody());
        } else {
            this.boundingSphere = extractBiggestBoundingSphere(this.getBody());
        }
    }

    postBodyCreation() {
        const { name, shadowsEnabled = true } = this.options;

        this.evaluateBoundingBox();
        this.evaluateBoundingSphere();

        this.setName(name);

        if (shadowsEnabled) {
            setUpLightsAndShadows(this.getBody());
        }
    }

    getComputedColliderSize() {
        const result = {};

        try {
            const body = this.getBody();
            const worldSize = body ? getWorldBoundingBoxSize(body) : null;

            if (worldSize) {
                result.width = parseFloat(worldSize.width.toFixed(3));
                result.height = parseFloat(worldSize.height.toFixed(3));
                result.length = parseFloat(worldSize.length.toFixed(3));
                result.radius = parseFloat(getWorldBoundingSphereRadius(body).toFixed(3));
            } else if (this.boundingBox) {
                const size = parseBoundingBoxSize(this.boundingBox);
                const scale = this.getScale();
                result.width = parseFloat((size.x * scale.x).toFixed(3));
                result.height = parseFloat((size.y * scale.y).toFixed(3));
                result.length = parseFloat((size.z * scale.z).toFixed(3));
            }

            if (result.radius == null && this.boundingSphere) {
                result.radius = parseFloat(this.boundingSphere.radius.toFixed(3));
            }
        } catch {
            // bounding box/sphere not yet available
        }

        return result;
    }

    addToScene() {
        const { addUniverse = true } = this.options;

        if (this.hasBody()) {
            Scene.add(this.getBody(), this, addUniverse);
        } else {
            console.warn(ELEMENT_NOT_SET);
        }
    }

    setName(name, { replace = false } = {}) {
        const oldName = this.name;
        super.setName(name);

        if (this.hasBody()) {
            if (replace) this.dispose();

            this.body.name = name;
            Universe.updateNameIndex(this.uuid(), oldName, name);

            if (replace) this.addToScene();
        }
    }

    toggleShadows(flag = false) {
        if (this.isModel()) {
            this.getBody().castShadow = flag;
            this.getBody().receiveShadow = flag;

            this.getBody().traverse(child => {
                child.castShadow = flag;
                child.receiveShadow = flag;
            });
        }
    }

    /**
     * TODO: the entire animation system needs to be a component
     * e.g.
     *
     * const animationComponent = new AnimationComponent();
     * element.addComponent(animationComponent);
     *
     * element.getComponent("animation").play("animationId");
     */

    setArmature(armature) {
        this.armature = armature;

        Scene.add(this.armature, null, false);
    }

    addAnimationHandler(animations = []) {
        this.animations = animations;
        this.animationHandler = new AnimationHandler(this.getBody(), animations);
        this.addAnimationHandlerListeners();
    }

    handleAnimationHandlerEvents = e => {
        this.dispatchEvent(e);
    };

    addAnimationHandlerListeners() {
        this.animationHandler.addEventListener(
            ENTITY_EVENTS.ANIMATION.LOOP,
            this.handleAnimationHandlerEvents,
        );
        this.animationHandler.addEventListener(
            ENTITY_EVENTS.ANIMATION.FINISHED,
            this.handleAnimationHandlerEvents,
        );
    }

    removeAnimationHandlerListeners() {
        this.animationHandler.removeEventListener(
            ENTITY_EVENTS.ANIMATION.LOOP,
            this.handleAnimationHandlerEvents,
        );
        this.animationHandler.removeEventListener(
            ENTITY_EVENTS.ANIMATION.FINISHED,
            this.handleAnimationHandlerEvents,
        );
    }

    hasAnimationHandler() {
        return !!this.animationHandler;
    }

    hasAnimations() {
        return !!this.animations.length;
    }

    playAnimation(id, options = {}) {
        if (!this.hasAnimations()) return;

        if (this.hasAnimationHandler()) {
            this.animationHandler.playAnimation(id, options);
        } else {
            console.warn(ANIMATION_HANDLER_NOT_FOUND);
        }
    }

    stopAllAnimations() {
        if (!this.hasAnimations()) return;

        if (this.hasAnimationHandler()) {
            this.animationHandler.stopAll();
        } else {
            console.warn(ANIMATION_HANDLER_NOT_FOUND);
        }
    }

    stopCurrentAnimation() {
        if (!this.hasAnimations()) return;

        if (this.hasAnimationHandler()) {
            this.animationHandler.stopCurrentAnimation();
        } else {
            console.warn(ANIMATION_HANDLER_NOT_FOUND);
        }
    }

    getAvailableAnimations() {
        if (!this.hasAnimations()) return [];

        if (this.hasAnimationHandler()) {
            return this.animationHandler.getAvailableAnimations();
        } else {
            console.warn(ANIMATION_HANDLER_NOT_FOUND);
        }

        return [];
    }

    /**
     * Crossfade from current animation to a new animation
     * @param {string|number} id - Target animation name or index
     * @param {Object} options - Blend options
     * @param {number} options.blendDuration - Duration of the crossfade (default: 0.3)
     * @param {number} options.loop - Loop mode (LoopRepeat, LoopOnce)
     * @param {number} options.timeScale - Playback speed (1 = normal)
     * @param {boolean} options.warp - Whether to warp time scales during blend
     */
    crossFadeTo(id, options = {}) {
        if (!this.hasAnimations()) return;

        if (this.hasAnimationHandler()) {
            return this.animationHandler.crossFadeTo(id, options);
        } else {
            console.warn(ANIMATION_HANDLER_NOT_FOUND);
        }
    }

    /**
     * Stop an animation. If no id is provided, stops the current animation.
     * @param {string|number} [id] - Animation name or index (optional)
     * @param {number} fadeOutDuration - Duration to fade out (0 for immediate)
     */
    stopAnimation(id, fadeOutDuration = 0) {
        if (!this.hasAnimations()) return;

        if (this.hasAnimationHandler()) {
            // If no id provided, stop the current animation
            if (id === undefined || id === null) {
                this.animationHandler.stopCurrentAnimation();
            } else {
                this.animationHandler.stopAnimation(id, fadeOutDuration);
            }
        } else {
            console.warn(ANIMATION_HANDLER_NOT_FOUND);
        }
    }

    /**
     * Set the weight of an animation for layered blending
     * @param {string|number} id - Animation name or index
     * @param {number} weight - Weight value (0-1)
     * @param {number} fadeDuration - Optional fade duration
     */
    setAnimationWeight(id, weight, fadeDuration = 0) {
        if (!this.hasAnimations()) return;

        if (this.hasAnimationHandler()) {
            this.animationHandler.setAnimationWeight(id, weight, fadeDuration);
        } else {
            console.warn(ANIMATION_HANDLER_NOT_FOUND);
        }
    }

    /**
     * Set the playback speed of an animation
     * @param {string|number} id - Animation name or index
     * @param {number} timeScale - Speed multiplier (1 = normal, 2 = double speed)
     */
    setAnimationTimeScale(id, timeScale) {
        if (!this.hasAnimations()) return;

        if (this.hasAnimationHandler()) {
            this.animationHandler.setAnimationTimeScale(id, timeScale);
        } else {
            console.warn(ANIMATION_HANDLER_NOT_FOUND);
        }
    }

    /**
     * Get the duration of an animation clip
     * @param {string|number} id - Animation name or index
     * @returns {number} Duration in seconds
     */
    getAnimationDuration(id) {
        if (!this.hasAnimations()) return 0;

        if (this.hasAnimationHandler()) {
            return this.animationHandler.getAnimationDuration(id);
        } else {
            console.warn(ANIMATION_HANDLER_NOT_FOUND);
            return 0;
        }
    }

    /**
     * Check if a specific animation is currently playing
     * @param {string|number} id - Animation name or index
     * @returns {boolean}
     */
    isAnimationPlaying(id) {
        if (!this.hasAnimations()) return false;

        if (this.hasAnimationHandler()) {
            return this.animationHandler.isAnimationPlaying(id);
        } else {
            console.warn(ANIMATION_HANDLER_NOT_FOUND);
            return false;
        }
    }

    /**
     * TODO: the entire physics system needs to be a component
     * e.g.
     *
     * const physicscomponent = new PhysicsComponent();
     * element.addComponent(physicscomponent);
     *
     * element.getComponent("physics").play("animationId");
     */

    setPhysicsOptions({ applyPhysicsUpdate = true, ...rest } = DEFAULT_PHYSICS_OPTIONS) {
        const parsedOptions = {
            applyPhysicsUpdate,
            ...rest,
        };
        this.physicsOptions = parsedOptions;
    }

    getPhysicsOptions(option) {
        return option ? this.physicsOptions[option] : this.physicsOptions;
    }

    setPhysicsState({ dt: _dt, event: _event, ...data } = {}) {
        populateMap(this.physicsState, data);
    }

    getPhysicsState(key) {
        return key ? this.physicsState.get(key) : this.physicsState;
    }

    enablePhysics(options = {}) {
        this.setPhysicsOptions(options);
        this._physicsEnabled = true;

        if (Config.physics().enabled) {
            Physics.add(this, options);
        }
    }

    getAngularVelocity() {
        return this.angularVelocity || DEFAULT_ANGULAR_VELOCITY;
    }

    setAngularVelocity(velocity) {
        const numericVelocity = {
            x: Number(velocity?.x) || 0,
            y: Number(velocity?.y) || 0,
            z: Number(velocity?.z) || 0,
        };
        this.angularVelocity = numericVelocity;
        console.warn("[Mage] setAngularVelocity: Physics.setAngularVelocity not yet implemented");
    }

    getLinearVelocity() {
        return this.linearVelocity || DEFAULT_LINEAR_VELOCITY;
    }

    setLinearVelocity(velocity) {
        const numericVelocity = {
            x: Number(velocity?.x) || 0,
            y: Number(velocity?.y) || 0,
            z: Number(velocity?.z) || 0,
        };
        this.linearVelocity = numericVelocity;
        Physics.setLinearVelocity(this, numericVelocity);
    }

    hasRayColliders = () => this.colliders.length > 0;

    areCollisionsEnabled = () => this.collisionsEnabled;

    enableCollisions = () => (this.collisionsEnabled = true);
    disableCollisions = () => (this.collisionsEnabled = false);

    updateRayColliders = () => {
        this.colliders.forEach(({ ray, helper, offset = DEFAULT_COLLIDER_OFFSET }) => {
            const position = this.body.position
                .clone()
                .add(new Vector3(offset.x, offset.y, offset.z));

            if (helper) {
                helper.updatePoints(this.getPointsFromRayCollider(ray, position));
            }

            ray.ray.origin.copy(position);
        });
    };

    getPointsFromRayCollider = (ray, position) => {
        const origin = position.clone();
        const end = origin.clone().add(ray.ray.direction.clone().multiplyScalar(ray.far));
        //ray.ray.direction.clone().multiplyScalar(ray.far);

        return [origin, end];
    };

    //TODO: ray colliders need refactoring
    createRayColliderFromVector = ({ type, vector }, near, far, offset, _debug) => {
        const parsedOffset = {
            ...DEFAULT_COLLIDER_OFFSET,
            ...offset,
        };

        const position = this.body.position
            .clone()
            .add(new Vector3(parsedOffset.x, parsedOffset.y, parsedOffset.z));

        const ray = new Raycaster(position, vector, near, far);

        let helper;
        // if (debug) {
        //     const points = this.getPointsFromRayCollider(ray, position);
        //     helper = new Line(points);
        //     helper.addTag(COLLIDER_TAG);
        //     helper.setColor(COLLIDER_COLOR);
        //     helper.setThickness(4);
        // }

        if (this.getEntityType() === ENTITY_TYPES.SPRITE) {
            ray.setFromCamera(position, Scene.getCameraBody());
        }

        return {
            type,
            ray,
            helper,
            offset: parsedOffset,
        };
    };

    setColliders = (vectors = [], options = []) => {
        const colliders = vectors.map((vector, i) => {
            const {
                near = 0,
                far = 10,
                debug = false,
                offset = DEFAULT_COLLIDER_OFFSET,
            } = options[i];
            return this.createRayColliderFromVector(vector, near, far, offset, debug);
        });

        this.colliders = [...this.colliders, ...colliders];
    };

    checkRayCollider = ({ ray, type }) => {
        const mapCollision = collision => {
            const { distance, object } = collision;
            const { uuid } = object;

            return {
                distance,
                body: Universe.getByUUID(uuid),
            };
        };

        const collisions = ray
            .intersectObjects(Scene.scene.children)
            .filter(collision => collision.object.uuid !== this.uuid())
            .map(mapCollision)
            .filter(({ body }) => !body.hasTag(COLLIDER_TAG));

        return {
            collisions,
            type,
        };
    };

    checkCollisions = () => {
        const collisions = [];
        this.colliders.forEach(collider => {
            const collision = this.checkRayCollider(collider);

            if (collision) {
                collisions.push(collision);
            }
        });

        if (collisions.length) {
            this.dispatchEvent({
                type: COLLISION_EVENT,
                collisions,
            });
        }

        return collisions;
    };

    isCollidingOnDirection(direction) {
        const collider = this.colliders.filter(({ type }) => type === direction)[0];
        const emptyCollision = {
            collisions: [],
            type: direction,
        };

        return collider ? this.checkRayCollider(collider) : emptyCollision;
    }

    setGeometryRotation(rotation = {}) {
        const x = Number(rotation?.x) || 0;
        const y = Number(rotation?.y) || 0;
        const z = Number(rotation?.z) || 0;

        if (x !== 0) {
            this.getBody().geometry.rotateX(x);
        }

        if (y !== 0) {
            this.getBody().geometry.rotateY(y);
        }

        if (z !== 0) {
            this.getBody().geometry.rotateZ(z);
        }
    }

    setColor(color = MATERIAL_PROPERTIES_DEFAULT_VALUES[PROPERTIES.COLOR]) {
        const _setColor = material => {
            if (
                color &&
                typeof color === "object" &&
                "r" in color &&
                "g" in color &&
                "b" in color
            ) {
                material.color.setRGB(color.r, color.g, color.b);
            } else {
                material.color = new Color(color);
            }
        };
        if (color) {
            applyMaterialChange(this.getBody(), _setColor);
        } else {
            console.warn(ELEMENT_SET_COLOR_MISSING_COLOR);
        }
    }

    getColor() {
        return extractMaterialProperty(this.getBody(), PROPERTIES.COLOR);
    }

    setFog(enabled = MATERIAL_PROPERTIES_DEFAULT_VALUES[PROPERTIES.FOG]) {
        const _setFog = material => (material[PROPERTIES.FOG] = enabled);
        applyMaterialChange(this.getBody(), _setFog);
    }

    getFog() {
        return extractMaterialProperty(this.getBody(), PROPERTIES.FOG);
    }

    setReflectivity(value = MATERIAL_PROPERTIES_DEFAULT_VALUES[PROPERTIES.REFLECTIVITY]) {
        const numericValue = Number(value) || 0;
        const _setReflectivity = material => (material[PROPERTIES.REFLECTIVITY] = numericValue);
        if (value != undefined) {
            applyMaterialChange(this.getBody(), _setReflectivity);
        } else {
            console.warn(ELEMENT_SET_REFLECTIVITY_MISSING_VALUE);
        }
    }

    getReflectivity() {
        return extractMaterialProperty(this.getBody(), PROPERTIES.REFLECTIVITY);
    }

    setRefractionRatio(value = MATERIAL_PROPERTIES_DEFAULT_VALUES[PROPERTIES.REFRACTION_RATIO]) {
        const numericValue = Number(value) || 0;
        const _setRefractionRatio = material =>
            (material[PROPERTIES.REFRACTION_RATIO] = numericValue);
        if (value != undefined) {
            applyMaterialChange(this.getBody(), _setRefractionRatio);
        } else {
            console.warn(ELEMENT_SET_REFRACTION_RATIO_MISSING_VALUE);
        }
    }

    getRefractionRatio() {
        return extractMaterialProperty(this.getBody(), PROPERTIES.REFRACTION_RATIO);
    }

    setDepthWrite(flag = MATERIAL_PROPERTIES_DEFAULT_VALUES[PROPERTIES.DEPTH_WRITE]) {
        const _setDepthWrite = material => (material[PROPERTIES.DEPTH_WRITE] = flag);
        applyMaterialChange(this.getBody(), _setDepthWrite);
    }

    getDepthWrite() {
        return extractMaterialProperty(this.getBody(), PROPERTIES.DEPTH_WRITE);
    }

    setDepthTest(flag = MATERIAL_PROPERTIES_DEFAULT_VALUES[PROPERTIES.DEPTH_TEST]) {
        const _setDepthTest = material => (material[PROPERTIES.DEPTH_TEST] = flag);
        applyMaterialChange(this.getBody(), _setDepthTest);
    }

    getDepthTest() {
        return extractMaterialProperty(this.getBody(), PROPERTIES.DEPTH_TEST);
    }

    setCombine(value = MATERIAL_PROPERTIES_DEFAULT_VALUES[PROPERTIES.COMBINE]) {
        const _setCombine = material => (material[PROPERTIES.COMBINE] = value);
        applyMaterialChange(this.getBody(), _setCombine);
    }

    getCombine() {
        return extractMaterialProperty(this.getBody(), PROPERTIES.COMBINE);
    }

    setFlatShading(flag = MATERIAL_PROPERTIES_DEFAULT_VALUES[PROPERTIES.FLAT_SHADING]) {
        const _setFlatShading = material => (material[PROPERTIES.FLAT_SHADING] = flag);
        applyMaterialChange(this.getBody(), _setFlatShading);
    }

    getFlatShading() {
        return extractMaterialProperty(this.getBody(), PROPERTIES.FLAT_SHADING);
    }

    setShininess(value = MATERIAL_PROPERTIES_DEFAULT_VALUES[PROPERTIES.SHININESS]) {
        const numericValue = Number(value) || 0;
        const _setShininess = material => (material[PROPERTIES.SHININESS] = numericValue);
        applyMaterialChange(this.getBody(), _setShininess);
    }

    getShininess() {
        return extractMaterialProperty(this.getBody(), PROPERTIES.SHININESS);
    }

    setSpecularColor(color = MATERIAL_PROPERTIES_DEFAULT_VALUES[PROPERTIES.SPECULAR]) {
        const _setSpecularColor = material => {
            if (
                color &&
                typeof color === "object" &&
                "r" in color &&
                "g" in color &&
                "b" in color
            ) {
                if (!material[PROPERTIES.SPECULAR]) {
                    material[PROPERTIES.SPECULAR] = new Color();
                }
                material[PROPERTIES.SPECULAR].setRGB(color.r, color.g, color.b);
            } else {
                material[PROPERTIES.SPECULAR] = new Color(color);
            }
        };
        applyMaterialChange(this.getBody(), _setSpecularColor);
    }

    getSpecularColor() {
        return extractMaterialProperty(this.getBody(), PROPERTIES.SPECULAR);
    }

    setNormalScale(normalScale = MATERIAL_PROPERTIES_DEFAULT_VALUES[PROPERTIES.NORMAL_SCALE]) {
        const _setNormalScale = material => (material[PROPERTIES.NORMAL_SCALE] = normalScale);
        applyMaterialChange(this.getBody(), _setNormalScale);
    }

    getNormalScale() {
        return extractMaterialProperty(this.getBody(), PROPERTIES.NORMAL_SCALE);
    }

    setMetalness(value = MATERIAL_PROPERTIES_DEFAULT_VALUES[PROPERTIES.METALNESS]) {
        const numericValue = Number(value) || 0;
        const _setMetalness = material => (material[PROPERTIES.METALNESS] = numericValue);
        applyMaterialChange(this.getBody(), _setMetalness);
    }

    getMetalness() {
        return extractMaterialProperty(this.getBody(), PROPERTIES.METALNESS);
    }

    setRoughness(value = MATERIAL_PROPERTIES_DEFAULT_VALUES[PROPERTIES.ROUGHNESS]) {
        const numericValue = Number(value) || 0;
        const _setRoughness = material => (material[PROPERTIES.ROUGHNESS] = numericValue);
        applyMaterialChange(this.getBody(), _setRoughness);
    }

    getRoughness() {
        return extractMaterialProperty(this.getBody(), PROPERTIES.ROUGHNESS);
    }

    setEmissive(value = MATERIAL_PROPERTIES_DEFAULT_VALUES[PROPERTIES.EMISSIVE]) {
        const _setEmissive = material => {
            if (
                value &&
                typeof value === "object" &&
                "r" in value &&
                "g" in value &&
                "b" in value
            ) {
                if (!material[PROPERTIES.EMISSIVE]) {
                    material[PROPERTIES.EMISSIVE] = new Color();
                }
                material[PROPERTIES.EMISSIVE].setRGB(value.r, value.g, value.b);
            } else {
                material[PROPERTIES.EMISSIVE] = new Color(value);
            }
        };
        applyMaterialChange(this.getBody(), _setEmissive);
    }

    getEmissive() {
        return extractMaterialProperty(this.getBody(), PROPERTIES.EMISSIVE);
    }

    setEmissiveIntensity(
        value = MATERIAL_PROPERTIES_DEFAULT_VALUES[PROPERTIES.EMISSIVE_INTENSITY],
    ) {
        const numericValue = Number(value) || 0;
        const _setEmissiveIntensity = material =>
            (material[PROPERTIES.EMISSIVE_INTENSITY] = numericValue);
        applyMaterialChange(this.getBody(), _setEmissiveIntensity);
    }

    getEmissiveIntensity() {
        return extractMaterialProperty(this.getBody(), PROPERTIES.EMISSIVE_INTENSITY);
    }

    setLightMapIntensity(
        value = MATERIAL_PROPERTIES_DEFAULT_VALUES[PROPERTIES.LIGHT_MAP_INTENSITY],
    ) {
        const numericValue = Number(value) || 0;
        const _setLightMapIntensity = material =>
            (material[PROPERTIES.LIGHT_MAP_INTENSITY] = numericValue);
        applyMaterialChange(this.getBody(), _setLightMapIntensity);
    }

    getLightMapIntensity() {
        return extractMaterialProperty(this.getBody(), PROPERTIES.LIGHT_MAP_INTENSITY);
    }

    setAOMapIntensity(value = MATERIAL_PROPERTIES_DEFAULT_VALUES[PROPERTIES.AO_MAP_INTENSITY]) {
        const numericValue = Number(value) || 0;
        const _setAOMapIntensity = material =>
            (material[PROPERTIES.AO_MAP_INTENSITY] = numericValue);
        applyMaterialChange(this.getBody(), _setAOMapIntensity);
    }

    getAOMapIntensity() {
        return extractMaterialProperty(this.getBody(), PROPERTIES.AO_MAP_INTENSITY);
    }

    setAoMapIntensity(value = MATERIAL_PROPERTIES_DEFAULT_VALUES[PROPERTIES.AO_MAP_INTENSITY]) {
        const numericValue = Number(value) || 0;
        const _setAoMapIntensity = material =>
            (material[PROPERTIES.AO_MAP_INTENSITY] = numericValue);
        applyMaterialChange(this.getBody(), _setAoMapIntensity);
    }

    setEnvMapIntensity(value = MATERIAL_PROPERTIES_DEFAULT_VALUES[PROPERTIES.ENV_MAP_INTENSITY]) {
        const numericValue = Number(value) || 0;
        const _setEnvMapIntensity = material =>
            (material[PROPERTIES.ENV_MAP_INTENSITY] = numericValue);
        applyMaterialChange(this.getBody(), _setEnvMapIntensity);
    }

    getEnvMapIntensity() {
        return extractMaterialProperty(this.getBody(), PROPERTIES.ENV_MAP_INTENSITY);
    }

    setDisplacementScale(
        value = MATERIAL_PROPERTIES_DEFAULT_VALUES[PROPERTIES.DISPLACEMENT_SCALE],
    ) {
        const numericValue = Number(value) || 0;
        const _setDisplacementScale = material =>
            (material[PROPERTIES.DISPLACEMENT_SCALE] = numericValue);
        applyMaterialChange(this.getBody(), _setDisplacementScale);
    }

    getDisplacementScale() {
        return extractMaterialProperty(this.getBody(), PROPERTIES.DISPLACEMENT_SCALE);
    }

    setDisplacementBias(value = MATERIAL_PROPERTIES_DEFAULT_VALUES[PROPERTIES.DISPLACEMENT_BIAS]) {
        const numericValue = Number(value) || 0;
        const _setDisplacementBias = material =>
            (material[PROPERTIES.DISPLACEMENT_BIAS] = numericValue);
        applyMaterialChange(this.getBody(), _setDisplacementBias);
    }

    getDisplacementBias() {
        return extractMaterialProperty(this.getBody(), PROPERTIES.DISPLACEMENT_BIAS);
    }

    setBumpScale(value = MATERIAL_PROPERTIES_DEFAULT_VALUES[PROPERTIES.BUMP_SCALE]) {
        const numericValue = Number(value) || 0;
        const _setBumpScale = material => (material[PROPERTIES.BUMP_SCALE] = numericValue);
        applyMaterialChange(this.getBody(), _setBumpScale);
    }

    getBumpScale() {
        return extractMaterialProperty(this.getBody(), PROPERTIES.BUMP_SCALE);
    }

    setSide(side = MATERIAL_PROPERTIES_DEFAULT_VALUES[PROPERTIES.SIDE]) {
        const _setSide = material => (material[PROPERTIES.SIDE] = side);
        applyMaterialChange(this.getBody(), _setSide);
    }

    getSide() {
        return extractMaterialProperty(this.getBody(), PROPERTIES.SIDE);
    }

    recordTexture(id, type, options, assetPath) {
        // assetPath is the relative path like "textures/mytexture.png"
        this.textures.set(type, { id, options, assetPath });
    }

    setTextureMap = (textureId, options = {}) => {
        console.warn(DEPRECATIONS.ELEMENT_SET_TEXTURE_MAP);
        return this.setTexture(textureId, TEXTURES.MAP, options);
    };

    setTexture(textureId, textureType = TEXTURES.MAP, options = {}) {
        if (!isTextureMapAllowedForMaterial(this.getMaterialType(), textureType)) {
            console.log(
                ELEMENT_MATERIAL_NO_SUPPORT_FOR_TEXTURE,
                textureType,
                this.getMaterialType(),
            );
            return;
        }

        if (textureId) {
            const { repeat = { x: 1, y: 1 }, wrap = RepeatWrapping, assetPath } = options;
            const textureOptions = {
                repeat,
                wrap,
            };

            this.recordTexture(textureId, textureType, textureOptions, assetPath);

            const applyTextureTo = material => {
                const texture = Images.get(textureId);

                if (!texture) {
                    console.warn(`[Mage] Texture not found: ${textureId}`);
                    return;
                }

                texture.wrapS = textureOptions.wrap;
                texture.wrapT = textureOptions.wrap;
                texture.repeat.set(textureOptions.repeat.x, textureOptions.repeat.y);

                // Set sRGB encoding for color textures (map, emissiveMap, specularMap)
                // This is required for textures to display with correct colors
                if (
                    textureType === TEXTURES.MAP ||
                    textureType === TEXTURES.EMISSIVE ||
                    textureType === TEXTURES.SPECULAR
                ) {
                    texture.encoding = sRGBEncoding;
                }

                material[textureType] = texture;
                material.needsUpdate = true;
            };

            applyMaterialChange(this.getBody(), applyTextureTo);
        }
    }

    getTexture(textureType = TEXTURES.MAP) {
        return this.getBody().material[textureType];
    }

    getMaterials() {
        if (hasMaterial(this.getBody())) {
            return [this.getBody().material];
        }

        const materials = [];
        this.getBody().traverse(child => {
            if (hasMaterial(child)) {
                materials.push(child.material);
            }
        });

        return materials;
    }

    getMaterialType() {
        return this.materialType;
    }

    setMaterialType(materialType = MATERIALS.BASIC) {
        this.materialType = materialType;
    }

    setMaterialFromName(materialName, options = {}) {
        this.setMaterialType(materialName);
        const newMaterials = [];

        if (hasMaterial(this.getBody())) {
            return replaceMaterialByName(materialName, this.getBody(), options);
        } else {
            this.getBody().traverse(child => {
                if (hasMaterial(child)) {
                    newMaterials.push(replaceMaterialByName(materialName, child, options));
                }
            });

            return newMaterials;
        }
    }

    setOpacity(value = 1.0) {
        const opacity = clamp(value, 0, 1);
        this.opacity = opacity;

        const _setOpacity = material => {
            material.transparent = true;
            material.opacity = this.opacity;
        };

        applyMaterialChange(this.getBody(), _setOpacity);
    }

    getOpacity() {
        return extractMaterialProperty(this.getBody(), PROPERTIES.OPACITY);
    }

    setTransparent(flag = true) {
        const _setTransparent = material => (material.transparent = flag);
        applyMaterialChange(this.getBody(), _setTransparent);
    }

    isTransparent() {
        return extractMaterialProperty(this.getBody(), PROPERTIES.TRANSPARENT);
    }

    setVisible(flag = true) {
        const _setVisible = material => (material.visible = flag);
        applyMaterialChange(this.getBody(), _setVisible);
    }

    isVisible() {
        return extractMaterialProperty(this.getBody(), PROPERTIES.VISIBLE);
    }

    fadeTo(opacity = 1, time = 250, options = {}) {
        const onUpdate = value => !this.isDisposed() && this.setOpacity(value);
        return tweenTo(this.opacity, clamp(opacity, 0, 1), { ...options, time, onUpdate });
    }

    setWireframe(flag = true) {
        const _setWireframe = material => (material.wireframe = flag);
        applyMaterialChange(this.getBody(), _setWireframe);
    }

    setWireframeLineWidth(width = 1) {
        const numericWidth = Number(width) || 1;
        const _setWireframeLineWidth = material => {
            material.wireframeLinewidth = numericWidth;
        };

        applyMaterialChange(this.getBody(), _setWireframeLineWidth);
    }

    lookAt = ({ x = 0, y = 0, z = 0 } = {}) => {
        const body = this.getBody();
        if (body.lookAt) {
            body.lookAt(x, y, z);
        }
    };

    setPosition(where) {
        super.setPosition(where);
        if (Physics.hasElement(this)) {
            Physics.setElementPosition(this, this.getPosition());
        }
    }

    setRotation(how) {
        super.setRotation(how);
        if (Physics.hasElement(this)) {
            const quaternion = this.getQuaternion();
            Physics.setElementQuaternion(this, {
                x: quaternion.x,
                y: quaternion.y,
                z: quaternion.z,
                w: quaternion.w,
            });
        }
    }

    setQuaternion({ x, y, z, w }) {
        super.setQuaternion({ x, y, z, w });
        if (Physics.hasElement(this)) {
            Physics.setElementQuaternion(this, { x, y, z, w });
        }
    }

    handlePhysicsUpdate = ({ position, quaternion, ...data }) => {
        // Call super directly to update Three.js without routing back to physics
        super.setPosition(position);
        super.setQuaternion(quaternion);
        this.setPhysicsState(data);
    };

    equals = object => this.name === object.name && this.body.uuid === object.body.uuid;

    traverse = cb => {
        this.body.traverse(cb);
    };

    disposeBody() {
        super.disposeBody();

        if (hasMaterial(this.getBody())) {
            disposeTextures(this.getBody());
            disposeMaterial(this.getBody());
            disposeGeometry(this.getBody());
        }

        this.getBody().traverse(child => {
            if (hasMaterial(child)) {
                disposeTextures(child);
                disposeMaterial(child);
                disposeGeometry(child);
            }
        });
    }

    update(dt) {
        super.update(dt);

        if (this.hasRayColliders() && this.areCollisionsEnabled()) {
            this.updateRayColliders();
            this.checkCollisions();
        }

        if (this.hasAnimationHandler() && this.animationHandler.isPlaying) {
            this.animationHandler.update(dt);
        }
    }

    dispose() {
        super.dispose();

        if (this.hasAnimationHandler()) {
            this.removeAnimationHandlerListeners();
        }

        Physics.disposeElement(this);
    }

    /**
     * Serialize only the material properties that the Importer actually uses.
     * This avoids bloating the JSON with full Three.js material data.
     */
    serializeMaterialProperties() {
        const materialType = this.getMaterialType();
        // Use allowed properties for known material types, or fallback to STANDARD properties
        // which has the most comprehensive set
        const allowedProperties =
            MATERIAL_PROPERTIES_MAP[materialType] ||
            MATERIAL_PROPERTIES_MAP[MATERIALS.STANDARD] ||
            [];
        const materials = this.getMaterials();

        if (!materials.length) return [];

        return materials.map(material => {
            const serialized = {
                // Always include the material type for the inspector
                type: material.type,
            };
            for (const prop of allowedProperties) {
                if (material[prop] !== undefined) {
                    const value = material[prop];
                    // Serialize Color objects to plain objects
                    if (value && value.isColor) {
                        serialized[prop] = { r: value.r, g: value.g, b: value.b };
                    } else if (value && value.isVector2) {
                        serialized[prop] = { x: value.x, y: value.y };
                    } else {
                        serialized[prop] = value;
                    }
                }
            }
            return serialized;
        });
    }

    toJSON(parseJSON = false) {
        if (this.isSerializable()) {
            const color = this.getColor();
            return {
                ...super.toJSON(parseJSON),
                // Physics options (state is not used by Importer, only options)
                physics: {
                    options: this.getPhysicsOptions(),
                    computedSize: this.getComputedColliderSize(),
                },
                // Textures with serialized map
                textures: serializeMap(this.textures),
                // Material type name (e.g., "STANDARD", "BASIC")
                materialType: this.getMaterialType(),
                // Lightweight material properties (type + allowed properties only)
                materials: this.serializeMaterialProperties(),
                // Opacity
                opacity: this.opacity,
                // Color (for inspector display)
                color: parseJSON ? { r: color?.r, g: color?.g, b: color?.b } : color,
                // Animation names (for inspector display - actual animations loaded from model file)
                animations: this.getAvailableAnimations(),
            };
        }
    }
}
