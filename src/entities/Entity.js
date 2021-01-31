import Between from 'between.js';
import { createMachine, interpret } from 'xstate';
import { EventDispatcher, Vector3 } from 'three';

import Scripts from '../scripts/Scripts';
import Sound from '../audio/Sound';
import DirectionalSound from '../audio/DirectionalSound';
import AmbientSound from '../audio/AmbientSound';
import Physics from '../physics';
import {
    TAG_ALREADY_EXISTS,
    TAG_NOT_EXISTING_REMOVAL,
    TAG_CANT_BE_REMOVED,
    STATE_MACHINE_NOT_AVAILABLE,
    SCRIPT_NOT_FOUND,
    ENTITY_TYPE_NOT_ALLOWED
} from '../lib/messages';

const STATE_CHANGE_EVENT = { type: 'stateChange' };
const DEFAULT_POSITION =  { x: 0, y: 0, z: 0 };
const DEFAULT_ANGULAR_VELOCITY = { x: 0, y: 0, z: 0 };
const DEFAULT_LINEAR_VELOCITY = { x: 0, y: 0, z: 0 };

export const ENTITY_TYPES = {
    MESH: 'MESH',
    LIGHT: 'LIGHT',
    MODEL: 'MODEL',
    SPRITE: 'SPRITE',
    UNKNOWN: 'UNKNOWN'
};

export const DEFAULT_TAG = 'all';

export default class Entity extends EventDispatcher {

    constructor({ serializable = true, tag = '', tags = [] }) {
        super();
        this.scripts = [];
        this.tags = [];

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
        return new Promise((resolve) => {
            if (this.hasScripts()) {
                this.scripts.forEach(({ script, enabled }) => {
                    if (script && enabled) {
                        script.update(dt);
                    }
                });
            }
            resolve();
        });
    }

    onPhysicsUpdate(dt) {
        return new Promise((resolve) => {
            if (this.hasScripts()) {
                this.scripts.forEach(({ script, enabled }) => {
                    if (script && enabled) {
                        script.physicsUpdate(dt);
                    }
                });
            }
            resolve();
        });
    }

    dispose() {
        if (this.hasBody()) {
            this.stopStateMachine();
            this.stopScripts();
            this.reset();
        }
    }

    hasStateMachine = () => !!this.stateMachine;

    addStateMachine(description) {
        this.stateMachine = interpret(createMachine(description))
            .onTransition(state => {
                this.dispatchEvent({
                    STATE_CHANGE_EVENT,
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
        } else {
            console.log(STATE_MACHINE_NOT_AVAILABLE);
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
        const script = this.scripts.filter(({ name }) => name === name)[0];

        if (script) {
            return script;
        } else {
            console.warn(SCRIPT_NOT_FOUND);
        }
    }

    hasScripts = () => this.scripts.length > 0;

    parseScripts = (list, options, enabled) => (
        list.map((name, i) => ({
            script: Script.get(name),
            name,
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

    addScript(name, options = {}) {
        const script = Scripts.get(name);
        const {
            enabled = true
        } = options;

        if (script) {
            this.scripts.push({
                script,
                name,
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
            body: this.body,
            autoplay,
            ...opts
        });

        return this.sound;
    }

    addDirectionalSound(name, options) {
        const { autoplay = false, ...opts } = options;

        this.isPlayingSound = autoplay;
        this.sound = new DirectionalSound(name, {
            body: this.body,
            autoplay,
            ...opts
        });

        return this.sound;
    }

    addAmbientSound(name, options) {
        const { autoplay = false, ...opts } = options;

        this.isPlayingSound = autoplay;
        this.sound = new AmbientSound(name, {
            body: this.body,
            autoplay,
            ...opts
        });

        return this.sound;
    }

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

    getWorldPosition() {
        const vector = new Vector3();
        if (this.hasBody()) {
            const { x, y, z } = this.body.getWorldPosition(vector);
            
            return { x, y, z }
        }

        return DEFAULT_POSITION;
    }

    getQuaternion() {
        if (this.hasBody()) {
            return this.getBody().quaternion;
        }
    }

    setQuaternion = ({ x, y, z, w }) => {
        this.body.quaternion.set(x, y, z, w);
    }

    getPosition() {
        return {
            x: this.body.position.x,
            y: this.body.position.y,
            z: this.body.position.z
        };
    }

    setPosition(where) {
        if (this.hasBody()) {
            const position = {
                ...this.getPosition(),
                ...where
            };

            this.body.position.set(position.x, position.y, position.z);
        }
    }

    getRotation() {
        return {
            x: this.body.rotation.x,
            y: this.body.rotation.y,
            z: this.body.rotation.z
        };
    }

    setRotation(how) {
        if (this.hasBody()) {
            const rotation = {
                ...this.getRotation(),
                ...how
            };

            this.body.rotation.set(rotation.x, rotation.y, rotation.z);
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