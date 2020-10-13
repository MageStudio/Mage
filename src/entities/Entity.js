import Between from 'between.js';
import { createMachine, interpret } from 'xstate';
import { EventDispatcher, Vector3 } from 'three';

import Config from '../core/config';
import Scripts from '../scripts/Scripts';
import Sound from '../audio/Sound';
import DirectionalSound from '../audio/DirectionalSound';
import AmbientSound from '../audio/AmbientSound';
import Scene from '../core/Scene';
import Physics from '../physics/physics';
import {
    TAG_ALREADY_EXISTS,
    TAG_NOT_EXISTING_REMOVAL,
    TAG_CANT_BE_REMOVED,
    STATE_MACHINE_NOT_AVAILABLE,
    SCRIPT_NOT_FOUND
} from '../lib/messages';
import { hasMaterial } from '../lib/meshUtils';

const STATE_CHANGE_EVENT = { type: 'stateChange' };
const DEFAULT_POSITION =  { x: 0, y: 0, z: 0 };
const DEFAULT_ANGULAR_VELOCITY = { x: 0, y: 0, z: 0 };
const DEFAULT_LINEAR_VELOCITY = { x: 0, y: 0, z: 0 };

export const ENTITY_TYPES = {
    MESH: 0,
    LIGHT: 1,
    MODEL: 2,
    SPRITE: 3
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

    dispose() {
        if (this.mesh) {
            Scene.remove(this.mesh);
            
            this.disposeMesh();

            this.stopStateMachine();
            this.stopScripts();
            this.reset();
        }
    }
    
    disposeMesh() {
        if (hasMaterial(this.mesh)) {
            this.mesh.material.dispose();
            this.mesh.geometry.dispose();
        } else {
            this.mesh.traverse(child => {
                if (hasMaterial(child)) {
                    child.material.dispose();
                    child.geometry.dispose();
                }
            });
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
        switch (type) {
            case ENTITY_TYPES.MESH:
                this._isMesh = true;
                break;
            case ENTITY_TYPES.LIGHT:
                this._isLight = true;
                break;
            case ENTITY_TYPES.MODEL:
                this._isModel = true;
                break;
            case ENTITY_TYPES.SPRITE:
                this._isSprite = true;
            default:
                break;
        }
        
        this.entityType = type;
    }

    getEntityType() {
        return this.entityType;
    }

    isMesh() { return this._isMesh; }
    isLight() { return this._isLight; }
    isModel() { return this._isModel; }

    addSound(name, options) {
        const { autoplay = false, ...opts } = options;

        this.isPlayingSound = autoplay;
        this.sound = new Sound(name, {
            mesh: this.mesh,
            autoplay,
            ...opts
        });

        return this.sound;
    }

    addDirectionalSound(name, options) {
        const { autoplay = false, ...opts } = options;

        this.isPlayingSound = autoplay;
        this.sound = new DirectionalSound(name, {
            mesh: this.mesh,
            autoplay,
            ...opts
        });

        return this.sound;
    }

    addAmbientSound(name, options) {
        const { autoplay = false, ...opts } = options;

        this.isPlayingSound = autoplay;
        this.sound = new AmbientSound(name, {
            mesh: this.mesh,
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
            this.sound.start();
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
            x: this.mesh.scale.x,
            y: this.mesh.scale.y,
            z: this.mesh.scale.z
        };
    }

    setScale(howbig) {
        const scale = {
            ...this.getScale(),
            ...howbig
        };

        if (this.mesh) {
            this.mesh.scale.set(scale.x, scale.y, scale.z);
        }
    }

    getWorldPosition() {
        const vector = new Vector3();
        if (this.mesh) {
            const { x, y, z } = this.mesh.getWorldPosition(vector);
            
            return { x, y, z }
        }

        return DEFAULT_POSITION;
    }

    getPosition() {
        return {
            x: this.mesh.position.x,
            y: this.mesh.position.y,
            z: this.mesh.position.z
        };
    }

    setPosition(where) {
        const position = {
            ...this.getPosition(),
            ...where
        };

        if (Config.physics().enabled) {
            Physics.updatePosition(this.uuid(), position);
        } else if (this.mesh) {
            this.mesh.position.set(position.x, position.y, position.z);
        }
    }

    getRotation() {
        return {
            x: this.mesh.rotation.x,
            y: this.mesh.rotation.y,
            z: this.mesh.rotation.z
        };
    }

    setRotation(how) {
        const rotation = {
            ...this.getRotation(),
            ...how
        };

        if (Config.physics().enabled) {
            Physics.updateRotation(this.uuid(), rotation);
        } else if (this.mesh) {
            this.mesh.rotation.set(rotation.x, rotation.y, rotation.z);
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
        if (this.mesh) {
            this.mesh.translateX(x);
            this.mesh.translateY(y);
            this.mesh.translateZ(z);
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
            this.mesh.uuid = uuid;
        }
    }

    uuid() {
        return this.mesh.uuid;
    }

    equals(element) {
        try {
            return element.uuid ? this.uuid() === element.uuid() : false;
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
}