import { Mesh, RepeatWrapping, Raycaster, Color, Vector3 } from "three";

import Entity from "../entities/Entity";
import { ENTITY_TYPES, ENTITY_EVENTS } from "../entities/constants";

import {
    ELEMENT_NOT_SET,
    ANIMATION_HANDLER_NOT_FOUND,
    ELEMENT_SET_COLOR_MISSING_COLOR,
    ELEMENT_MATERIAL_NO_SUPPORT_FOR_TEXTURE,
    DEPRECATIONS,
    ELEMENT_SET_FOG_MISSING_MISSING_VALUE,
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
    PROPERTIES,
    TEXTURES,
} from "../lib/constants";
import Universe from "../core/Universe";
import Physics from "../physics";
import { DEFAULT_ANGULAR_VELOCITY, DEFAULT_LINEAR_VELOCITY } from "../physics/constants";

import {
    extractBoundingBox,
    extractBiggestBoundingBox,
    extractBoundingSphere,
    extractBiggestBoundingSphere,
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
    serializeColor,
    extractMaterialProperty,
    serialiseMaterial,
} from "../lib/meshUtils";
import { isTextureMapAllowedForMaterial } from "../materials/helpers";
import { generateRandomName } from "../lib/uuid";
import { tweenTo } from "../lib/easing";
import { populateMap, serializeMap } from "../lib/map";

const COLLIDER_TAG = "collider";
const DEFAULT_COLLIDER_OFFSET = { x: 0, y: 0, z: 0 };
const DEFAULT_PHYSICS_OPTIONS = {
    applyPhysicsUpdate: true,
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

    addToScene() {
        const { addUniverse = true } = this.options;

        if (this.hasBody()) {
            Scene.add(this.getBody(), this, addUniverse);
        } else {
            console.warn(ELEMENT_NOT_SET);
        }
    }

    setName(name, { replace = false } = {}) {
        super.setName(name);

        if (this.hasBody()) {
            if (replace) this.dispose();

            this.body.name = name;
            Universe.replaceUUIDToElementNameReference(this.uuid(), name);

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

    stopAnimation() {
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

    setPhysicsState({ dt, event, ...data } = {}) {
        populateMap(this.physicsState, data);
    }

    getPhysicsState(key) {
        return key ? this.physicsState.get(key) : this.physicsState;
    }

    enablePhysics(options = {}) {
        const { mass } = options;
        this.setPhysicsOptions(options);

        if (Config.physics().enabled) {
            if (this.isModel() && mass === 0) {
                Physics.addModel(this, options);
            } else {
                Physics.add(this, options);
            }
        }
    }

    getAngularVelocity() {
        return this.angularVelocity || DEFAULT_ANGULAR_VELOCITY;
    }

    setAngularVelocity(velocity) {
        this.angularVelocity = velocity;
        Physics.updateAngularVelocity(this.uuid(), velocity);
    }

    getLinearVelocity() {
        return this.linearVelocity || DEFAULT_LINEAR_VELOCITY;
    }

    setLinearVelocity(velocity) {
        this.linearVelocity = velocity;
        Physics.updateLinearVelocity(this.uuid(), velocity);
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
    createRayColliderFromVector = ({ type, vector }, near, far, offset, debug) => {
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
        const { x = 0, y = 0, z = 0 } = rotation;

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
        const _setColor = material => (material.color = new Color(color));
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
        const _setReflectivity = material => (material[PROPERTIES.REFLECTIVITY] = value);
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
        const _setRefractionRatio = material => (material[PROPERTIES.REFRACTION_RATIO] = value);
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
        const _setShininess = material => (material[PROPERTIES.SHININESS] = value);
        applyMaterialChange(this.getBody(), _setShininess);
    }

    getShininess() {
        return extractMaterialProperty(this.getBody(), PROPERTIES.SHININESS);
    }

    setSpecularColor(color = MATERIAL_PROPERTIES_DEFAULT_VALUES[PROPERTIES.SPECULAR]) {
        const _setSpecularColor = material => (material[PROPERTIES.SPECULAR] = new Color(color));
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
        const _setMetalness = material => (material[PROPERTIES.METALNESS] = value);
        applyMaterialChange(this.getBody(), _setMetalness);
    }

    getMetalness() {
        return extractMaterialProperty(this.getBody(), PROPERTIES.METALNESS);
    }

    setRoughness(value = MATERIAL_PROPERTIES_DEFAULT_VALUES[PROPERTIES.ROUGHNESS]) {
        const _setRoughness = material => (material[PROPERTIES.ROUGHNESS] = value);
        applyMaterialChange(this.getBody(), _setRoughness);
    }

    getRoughness() {
        return extractMaterialProperty(this.getBody(), PROPERTIES.ROUGHNESS);
    }

    setEmissive(value = MATERIAL_PROPERTIES_DEFAULT_VALUES[PROPERTIES.EMISSIVE]) {
        const _setEmissive = material => (material[PROPERTIES.EMISSIVE] = new Color(value));
        applyMaterialChange(this.getBody(), _setEmissive);
    }

    getEmissive() {
        return extractMaterialProperty(this.getBody(), PROPERTIES.EMISSIVE);
    }

    setEmissiveIntensity(
        value = MATERIAL_PROPERTIES_DEFAULT_VALUES[PROPERTIES.EMISSIVE_INTENSITY],
    ) {
        const _setEmissiveIntensity = material => (material[PROPERTIES.EMISSIVE_INTENSITY] = value);
        applyMaterialChange(this.getBody(), _setEmissiveIntensity);
    }

    getEmissiveIntensity() {
        return extractMaterialProperty(this.getBody(), PROPERTIES.EMISSIVE_INTENSITY);
    }

    setLightMapIntensity(
        value = MATERIAL_PROPERTIES_DEFAULT_VALUES[PROPERTIES.LIGHT_MAP_INTENSITY],
    ) {
        const _setLightMapIntensity = material =>
            (material[PROPERTIES.LIGHT_MAP_INTENSITY] = value);
        applyMaterialChange(this.getBody(), _setLightMapIntensity);
    }

    getLightMapIntensity() {
        return extractMaterialProperty(this.getBody(), PROPERTIES.LIGHT_MAP_INTENSITY);
    }

    setAOMapIntensity(value = MATERIAL_PROPERTIES_DEFAULT_VALUES[PROPERTIES.AO_MAP_INTENSITY]) {
        const _setAOMapIntensity = material => (material[PROPERTIES.AO_MAP_INTENSITY] = value);
        applyMaterialChange(this.getBody(), _setAOMapIntensity);
    }

    getAOMapIntensity() {
        return extractMaterialProperty(this.getBody(), PROPERTIES.AO_MAP_INTENSITY);
    }

    setEnvMapIntensity(value = MATERIAL_PROPERTIES_DEFAULT_VALUES[PROPERTIES.ENV_MAP_INTENSITY]) {
        const _setEnvMapIntensity = material => (material[PROPERTIES.ENV_MAP_INTENSITY] = value);
        applyMaterialChange(this.getBody(), _setEnvMapIntensity);
    }

    getEnvMapIntensity() {
        return extractMaterialProperty(this.getBody(), PROPERTIES.ENV_MAP_INTENSITY);
    }

    setDisplacementScale(
        value = MATERIAL_PROPERTIES_DEFAULT_VALUES[PROPERTIES.DISPLACEMENT_SCALE],
    ) {
        const _setDisplacementScale = material => (material[PROPERTIES.DISPLACEMENT_SCALE] = value);
        applyMaterialChange(this.getBody(), _setDisplacementScale);
    }

    getDisplacementScale() {
        return extractMaterialProperty(this.getBody(), PROPERTIES.DISPLACEMENT_SCALE);
    }

    setDisplacementBias(value = MATERIAL_PROPERTIES_DEFAULT_VALUES[PROPERTIES.DISPLACEMENT_BIAS]) {
        const _setDisplacementBias = material => (material[PROPERTIES.DISPLACEMENT_BIAS] = value);
        applyMaterialChange(this.getBody(), _setDisplacementBias);
    }

    getDisplacementBias() {
        return extractMaterialProperty(this.getBody(), PROPERTIES.DISPLACEMENT_BIAS);
    }

    setBumpScale(value = MATERIAL_PROPERTIES_DEFAULT_VALUES[PROPERTIES.BUMP_SCALE]) {
        const _setBumpScale = material => (material[PROPERTIES.BUMP_SCALE] = value);
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

    recordTexture(id, type, options) {
        this.textures.set(type, { id, options });
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
            const { repeat = { x: 1, y: 1 }, wrap = RepeatWrapping } = options;
            const textureOptions = {
                repeat,
                wrap,
            };

            this.recordTexture(textureId, textureType, textureOptions);

            const applyTextureTo = material => {
                const texture = Images.get(textureId);

                texture.wrapS = textureOptions.wrap;
                texture.wrapT = textureOptions.wrap;
                texture.repeat.set(textureOptions.repeat.x, textureOptions.repeat.y);

                material[textureType] = texture;
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
        const _setWireframeLineWidth = material => {
            material.wireframeLinewidth = width;
        };

        applyMaterialChange(this.getBody(), _setWireframeLineWidth);
    }

    lookAt = ({ x = 0, y = 0, z = 0 } = {}) => {
        const body = this.getBody();
        if (body.lookAt) {
            body.lookAt(x, y, z);
        }
    };

    handlePhysicsUpdate = ({ position, quaternion, ...data }) => {
        this.setPosition(position);
        this.setQuaternion(quaternion);
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

    toJSON(parseJSON = false) {
        if (this.isSerializable()) {
            const color = this.getColor();
            return {
                ...super.toJSON(parseJSON),
                physics: {
                    state: serializeMap(this.getPhysicsState()),
                    options: this.getPhysicsOptions(),
                },
                // body: this.body.toJSON(),
                textures: serializeMap(this.textures),
                materialType: this.getMaterialType(),
                materials: this.getMaterials().map(serialiseMaterial),
                // no need to have geometry, for basic entities we can build from the type
                // models have a reference to the model itself
                opacity: this.opacity,
                color: parseJSON ? serializeColor(color) : color,
            };
        }
    }
}
