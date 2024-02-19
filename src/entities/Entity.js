import { createMachine, interpret } from "xstate";
import { EventDispatcher, Vector3, Quaternion, Euler } from "three";
import {
    TAG_ALREADY_EXISTS,
    TAG_NOT_EXISTING_REMOVAL,
    TAG_CANT_BE_REMOVED,
    STATE_MACHINE_NOT_AVAILABLE,
    SCRIPT_NOT_FOUND,
    ENTITY_TYPE_NOT_ALLOWED,
    USER_DATA_IS_MISSING,
    KEY_IS_MISSING,
    KEY_VALUE_IS_MISSING,
    ENTITY_CANT_ADD_NOT_ENTITY,
    ENTITY_NOT_SET,
} from "../lib/messages";
import Scripts from "../scripts/Scripts";
import Scene from "../core/Scene";

import { isScene, serializeQuaternion, serializeVector } from "../lib/meshUtils";

import { DEFAULT_TAG, ENTITY_EVENTS, ENTITY_TYPES, FLAT_ENTITY_TYPES } from "./constants";
import { tweenTo } from "../lib/easing";

export default class Entity extends EventDispatcher {
    constructor(options = {}) {
        const { serializable = true, tag = "", tags = [] } = options;
        super();

        this.options = {
            ...options,
            serializable,
            tag,
            tags,
        };

        this.dynamicScripts = [];
        this.staticScripts = [];
        this.tags = [];
        this.children = [];
        this.isMage = true;
        this.parent = false;
        this.disposed = false;

        this.addTags([DEFAULT_TAG, tag, ...tags]);
        this.serializable = serializable;
    }

    static create(...options) {
        return new this(...options);
    }

    isSerializable() {
        return !!this.serializable;
    }

    setSerializable(serializable = true) {
        this.serializable = serializable;
    }

    isDisposed() {
        return this.disposed;
    }

    reset() {
        this.dynamicScripts = [];
        this.staticScripts = [];
        this.children = [];
        this.isMage = true;
        this.parent = false;
        this.tags = [DEFAULT_TAG];
    }

    // TODO: this is ridiculous, it's introducing a 200ms delay for no reason if delay is missing.
    waitForBody(delay = 200, maxTries = 1) {
        return new Promise((resolve, reject) => {
            const check = tries => {
                setTimeout(() => {
                    if (this.hasBody()) {
                        resolve();
                    } else if (tries <= maxTries) {
                        check(tries + 1);
                    } else {
                        reject();
                    }
                }, delay);
            };

            check(0);
        });
    }

    hasBody() {
        return !!this.body;
    }

    getBody() {
        return this.body;
    }

    getBodyByName = name => {
        if (name && this.hasBody()) {
            return this.getBody().getObjectByName(name);
        }

        console.warn(ELEMENT_NAME_NOT_PROVIDED);
    };

    setBody({ body } = {}) {
        this.body = body;
    }

    hasParent() {
        return !!this.parent;
    }

    getParent() {
        return this.parent;
    }

    setParent(parent) {
        this.parent = parent;
    }

    add(child, container = this.getBody(), { waitForBody = 0, waitForBodyMaxRetries = 1 } = {}) {
        if (this.hasBody()) {
            const _add = toAdd => {
                if (toAdd instanceof Entity) {
                    return toAdd
                        .waitForBody(waitForBody, waitForBodyMaxRetries)
                        .then(() => {
                            this.children.push(toAdd);
                            toAdd.setParent(this);
                            container.add(toAdd.getBody());
                            return toAdd;
                        })
                        .catch(console.log);
                } else {
                    console.log(ENTITY_CANT_ADD_NOT_ENTITY);
                    return Promise.reject(ENTITY_CANT_ADD_NOT_ENTITY);
                }
            };

            if (Array.isArray(child)) {
                return Promise.all(child.map(_add));
            } else {
                return _add(child);
            }
        } else {
            console.log(ENTITY_NOT_SET);
            return Promise.reject(ENTITY_NOT_SET);
        }
    }

    isParentOf(child) {
        if (!child) return false;

        let comparator = child => !!child.getBody().getObjectById(child.id);
        if (child.isMage) {
            comparator = child => child.getBody().getObjectById(child.id());
        }

        return this.children.filter(comparator).length > 0;
    }

    has(child) {
        if (!child) return false;

        if (child.isMage) {
            return this.equals(child) || this.isParentOf(child);
        } else {
            return !!this.getBody().getObjectById(child.id);
        }
    }

    remove(element) {
        if (this.hasBody() && this.has(element)) {
            if (element.isMage) {
                this.body.remove(element.getBody());
                const index = this.children.findIndex(m => m.equals(element));

                if (index !== -1) this.children.splice(index, 1);
            } else {
                this.body.remove(element.getBody());
            }
        }
    }

    addTo(target, childName) {
        if (target && target.isMage) {
            if (childName) {
                target.add(this, target.getBodyByName(childName));
            } else {
                target.add(this);
            }
        }
    }

    hasChildren() {
        return this.children.length > 0;
    }

    getHierarchy(options = {}) {
        const { parseJSON = false } = options;
        return {
            element: this.toJSON(parseJSON),
            children: this.children.map(e => e.getHierarchy(options)),
        };
    }

    addTag = tagName => {
        if (!tagName) return false;

        if (!this.hasTag(tagName)) {
            this.tags.push(tagName);
            return true;
        } else {
            console.log(TAG_ALREADY_EXISTS, tagName);
            return false;
        }
    };

    addTags(tags = []) {
        tags.forEach(this.addTag);
    }

    removeTag(tagName) {
        if (tagName === DEFAULT_TAG) {
            console.log(TAG_CANT_BE_REMOVED);
            return false;
        }

        if (this.hasTag(tagName)) {
            this.tags.splice(this.tags.indexOf(tagName), 1);
            return true;
        } else {
            console.log(TAG_NOT_EXISTING_REMOVAL);
            return false;
        }
    }

    removeAllTags() {
        this.tags = [DEFAULT_TAG];
    }

    hasTag(tagName) {
        return this.tags.includes(tagName);
    }

    getTags() {
        return this.tags;
    }

    disposeScripts() {
        if (this.hasScripts()) {
            const length = this.allScripts().length;
            for (let i = 0; i < length; i++) {
                const { script, enabled } = this.allScripts()[i];
                if (enabled) {
                    script.onDispose();
                    script.__setStartedFlag(false);
                }
            }
        }
    }

    start() {
        if (this.hasScripts()) {
            this.allScripts().forEach(({ script, enabled, options }) => {
                if (enabled) {
                    script.start(this, options);
                    script.__setStartedFlag(true);
                }
            });
        }
    }

    update(dt) {
        if (this.hasScripts()) {
            this.dynamicScripts.forEach(({ script, enabled }) => {
                if (script && enabled) {
                    script.update(dt);
                }
            });
        }
    }

    onPhysicsUpdate(dt) {
        if (this.hasScripts()) {
            this.dynamicScripts.forEach(({ script, enabled }) => {
                if (script && enabled) {
                    script.physicsUpdate(dt);
                }
            });
        }
    }

    disposeBody() {
        this.getBody().clear();
        if (this.getBody().dispose && !isScene(this.getBody())) {
            this.getBody().dispose();
        }
    }

    dispose() {
        if (this.hasChildren()) {
            this.children.forEach(child => {
                child.dispose();
            });
        }

        if (this.hasBody()) {
            this.stopStateMachine();
            this.disposeScripts();

            Scene.remove(this.getBody());
            this.disposeBody();
        }

        this.dispatchEvent({
            type: ENTITY_EVENTS.DISPOSE,
        });

        this.reset();

        this.disposed = true;
    }

    hasStateMachine = () => !!this.stateMachine;

    addStateMachine(description) {
        this.stateMachine = interpret(createMachine(description)).onTransition(state => {
            this.dispatchEvent({
                type: ENTITY_EVENTS.STATE_MACHINE.CHANGE,
                state,
            });
        });

        if (description.autostart) {
            this.startStateMachine();
        }
    }

    startStateMachine() {
        if (this.hasStateMachine()) {
            this.stateMachine.start();
        } else {
            console.log(STATE_MACHINE_NOT_AVAILABLE);
        }
    }

    stopStateMachine() {
        if (this.hasStateMachine()) {
            this.stateMachine.stop();
        }
    }

    changeState(event) {
        if (this.hasStateMachine()) {
            this.stateMachine.send(event);
        } else {
            console.log(STATE_MACHINE_NOT_AVAILABLE);
        }
    }

    getScript(name) {
        if (!this.hasScript(name)) {
            console.warn(SCRIPT_NOT_FOUND);
            return false;
        }

        const { script } = this.allScripts().filter(script => script.name === name)[0];
        return script;
    }

    hasScripts = () => this.allScripts().length > 0;

    allScripts = () => [...this.dynamicScripts, ...this.staticScripts];

    hasScript(name) {
        return this.allScripts().filter(script => script.name === name).length;
    }

    addScript(name, options = {}) {
        const script = Scripts.get(name);
        const { enabled = true } = options;

        if (script) {
            const payload = {
                script,
                name,
                enabled,
                options,
            };

            if (script.__isStatic()) {
                this.staticScripts.push({
                    ...payload,
                    index: this.staticScripts.length,
                });
            } else {
                this.dynamicScripts.push({
                    ...payload,
                    index: this.dynamicScripts.length,
                });
            }

            if (enabled) {
                script.start(this, options);
            }
        } else {
            console.log(SCRIPT_NOT_FOUND);
        }

        return script;
    }

    updateScriptsIndexes = () => {
        const update = (s, i) => (s.index = i);

        this.dynamicScripts.forEach(update);
        this.staticScripts.forEach(update);
    };

    removeScript(name) {
        const all = this.allScripts();
        const allIndex = all.findIndex(script => script.name === name);
        const { script, index } = all[allIndex];

        if (script) {
            script.onDispose();
            if (script.__isStatic()) {
                this.staticScripts.splice(index, 1);
            } else {
                this.dynamicScripts.splice(index, 1);
            }

            this.updateScriptsIndexes();
        } else {
            console.log(SCRIPT_NOT_FOUND);
        }
    }

    enableScripts() {
        this.scriptsEnabled = true;
    }

    disableScripts() {
        this.scriptsEnabled = false;
    }

    setEntityType(type) {
        if (FLAT_ENTITY_TYPES.includes(type)) {
            this.entityType = type;
        } else {
            console.log(ENTITY_TYPE_NOT_ALLOWED);
            this.entityType = ENTITY_TYPES.UNKNOWN;
        }
    }

    getEntityType() {
        return this.entityType;
    }

    isMesh = () => this.getEntityType() === ENTITY_TYPES.MESH;
    isModel = () => this.getEntityType() === ENTITY_TYPES.MODEL;
    isSprite = () => this.getEntityType() === ENTITY_TYPES.SPRITE;
    isLight = () => Object.values(ENTITY_TYPES.LIGHT).includes(this.getEntityType());
    isHelper = () => Object.values(ENTITY_TYPES.HELPER).includes(this.getEntityType());
    isEffect = () => Object.values(ENTITY_TYPES.EFFECT).includes(this.getEntityType());

    getScale() {
        return {
            x: this.body.scale.x,
            y: this.body.scale.y,
            z: this.body.scale.z,
        };
    }

    setScale(howbig) {
        if (this.hasBody()) {
            const scale = {
                ...this.getScale(),
                ...howbig,
            };
            this.body.scale.set(scale.x, scale.y, scale.z);
        }
    }

    getQuaternion() {
        if (this.hasBody()) {
            return this.getBody().quaternion.clone();
        }
    }

    setQuaternion = ({ x, y, z, w }) => {
        this.body.quaternion.set(x, y, z, w);
    };

    getPosition() {
        return this.getBody().position.clone();
    }

    setPosition(where) {
        if (this.hasBody()) {
            const { x, y, z } = this.getPosition();
            const position = {
                x,
                y,
                z,
                ...where,
            };

            this.body.position.set(position.x, position.y, position.z);
        }
    }

    getRotation() {
        return this.getBody().rotation.clone();
    }

    setRotation(how) {
        if (this.hasBody()) {
            const { x, y, z } = this.getRotation();
            const rotation = {
                x,
                y,
                z,
                ...how,
            };

            this.body.rotation.set(rotation.x, rotation.y, rotation.z);
        }
    }

    getWorldTransform() {
        const position = this.getBody().getWorldPosition(new Vector3());
        const quaternion = this.getBody().getWorldQuaternion(new Quaternion(0, 0, 0, 1));
        const rotation = new Euler(0, 0, 0, "XYZ").setFromQuaternion(quaternion, "XYZ");

        return {
            position,
            rotation,
            quaternion,
        };
    }

    translate({ x = 0, y = 0, z = 0 }) {
        if (this.hasBody()) {
            this.body.translateX(x);
            this.body.translateY(y);
            this.body.translateZ(z);
        }
    }

    scaleTo(scale = this.getScale(), time = 250, options = {}) {
        const { x, y, z } = this.getScale();
        const target = { x, y, z, ...scale };
        const onUpdate = value => !this.isDisposed() && this.setScale(value);

        return tweenTo({ x, y, z }, target, { ...options, time, onUpdate });
    }

    rotateTo(rotation = this.getRotation(), time = 250, options = {}) {
        const { x, y, z } = this.getRotation();
        const target = { x, y, z, ...rotation };
        const onUpdate = value => !this.isDisposed() && this.setRotation(value);

        return tweenTo({ x, y, z }, target, { ...options, time, onUpdate });
    }

    goTo(position = this.getPosition(), time = 250, options = {}) {
        const { x, y, z } = this.getPosition();
        const target = { x, y, z, ...position };
        const onUpdate = value => !this.isDisposed() && this.setPosition(value);

        return tweenTo({ x, y, z }, target, { ...options, time, onUpdate });
    }

    setUuid = uuid => {
        if (uuid) {
            this.body.uuid = uuid;
        }
    };

    uuid() {
        return this.body.uuid;
    }

    setId() {
        return this.body.id;
    }

    id() {
        return this.body.id;
    }

    setVisible(flag = true) {
        this.getBody().visible = flag;
    }

    equals(entity) {
        try {
            return entity.uuid ? this.uuid() === entity.uuid() : false;
        } catch (e) {
            return false;
        }
    }

    setName(name) {
        this.name = name;
    }

    getName() {
        return this.name;
    }

    setData(key, value) {
        if (this.getBody().userData) {
            if (key && value) {
                this.getBody().userData[key] = value;
            } else {
                console.log(KEY_VALUE_IS_MISSING);
            }
        } else {
            console.log(USER_DATA_IS_MISSING);
        }
    }

    getData(key) {
        if (this.getBody().userData) {
            if (key) {
                return this.getBody().userData[key];
            } else {
                console.log(KEY_IS_MISSING);
                return this.getBody().userData;
            }
        } else {
            console.log(USER_DATA_IS_MISSING);
            return {};
        }
    }

    mapScriptsToJSON() {
        return this.allScripts().reduce(
            (acc, { name, options = {}, script }) => {
                acc.names.push(name);
                acc.options.push(options);
                acc.static.push(script.__isStatic());

                return acc;
            },
            { names: [], options: [], static: [] },
        );
    }

    toJSON(parseJSON = false) {
        if (this.isSerializable()) {
            const position = this.getPosition();
            const rotation = this.getRotation();
            const scale = this.getScale();
            const quaternion = this.getQuaternion();
            const {
                position: worldPosition,
                rotation: worldRotation,
                quaternion: worldQuaternion,
            } = this.getWorldTransform();

            return {
                position: parseJSON ? serializeVector(position) : position,
                rotation: parseJSON ? serializeVector(rotation) : rotation,
                quaternion: parseJSON ? serializeQuaternion(quaternion) : quaternion,
                scale: parseJSON ? serializeVector(scale) : scale,
                worldTransform: {
                    position: parseJSON ? serializeVector(worldPosition) : worldPosition,
                    rotation: parseJSON ? serializeVector(worldRotation) : worldRotation,
                    quaternion: parseJSON ? serializeQuaternion(worldQuaternion) : worldQuaternion,
                },
                entityType: this.getEntityType(),
                scripts: this.mapScriptsToJSON(),
                tags: this.getTags(),
                name: this.getName(),
                uuid: this.uuid(),
                data: this.getData(),
                shadow: {
                    cast: this.getBody().castShadow,
                    receive: this.getBody().receiveShadow,
                },
            };
        }
    }
}
