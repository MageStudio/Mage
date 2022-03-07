import Between from 'between.js';
import { createMachine, interpret } from 'xstate';
import { EventDispatcher, Vector3, Quaternion, Euler } from 'three';
import Sound from '../audio/Sound';
import DirectionalSound from '../audio/DirectionalSound';
import Physics from '../physics';
import {
    TAG_ALREADY_EXISTS,
    TAG_NOT_EXISTING_REMOVAL,
    TAG_CANT_BE_REMOVED,
    STATE_MACHINE_NOT_AVAILABLE,
    SCRIPT_NOT_FOUND,
    ENTITY_TYPE_NOT_ALLOWED,
    USER_DATA_IS_MISSING,
    KEY_IS_MISSING,
    KEY_VALUE_IS_MISSING
} from '../lib/messages';

const DEFAULT_POSITION =  { x: 0, y: 0, z: 0 };
const DEFAULT_ANGULAR_VELOCITY = { x: 0, y: 0, z: 0 };
const DEFAULT_LINEAR_VELOCITY = { x: 0, y: 0, z: 0 };

export const ENTITY_TYPES = {
    MESH: 'MESH',
    LIGHT: 'LIGHT',
    MODEL: 'MODEL',
    SPRITE: 'SPRITE',
    PARTICLE: 'PARTICLE',
    UNKNOWN: 'UNKNOWN'
};

export const ENTITY_EVENTS = {
    DISPOSE: 'DISPOSE',
    STATE_MACHINE: {
        CHANGE: 'STATE_MACHINE_CHANGE',
    },
    ANIMATION: {
        LOOP: 'LOOP',
        FINISHED: 'FINISHED'
    }
};

export const DEFAULT_TAG = 'all';

console.log('defining Entity class');
export default class Entity extends EventDispatcher {

    constructor({ serializable = true, tag = '', tags = [] }) {
        super();
        this.scripts = [];
        this.tags = [];
        this.children = [];
        this.isMage = true;

        this.addTags([ DEFAULT_TAG, tag, ...tags ]);
        this.serializable = serializable;
    }

    reset() {
        this.scripts = [];
        this.tags = [ DEFAULT_TAG ];
    }

    hasBody() {
        return !!this.body;
    }

    getBody() {
        return this.body;
    }

    setBody(body) {
        this.body = body;
    }

    add(element) {
        if (this.hasBody()) {
            const _add = (toAdd) => {
                this.children.push(toAdd);
                this.getBody()
                    .add(toAdd.getBody());
            };

            if (Array.isArray(element)) {
                element.forEach(_add);
            } else {
                _add(element);
            }
        }
    }

    isParentOf(element) {
        let comparator = child => !!child.getBody().getObjectById(element.id);
        if (element.isMage) {
            comparator = child => child.getBody().getObjectById(element.id());
        }

        return this.children.filter(comparator).length > 0;
    }

    has(element) {
        if (element.isMage) {
            return this.equals(element) || this.isParentOf(element);
        } else {
            return this.getBody().getObjectById(element.id);
        }
    }

    remove(element) {
        if (this.hasBody() && this.has(element)) {
            this.body.remove(element.body);
            const index = this.children.findIndex(m => m.equals(element));

            this.children.splice(index, 1);
        }
    }

    addTag = (tagName) => {
        if (!tagName) return;

        if (!this.hasTag(tagName)) {
            this.tags.push(tagName);
            return true;
        } else {
            console.log(TAG_ALREADY_EXISTS, tagName);
            return false;
        }
    }

    addTags(tags = []) {
        tags.forEach(this.addTag);
    }

    removeTag(tagName) {
        if (tagName === DEFAULT_TAG) {
            console.log(TAG_CANT_BE_REMOVED);
            return;
        }

        if (this.hasTag(tagName)) {
            this.tags.splice(this.tags.indexOf(tagName), 1);
        } else {
            console.log(TAG_NOT_EXISTING_REMOVAL);
        }
    }

    removeAllTags() {
        this.tags = [ DEFAULT_TAG ] ;
    }

    hasTag(tagName) {
        return this.tags.includes(tagName);
    }

    getTags() {
        return this.tags;
    }

    stopScripts() {
        if (this.hasScripts()) {
            this.scripts.forEach(({ script, enabled }) => {
                if (enabled) {
                    script.onDispose();
                    script.__hasStarted(false);
                }
            });
        }
    }

    start() {
        if (this.hasScripts()) {
            this.scripts.forEach(({ script, enabled, options }) => {
                if (enabled) {
                    script.start(this, options);
                    script.__hasStarted(true);
                }
            });
        }
    }

    update(dt) {
        if (this.hasScripts()) {
            this.scripts.forEach(({ script, enabled }) => {
                if (script && enabled) {
                    script.update(dt);
                }
            });
        }
    }

    onPhysicsUpdate(dt) {
        if (this.hasScripts()) {
            this.scripts.forEach(({ script, enabled }) => {
                if (script && enabled) {
                    script.physicsUpdate(dt);
                }
            });
        }
    }

    dispose() {
        if (this.hasBody()) {
            this.stopStateMachine();
            this.stopScripts();
            this.reset();
        }

        this.dispatchEvent({
            type: ENTITY_EVENTS.DISPOSE
        })
    }

    hasStateMachine = () => !!this.stateMachine;

    addStateMachine(description) {
        this.stateMachine = interpret(createMachine(description))
            .onTransition(state => {
                this.dispatchEvent({
                    type: ENTITY_EVENTS.STATE_MACHINE.CHANGE,
                    state
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
        const { script } = this.scripts.filter(script => script.name === name)[0];

        if (script) {
            return script;
        } else {
            console.warn(SCRIPT_NOT_FOUND);
        }
    }

    hasScripts = () => this.scripts.length > 0;

    parseScripts = (list, options, enabled) => (
        list.map((script, i) => ({
            script,
            name: script.getName(),
            enabled,
            options: options[i]
        }))
    )

    addScripts(scripts = [], options = [], enabled = true) {
        const parsedScripts = this.parseScripts(scripts, options, enabled);

        this.scripts = [
            ...this.scripts,
            parsedScripts
        ];

        if (enabled) {
            parsedScripts.forEach(parsed => parsed.start(this, parsed.options));
        }
    }

    addScript(script, options = {}) {
        const {
            enabled = true
        } = options;

        if (script) {
            this.scripts.push({
                script,
                name: script.getName(),
                enabled,
                options
            });
            if (enabled) {
                script.start(this, options);
            }
        }
        
        return script;
    }

    enableScripts() {
        this.scriptsEnabled = true;
    }

    disableScripts() {
        this.scriptsEnabled = false;
    }

    setEntityType(type) {
        if (Object.values(ENTITY_TYPES).includes(type)) {
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
    isLight = () =>  this.getEntityType() === ENTITY_TYPES.LIGHT;
    isModel = () => this.getEntityType() === ENTITY_TYPES.MODEL;
    isSprite = () => this.getEntityType() === ENTITY_TYPES.SPRITE;

    addSound(name, options) {
        const { autoplay = false, ...opts } = options;

        this.isPlayingSound = autoplay;
        this.sound = new Sound(name, {
            autoplay,
            ...opts
        });

        this.sound.setTarget(this);

        return this.sound;
    }

    addDirectionalSound(name, options) {
        const { autoplay = false, ...opts } = options;

        this.isPlayingSound = autoplay;
        this.sound = new DirectionalSound(name, {
            autoplay,
            ...opts
        });

        this.sound.setTarget(this);

        return this.sound;
    }

    // addAmbientSound(name, options) {
    //     const { autoplay = false, ...opts } = options;

    //     this.isPlayingSound = autoplay;
    //     this.sound = new AmbientSound(name, {
    //         body: this.body,
    //         autoplay,
    //         ...opts
    //     });

    //     return this.sound;
    // }

    addLight(light) {
        const { x, y, z } = this.getPosition();

        light.setPosition({ x, y, z });
        this.light = light;
    }

    playSound() {
        if (this.sound && !this.isPlayingSound) {
            this.sound.play();
            this.isPlayingSound = true;
        }
    }

    stopSound() {
        if (this.sound && this.isPlayingSound ) {
            this.sound.stop();
            this.isPlayingSound = false;
        }
    }

    getScale() {
        return {
            x: this.body.scale.x,
            y: this.body.scale.y,
            z: this.body.scale.z
        };
    }

    setScale(howbig) {
        if (this.hasBody()) {
            const scale = {
                ...this.getScale(),
                ...howbig
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
    }

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
                ...where
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
                ...how
            };

            this.body.rotation.set(rotation.x, rotation.y, rotation.z);
        }
    }

    getWorldTransform() {
        const position = this.getBody().getWorldPosition(new Vector3());
        const quaternion = this.getBody().getWorldQuaternion(new Quaternion(0, 0, 0, 1));
        const rotation = new Euler(0, 0, 0, 'XYZ').setFromQuaternion(quaternion, 'XYZ');
        
        return {
            position,
            rotation,
            quaternion
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

    translate({ x = 0, y = 0, z = 0}) {
        if (this.hasBody()) {
            this.body.translateX(x);
            this.body.translateY(y);
            this.body.translateZ(z);
        }
    }

    rotateTo(rotation = this.getRotation(), time = 250) {
        const { x, y, z } = this.getRotation();

        return new Promise((resolve) =>
            new Between({ x, y, z}, rotation)
                .time(time)
                .on('update', value => this.setRotation(value))
                .on('complete', resolve)
        );
    }

    goTo(position = this.getPosition(), time = 250) {
        const { x, y, z } = this.getPosition();

        return new Promise((resolve) => 
            new Between({ x, y, z}, position)
                .time(time)
                .on('update', value => this.setPosition(value))
                .on('complete', resolve)
        );
    }

    setUuid = (uuid) => {
        if (uuid) {
            this.body.uuid = uuid;
        }
    }

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
        } catch(e) {
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
            console.log(USER_DATA_IS_MISSING)
        }
    }

    getData(key) {
        if (this.getBody().userData) {
            if (key) {
                return this.getBody().userData[key];
            } else {
                console.log(KEY_IS_MISSING);
            }
        } else {
            console.log(USER_DATA_IS_MISSING)
        }
    }

    mapScriptsToJSON() {
        this.scripts.reduce((acc, { name, options = {} }) => {
            acc.names.push(name);
            acc.options.push(options);
            
            return acc;
        }, { names: [], options: [] });
    }

    toJSON() {
        return {
            position: this.getPosition(),
            rotation: this.getRotation(),
            scale: this.getScale(),
            entityType: this.getEntityType(),
            tags: this.getTags()
        }
    }
}