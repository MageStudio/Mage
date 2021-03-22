import {
    Mesh,
    RepeatWrapping,
    Raycaster,
    Color,
    Vector3
} from 'three';
import { Entity, ENTITY_TYPES, Line, Box } from './index';

import {
    ELEMENT_NOT_SET,
    ANIMATION_HANDLER_NOT_FOUND,
    ELEMENT_SET_COLOR_MISSING_COLOR,
    ELEMENT_NAME_NOT_PROVIDED,
    ELEMENT_NO_GEOMETRY_SET,
    ELEMENT_NO_MATERIAL_CANT_SET_TEXTURE
} from '../lib/messages';
import Images from '../images/Images';
import AnimationHandler from './animations/AnimationHandler';
import Config from '../core/config';
import Scene from '../core/Scene';
import { COLLISION_EVENT, ORIGIN } from '../lib/constants';
import Universe from '../core/Universe';
import Physics from '../physics';
import { PHYSICS_COLLIDER_TYPES } from '../physics/constants';

import {
    getBoxDescriptionForElement,
    extractBoundingBox,
    extractBiggestBoundingBox,
    extractBoundingSphere,
    extractBiggestBoundingSphere,
    mapColliderTypeToDescription
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
import { mapColliderTypeToHitbox } from '../physics/hitbox';

const COLLIDER_TAG = 'collider';
const COLLIDER_COLOR = 0xff0000;

const DEFAULT_COLLIDER_OFFSET = { x: 0, y: 0, z: 0};

const DEFAULT_ANGULAR_VELOCITY = { x: 0, y: 0, z: 0 };
const DEFAULT_LINEAR_VELOCITY = { x: 0, y: 0, z: 0 };

export default class Element extends Entity {

    constructor(geometry, material, options = {}) {
        super(options);

        const {
            name = `default_${Math.random()}`
        } = options;

        this.texture = undefined;
        this.options = {
            ...options,
            name
        };;

        this.setBody({ geometry, material });

        this.colliders = [];
        this.collisionsEnabled = true;
        this.children = [];

        this.animationHandler = undefined;

        this.setEntityType(ENTITY_TYPES.MESH);
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

    setArmature(armature) {
        this.armature = armature;

        Scene.add(this.armature, null, false);
    }

    addAnimationHandler(animations) {
        this.animationHandler = new AnimationHandler(this.getBody(), animations);
    }

    hasAnimationHandler() {
        return !!this.animationHandler;
    }

    playAnimation(id, options) {
        if (this.hasAnimationHandler()) {
            this.animationHandler.playAnimation(id, options);
        } else {
            console.warn(ANIMATION_HANDLER_NOT_FOUND);
        }
    }

    getAvailableAnimations() {
        if (this.hasAnimationHandler()) {
            return this.animationHandler.getAvailableAnimations();
        } else {
            console.warn(ANIMATION_HANDLER_NOT_FOUND);
        }

        return [];
    }

    enablePhysics(options = {}) {
        const {
            colliderType = PHYSICS_COLLIDER_TYPES.BOX
        } = options;

        if (Config.physics().enabled) {
            if (this.isModel()) {
                Physics.addModel(this, options);
            } else {
                const description = {
                    ...mapColliderTypeToDescription(colliderType)(this),
                    ...options
                };

                Physics.add(this, description);
            }

            if (options.debug) {
                this.addHitBox(colliderType);
            }
        }
    }

    addHitBox(colliderType = PHYSICS_COLLIDER_TYPES.BOX) {
        const getHitbox = mapColliderTypeToHitbox(colliderType)

        this.add(getHitbox(this));
        //box.setPosition(ORIGIN);
    }

    applyForce(force) {
        if (Config.physics().enabled) {
            Physics.applyForce(this.uuid(), force);
        }
    }

    update(dt) {
        super.update(dt);
        
        if (this.hasRayColliders() && this.areCollisionsEnabled()) {
            this.updateRayColliders();
            this.checkCollisions();
        }

        if (this.hasAnimationHandler()) {
            this.animationHandler.update(dt);
        }
    }

    add(element) {
        if (this.hasBody()) {
            const _add = (body) => {
                this.children.push(body);
                this.body.add(body.body);
            };

            if (Array.isArray(element)) {
                element.forEach(_add);
            } else {
                _add(element);
            }
        }
    }

    remove(element) {
        if (this.hasBody()) {
            this.body.remove(element.body);
            const index = this.children.findIndex(m => m.equals(element));

            this.children.splice(index, 1);
        }
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
        if (debug) {
            const points = this.getPointsFromRayCollider(ray, position);
            helper = new Line(points);
            helper.addTag(COLLIDER_TAG);
            helper.setColor(COLLIDER_COLOR);
            helper.setThickness(4);
        }
        
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
            if (hasMaterial(this.body)) {
                this.body.material.color = new Color(color);
            } else {
                this.body.traverse(child => {
                    if (hasMaterial(child)) {
                        child.material.color = new Color(color);
                    }
                });
            }
        } else {
            console.warn(ELEMENT_SET_COLOR_MISSING_COLOR);
        }
    }

    setTextureMap(textureId, options = {}) {
        if (textureId && hasMaterial(this.body)) {
            const {
                repeat = { x: 1, y: 1 },
                wrap = RepeatWrapping
            } = options;
            const texture = Images.get(textureId);

            this.texture = textureId;

            texture.wrapS = wrap;
            texture.wrapT = wrap;
            texture.repeat.set(repeat.x, repeat.y);

            this.body.material.map = texture;
        } else {
            console.warn(ELEMENT_NO_MATERIAL_CANT_SET_TEXTURE);
        }
    }

    setMaterialFromName(materialName, options = {}) {
        if (hasMaterial(this.getBody())) {
            changeMaterialByName(materialName, this.getBody(), options);
        } else {
            this.body.traverse(child => {
                if (hasMaterial(child)) {
                    changeMaterialByName(materialName, child, options);
                }
            });
        }
    }

    setOpacity(value = 1.0) {
        const opacity = clamp(value, 0, 1);

        if (hasMaterial(this.getBody())) {
            this.body.material.transparent = true;
            this.body.material.opacity = opacity;
        } else {
            this.body.traverse(child => {
                if (hasMaterial(child)) {
                    child.material.transparent = true;
                    child.material.opacity = opacity;
                }
            })
        }
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

    handlePhysicsUpdate = (position, quaternion) => {
        this.setPosition(position);
        this.setQuaternion(quaternion);
    }

    equals = (object) => (
        this.name === object.name &&
        this.body.uuid === object.body.uuid
    );

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

    dispose() {
        super.dispose();

        if (this.hasBody()) {
            Scene.remove(this.getBody());
            this.disposeBody();
        }

        Physics.disposeElement(this);
    }

    toJSON() {
        if (this.serializable) {
            return {
                ...super.toJSON(),
                body: this.body.toJSON(),
                scripts: this.mapScriptsToJSON(),
                texture: this.texture,
                ...this.options
            }
        }

    }
}
