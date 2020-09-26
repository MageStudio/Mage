import {
    Mesh,
    RepeatWrapping,
    Raycaster,
    Color,
    Vector3,
    Vector2
} from 'three';
import { Entity, ENTITY_TYPES, Line, Box } from './index';

import {
    MESH_NOT_SET,
    ANIMATION_HANDLER_NOT_FOUND,
    MESH_SET_COLOR_MISSING_COLOR,
    MESH_NAME_NOT_PROVIDED,
    MESH_NO_GEOMETRY_SET,
    MESH_NO_MATERIAL_CANT_SET_TEXTURE
} from '../lib/messages';
import Images from '../images/Images';
import AnimationHandler from './animations/AnimationHandler';
import Config from '../core/config';
import Scene from '../core/Scene';
import { COLLISION_EVENT } from '../lib/constants';
import Universe from '../core/Universe';
import Physics from '../physics/physics';
import { getDescriptionForMesh } from '../physics/utils';

import {
    changeMaterialByName,
    hasMaterial,
    isLine,
    hasGeometry
} from '../lib/meshUtils';

const BOUNDING_BOX_COLOR = 0xf368e0;
const BOUNDING_BOX_INCREASE = .5;

const COLLIDER_TAG = 'collider';
const COLLIDER_COLOR = 0xff0000;

const DEFAULT_COLLIDER_OFFSET = { x: 0, y: 0, z: 0};

export default class Element extends Entity {

    constructor(geometry, material, options = {}) {
        super(options);

        const {
            name = `default_${Math.random()}`
        } = options;

        this.texture = undefined;
        this.options = {
            name,
            ...options
        };;

        this.setMesh({ geometry, material });

        this.colliders = [];
        this.collisionsEnabled = true;
        this.children = [];

        this.animationHandler = undefined;

        this.setEntityType(ENTITY_TYPES.MESH);
    }

    addTag(tag) {
        super.addTag(tag);

        const existingTags = this.getMesh().userData.tags || [];
        this.getMesh().userData.tags = [ ...existingTags, tag ];
    }

    hasMesh() {
        return !!this.mesh;
    }

    getMesh() {
        return this.mesh;
    }
    
    getMeshByName = (name) => {
        if (name) {
            if (this.hasMesh()) {
                return this.mesh.getObjectByName(name);
            } else {
                console.warn(MESH_NOT_SET);
            }
        } else {
            console.warn(MESH_NAME_NOT_PROVIDED);
        }
    }

    setMesh({ mesh, geometry, material }) {
        if (mesh) {
            this.mesh = mesh;
        } else if (geometry && material) {
            this.geometry = geometry;
            this.material = material;
            this.mesh = new Mesh(this.geometry, this.material);
        }

        if (this.hasMesh()) {
            this.postMeshCreation();
            this.addToScene();
        }
    }

    evaluateBoundingBox() {
        if (hasGeometry(this.getMesh())) {
            this.mesh.geometry.computeBoundingBox();
            this.boundingBox = this.mesh.geometry.boundingBox;
        } else {
            // this.mesh.traverse(child => {
            //     if (child.geometry) {
            //         child.geometry.computeBoundingBox();
            //         this.boundingBox = child.geometry.boundingBox;
            //         return;
            //     }
            // })
            console.warn(MESH_NO_GEOMETRY_SET);
        }
    }

    postMeshCreation() {
        const { name } = this.options;

        this.evaluateBoundingBox();
        this.setName(name);

        this.mesh.castShadow = Config.lights().shadows;
        this.mesh.receiveShadow = Config.lights().shadows;
    }

    addToScene() {
        const {
            addUniverse = true,
        } = this.options;

        if (this.hasMesh()) {
            Scene.add(this.getMesh(), this, addUniverse);
        } else {
            console.warn(MESH_NOT_SET);
        }
    }

    setName(name, { replace = false } = {}) {
        super.setName(name);

        if (this.hasMesh()) {
            if (replace) this.dispose();

            this.mesh.name = name;

            if (replace) this.addToScene();
        }
    }

    setArmature(armature) {
        this.armature = armature;

        Scene.add(this.armature, null, false);
    }

    addAnimationHandler(animations) {
        this.animationHandler = new AnimationHandler(this.getMesh(), animations);
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

    enablePhysics(options) {
        if (Config.physics().enabled) {
            const description = {
                ...getDescriptionForMesh(this),
                ...options
            };

            if (options.debug) {
                this.addPhysicsBoundingBox(description);
            }
            
            Physics.add(this, description);
        }
    }

    addPhysicsBoundingBox({ rot, pos, size }) {
        const scaledSize = size.map(s => s + BOUNDING_BOX_INCREASE);
        const box = new Box(scaledSize[0], scaledSize[1], scaledSize[2], BOUNDING_BOX_COLOR);

        box.setPosition({ x: pos[0], y: pos[1], z: pos[2] });
        box.setRotation({ x: rot[0], y: rot[1], z: rot[2] });
        box.setWireframe(true);
        box.setWireframeLineWidth(2);

        this.add(box);
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

    add(what) {
        if (this.mesh) {
            const _add = (mesh) => {
                this.children.push(mesh);
                this.mesh.add(mesh.mesh);
            };

            if (Array.isArray(what)) {
                what.forEach(_add);
            } else {
                _add(what);
            }
        }
    }

    remove(what) {
        if (this.mesh) {
            this.mesh.remove(what.mesh);
            const index = this.children.findIndex(m => m.equals(what));

            this.children.splice(index, 1);
        }
    }

    hasRayColliders = () => this.colliders.length > 0;

    areCollisionsEnabled = () => this.collisionsEnabled;

    enableCollisions = () => this.collisionsEnabled = true;
    disableCollisions = () => this.collisionsEnabled = false;

    updateRayColliders = () => {
        this.colliders.forEach(({ ray, helper, offset = DEFAULT_COLLIDER_OFFSET }) => {
            const position = this.mesh.position
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

        const position = this.mesh.position
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
            ray.setFromCamera(position, Scene.getCameraObject());
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
                mesh: Universe.getByUUID(uuid)
            };
        };

        const collisions = ray
            .intersectObjects(Scene.scene.children)
            .filter(collision => collision.object.uuid !== this.uuid())
            .map(mapCollision)
            .filter(({ mesh }) => !mesh.hasTag(COLLIDER_TAG));

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

    setColor(color) {
        if (color) {
            if (hasMaterial(this.mesh)) {
                this.mesh.material.color = new Color(color);
            } else {
                this.mesh.traverse(child => {
                    if (hasMaterial(child)) {
                        child.material.color = new Color(color);
                    }
                });
            }
        } else {
            console.warn(MESH_SET_COLOR_MISSING_COLOR);
        }
    }

    setTextureMap(textureId, options = {}) {
        if (textureId && hasMaterial(this.mesh)) {
            const {
                repeat = { x: 1, y: 1 },
                wrap = RepeatWrapping
            } = options;
            const texture = Images.get(textureId);

            this.texture = textureId;

            texture.wrapS = wrap;
            texture.wrapT = wrap;
            texture.repeat.set(repeat.x, repeat.y);

            this.mesh.material.map = texture;
        } else {
            console.warn(MESH_NO_MATERIAL_CANT_SET_TEXTURE);
        }
    }

    setMaterialFromName(materialName, options = {}) {
        if (hasMaterial(this.getMesh())) {
            changeMaterialByName(materialName, this.getMesh(), options);
        } else {
            this.mesh.traverse(child => {
                if (hasMaterial(child)) {
                    changeMaterialByName(materialName, child, options);
                }
            });
        }
    }

    setOpacity(value = 1.0) {
        if (hasMaterial(this.getMesh())) {
            this.mesh.material.transparent = true;
            this.mesh.material.opacity = value;
        } else {
            this.mesh.traverse(child => {
                if (hasMaterial(child)) {
                    child.material.transparent = true;
                    child.material.opacity = value;
                }
            })
        }
    }

    setWireframe(flag = true) {
        if (hasMaterial(this.getMesh())) {
            this.mesh.material.wireframe = flag;
        } else {
            this.mesh.traverse(child => {
                if (hasMaterial(child)) {
                    child.material.wireframe = flag;
                }
            })
        }
    }

    setWireframeLineWidth(width = 1) {
        if (hasMaterial(this.getMesh())) {
            this.mesh.material.wireframeLinewidth = width;
        } else {
            this.mesh.traverse(child => {
                if (hasMaterial(child)) {
                    child.material.wireframeLinewidth = width;
                }
            })
        }
    }

    copyQuaternion = (quaternion) => {
        this.mesh.quaternion.copy(quaternion);
    }

    copyPosition = (position) => {
        this.mesh.position.copy(position);
    }

    equals = (object) => (
        this.name === object.name &&
        this.mesh.uuid === object.mesh.uuid
    );

    toJSON() {
        if (this.serializable) {
            return {
                mesh: this.mesh.toJSON(),
                scripts: this.scripts && this.scripts.map(s => s.toJSON()),
                texture: this.texture,
                ...this.options
            }
        }

    }
}
