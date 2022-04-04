import {
    Mesh,
    RepeatWrapping,
    Raycaster,
    Color,
    Vector3
} from 'three';
import Between from 'between.js';

// import Line from './base/Line';
import Entity from "../entities/Entity";
import { ENTITY_TYPES, ENTITY_EVENTS } from '../entities/constants';

import {
    ELEMENT_NOT_SET,
    ANIMATION_HANDLER_NOT_FOUND,
    ELEMENT_SET_COLOR_MISSING_COLOR,
    ELEMENT_NAME_NOT_PROVIDED,
    ELEMENT_MATERIAL_NO_SUPPORT_FOR_TEXTURE,
    DEPRECATIONS
} from '../lib/messages';
import Images from '../images/Images';
import AnimationHandler from './animations/AnimationHandler';
import Config from '../core/config';
import Scene from '../core/Scene';
import { COLLISION_EVENT, MATERIALS, TEXTURES } from '../lib/constants';
import Universe from '../core/Universe';
import Physics from '../physics';
import { DEFAULT_ANGULAR_VELOCITY, DEFAULT_LINEAR_VELOCITY } from '../physics/constants';

import {
    extractBoundingBox,
    extractBiggestBoundingBox,
    extractBoundingSphere,
    extractBiggestBoundingSphere,
} from '../physics/utils';

import { clamp } from '../lib/math';
import {
    changeMaterialByName,
    hasMaterial,
    hasGeometry,
    disposeTextures,
    disposeMaterial,
    disposeGeometry,
    setUpLightsAndShadows
} from '../lib/meshUtils';
import { isTextureMapAllowedForMaterial } from '../materials/helpers';

const COLLIDER_TAG = 'collider';
const COLLIDER_COLOR = 0xff0000;

const DEFAULT_COLLIDER_OFFSET = { x: 0, y: 0, z: 0};

const DEFAULT_PHYSICS_OPTIONS = {
    applyPhysicsUpdate: true
};

export default class Element extends Entity {

    constructor(options = {}) {
        super(options);

        const {
            name = `default_${Math.random()}`,
            geometry,
            material,
            body
        } = options;

        this.textures = {};
        this.opacity = 1;
        this.options = {
            ...options,
            name
        };

        this.physicsOptions = DEFAULT_PHYSICS_OPTIONS;
        this.physicsState = {};

        this.setBody({ geometry, material, body });

        this.colliders = [];
        this.collisionsEnabled = true;

        this.animationHandler = undefined;
        this.animations = [];

        this.setMaterialType();
        this.setEntityType(ENTITY_TYPES.MESH);
    }

    getMaterialType() {
        return this.materialType;
    }

    setMaterialType(materialType = MATERIALS.BASIC) {
        this.materialType = materialType;
    }

    addTag(tag) {
        super.addTag(tag);

        const existingTags = this.getBody().userData.tags || [];
        this.getBody().userData.tags = [ ...existingTags, tag ];
    }

    getBodyByName = (name) => {
        if (name) {
            if (this.hasBody()) {
                return this.body.getObjectByName(name);
            } else {
                let body;
                this.body.traverse(element => {
                    if (element.name === name) {
                        body = element;
                    };
                });

                if (body) {
                    return body;
                }

                console.warn(ELEMENT_NOT_SET);
            }
        } else {
            console.warn(ELEMENT_NAME_NOT_PROVIDED);
        }
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
        const {
            addUniverse = true,
        } = this.options;

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

    setArmature(armature) {
        this.armature = armature;

        Scene.add(this.armature, null, false);
    }

    addAnimationHandler(animations = []) {
        this.animations = animations;
        this.animationHandler = new AnimationHandler(this.getBody(), animations);
        this.addAnimationHandlerListeners();
    }

    handleAnimationHandlerEvents = (e) => {
        this.dispatchEvent(e);
    }

    addAnimationHandlerListeners() {
        this.animationHandler.addEventListener(ENTITY_EVENTS.ANIMATION.LOOP, this.handleAnimationHandlerEvents);
        this.animationHandler.addEventListener(ENTITY_EVENTS.ANIMATION.FINISHED, this.handleAnimationHandlerEvents);
    }

    removeAnimationHandlerListeners() {
        this.animationHandler.removeEventListener(ENTITY_EVENTS.ANIMATION.LOOP, this.handleAnimationHandlerEvents);
        this.animationHandler.removeEventListener(ENTITY_EVENTS.ANIMATION.FINISHED, this.handleAnimationHandlerEvents);
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

    setPhysicsOptions({ applyPhysicsUpdate = true, ...rest } = DEFAULT_PHYSICS_OPTIONS) {
        const parsedOptions = {
            applyPhysicsUpdate,
            ...rest
        };
        this.physicsOptions = parsedOptions;
    }

    getPhysicsOptions(option) {
        return option ? this.physicsOptions[option] : this.physicsOptions;
    }

    setPhysicsState({ dt, event, ...data } = {}) {
        const physicsState = {
            ...this.physicsState,
            ...data
        };

        this.physicsState = physicsState;
    }

    getPhysicsState(key) {
        return key ? this.physicsState[key] : this.physicsState;
    }

    enablePhysics(options = {}) {
        const { mass }= options;
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

    enableCollisions = () => this.collisionsEnabled = true;
    disableCollisions = () => this.collisionsEnabled = false;

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
            offset: parsedOffset
        };
    };

    setColliders = (vectors = [], options = []) => {
        const colliders = vectors.map((vector, i) => {
            const { near = 0, far = 10, debug = false, offset = DEFAULT_COLLIDER_OFFSET } = options[i];
            return this.createRayColliderFromVector(vector, near, far, offset, debug)
        });

        this.colliders = [
            ...this.colliders,
            ...colliders
        ];
    };

    checkRayCollider = ({ ray, type }) => {
        const mapCollision = (collision) => {
            const { distance, object } = collision;
            const { uuid } = object;

            return {
                distance,
                body: Universe.getByUUID(uuid)
            };
        };

        const collisions = ray
            .intersectObjects(Scene.scene.children)
            .filter(collision => collision.object.uuid !== this.uuid())
            .map(mapCollision)
            .filter(({ body }) => !body.hasTag(COLLIDER_TAG));

        return {
            collisions,
            type
        };
    };

    checkCollisions = () => {
        const collisions = [];
        this.colliders.forEach((collider) => {
            const collision = this.checkRayCollider(collider);

            if (collision) {
                collisions.push(collision);
            }
        });

        if (collisions.length) {
            this.dispatchEvent({
                type: COLLISION_EVENT,
                collisions
            });
        }

        return collisions;
    };

    isCollidingOnDirection(direction) {
        const collider = this.colliders.filter(({ type }) => type === direction)[0];
        const emptyCollision = {
            collisions: [],
            type: direction
        };

        return collider ?
            this.checkRayCollider(collider) :
            emptyCollision;
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

    setColor(color) {
        if (color) {
            if (hasMaterial(this.getBody())) {
                this.body.material.color = new Color(color);
            } else {
                this.body.traverse(child => {
                    if (hasMaterial(child) && !this.isParentOf(child)) {
                        child.material.color = new Color(color);
                    }
                });
            }
        } else {
            console.warn(ELEMENT_SET_COLOR_MISSING_COLOR);
        }
    }

    getColor() {
        if (hasMaterial(this.getBody())) {
            return this.body.material.color;
        } else {
            let found;
            this.body.traverse(child => {
                if (hasMaterial(child) && !found) {
                    found = child.material.color;
                }
            });
            return found;
        }
    }

    recordTexture(textureId, textureType) {
        this.textures[textureType] = textureId;
    }

    setTextureMap = (textureId, options = {}) => {
        console.warn(DEPRECATIONS.ELEMENT_SET_TEXTURE_MAP);
        return this.setTexture(textureId, TEXTURES.MAP, options);
    }

    setTexture(textureId, textureType = TEXTURES.MAP, options = {}) {
        if (!isTextureMapAllowedForMaterial(this.getMaterialType(), textureType)) {
            console.log(ELEMENT_MATERIAL_NO_SUPPORT_FOR_TEXTURE, textureType, this.getMaterialType());
            return;
        }

        if (textureId) {
            const {
                repeat = { x: 1, y: 1 },
                wrap = RepeatWrapping
            } = options;

            this.recordTexture(textureId, textureType);

            const applyTextureTo = (element) => {
                const texture = Images.get(textureId);

                texture.wrapS = wrap;
                texture.wrapT = wrap;
                texture.repeat.set(repeat.x, repeat.y);

                element.material[textureType] = texture;
            }

            if (hasMaterial(this.getBody())) {
                applyTextureTo(this.getBody());
            } else {
                this.getBody().traverse(child => {
                    if (hasMaterial(child)) {
                        applyTextureTo(child);
                    }
                })
            }
        }
    }

    setMaterialFromName(materialName, options = {}) {
        this.setMaterialType(materialName);

        if (hasMaterial(this.getBody())) {
            changeMaterialByName(materialName, this.getBody(), options);
        } else {
            this.getBody().traverse(child => {
                if (hasMaterial(child)) {
                    changeMaterialByName(materialName, child, options);
                }
            });
        }
    }

    setOpacity(value = 1.0) {
        const opacity = clamp(value, 0, 1);
        this.opacity = opacity;

        if (hasMaterial(this.getBody())) {
            this.body.material.transparent = true;
            this.body.material.opacity = opacity;
        } else {
            this.body.traverse(child => {
                if (hasMaterial(child) && !this.isParentOf(child)) {
                    child.material.transparent = true;
                    child.material.opacity = opacity;
                }
            })
        }
    }

    fadeTo(opacity, time) {
        return new Promise((resolve) => 
            new Between(this.opacity, opacity)
                .time(time)
                .on('update', value => this.setOpacity(value))
                .on('complete', resolve)
        );
    }

    setWireframe(flag = true) {
        if (hasMaterial(this.getBody())) {
            this.body.material.wireframe = flag;
        } else {
            this.body.traverse(child => {
                if (hasMaterial(child)) {
                    child.material.wireframe = flag;
                }
            })
        }
    }

    setWireframeLineWidth(width = 1) {
        if (hasMaterial(this.getBody())) {
            this.body.material.wireframeLinewidth = width;
        } else {
            this.body.traverse(child => {
                if (hasMaterial(child)) {
                    child.material.wireframeLinewidth = width;
                }
            })
        }
    }

    lookAt = ({ x = 0, y = 0, z = 0 } = {}) => {
        const body = this.getBody();
        if (body.lookAt) {
            body.lookAt(x, y, z);
        }
    }

    handlePhysicsUpdate = ({ position, quaternion, ...data }) => {
        this.setPosition(position);
        this.setQuaternion(quaternion);
        this.setPhysicsState(data);
    }

    equals = (object) => (
        this.name === object.name &&
        this.body.uuid === object.body.uuid
    );

    traverse = (cb) => {
        this.body.traverse(cb);
    }

    disposeBody() {
        if (hasMaterial(this.body)) {
            disposeTextures(this.getBody());
            disposeMaterial(this.getBody());
            disposeGeometry(this.getBody());
        } else {
            this.body.traverse(child => {
                if (hasMaterial(child)) {
                    disposeTextures(child);
                    disposeMaterial(child);
                    disposeGeometry(child);
                }
            });
        }
    }

    update(dt) {
        super.update(dt);
        
        if (this.hasRayColliders() && this.areCollisionsEnabled()) {
            this.updateRayColliders();
            this.checkCollisions();
        }

        if (this.hasAnimationHandler() && this.animationHandler.isPlayingAnimation) {
            this.animationHandler.update(dt);
        }
    }

    dispose() {
        super.dispose();

        if (this.hasBody()) {
            Scene.remove(this.getBody());
            this.disposeBody();
        }
        if (this.hasAnimationHandler()) {
            this.removeAnimationHandlerListeners();
        }

        Physics.disposeElement(this);
    }

    toJSON() {
        if (this.serializable) {
            return {
                ...super.toJSON(),
                body: this.body.toJSON(),
                scripts: this.mapScriptsToJSON(),
                textures: this.textures,
                ...this.options
            }
        }

    }
}
