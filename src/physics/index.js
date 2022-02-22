import {
    EventDispatcher
} from 'three';
import Universe from '../core/Universe';
import Config from '../core/config';
import PhysicsWorker from 'worker:./worker';

import {
    PHYSICS_EVENTS
} from './messages';
import * as physicsUtils from './utils';
import { getHostURL } from '../lib/url';
import Scene from '../core/Scene';
import {
    PHYSICS_ELEMENT_ALREADY_STORED,
    PHYSICS_ELEMENT_CANT_BE_REMOVED
} from '../lib/messages';

import * as PHYSICS_CONSTANTS from './constants';
import { Element } from '../entities';

const { COLLIDER_TYPES } = PHYSICS_CONSTANTS;

const {
    getBoxDescriptionForElement,
    extractPositionAndQuaternion,
    mapColliderTypeToDescription,
    iterateGeometries,
    mapColliderTypeToAddEvent,
    DEFAULT_DESCRIPTION
} = physicsUtils;

const WORKER_READY_TIMEOUT = 200;

export class Physics extends EventDispatcher {

    constructor() {
        super();
        this.elements = [];
    };

    createWorker() {
        this.worker = new PhysicsWorker();
        this.workerReady = false;
        this.worker.onmessage = this.handleWorkerMessages;
    }

    dispose() {
        if (Config.physics().enabled) {
            this.worker.postMessage({
                event: PHYSICS_EVENTS.TERMINATE
            });

            this.elements = [];
        }
    }

    hasElement(element) {
        const uuid = element.uuid();

        return this.elements.includes(uuid);
    }

    storeElement(element, options) {
        if (!this.hasElement(element)) {
            element.setPhysicsOptions(options);
            const uuid = element.uuid();
            this.elements.push(uuid);
        } else {
            console.log(PHYSICS_ELEMENT_ALREADY_STORED, element);
        }
    }

    removeElement(element) {
        if (this.hasElement(element)) {
            const uuid = element.uuid();
            this.elements.splice(this.elements.indexOf(uuid), 1);
        } else {
            console.log(PHYSICS_ELEMENT_CANT_BE_REMOVED);
        }
    }

    init() {
        if (Config.physics().enabled) {
            this.createWorker();

            this.worker.postMessage({
                event: PHYSICS_EVENTS.LOAD.AMMO,
                ...Config.physics(),
                host: getHostURL()
            });

            return new Promise(resolve => {
                const isWorkerReady = () => this.workerReady;
                const check = () => {
                    setTimeout(() => {
                        if (isWorkerReady()) {
                            resolve();
                        } else {
                            check();
                        }
                    }, WORKER_READY_TIMEOUT)
                };

                check();
            });
        }
        
        return Promise.resolve();
    }

    handleWorkerMessages = ({ data }) => {
        switch (data.event) {
            case PHYSICS_EVENTS.READY:
                this.workerReady = true;
                break;
            case PHYSICS_EVENTS.ELEMENT.UPDATE:
                this.handleBodyUpdate(data);
                break;
            case PHYSICS_EVENTS.TERMINATE:
                this.handleTerminateEvent();
                break;
            case PHYSICS_EVENTS.DISPATCH:
                this.handleDispatchEvent(data);
                break;
            case PHYSICS_EVENTS.UPDATE:
                this.handlePhysicsUpdate(data);
                break;
            default:
                break;
        }
    };

    handlePhysicsUpdate = ({ dt }) => {
        Scene.onPhysicsUpdate(dt);
    };

    handleTerminateEvent = () => {
        this.worker.terminate();
    };

    handleBodyUpdate = ({ uuid, ...data }) => {
        const element = Universe.getByUUID(uuid);
 
        if (element) {
            if (element.getPhysicsOptions('applyPhysicsUpdate')) {
                element.handlePhysicsUpdate(data);
            } else {
                element.dispatchEvent({
                    type: PHYSICS_EVENTS.ELEMENT.UPDATE,
                    ...data
                });
            }
        }
    };

    handleDispatchEvent = ({ uuid, eventData, eventName }) => {
        const element = Universe.getByUUID(uuid);
        if(element) {
            element.dispatchEvent({
                type: eventName,
                data: eventData
            });
        }
    };

    disposeElement(element) {
        if (Config.physics().enabled && this.hasElement(element)) {
            const uuid = element.uuid();

            this.removeElement(element);
            this.worker.postMessage({
                event: PHYSICS_EVENTS.ELEMENT.DISPOSE,
                uuid
            })
        }
    }

    add(element, options = {}) {
        if (Config.physics().enabled) {
            const {
                colliderType = COLLIDER_TYPES.BOX
            } = options;

            const uuid = element.uuid();
            const description = {
                ...mapColliderTypeToDescription(colliderType)(element),
                ...options
            };

            this.storeElement(element, options);

            this.worker.postMessage({
                event: mapColliderTypeToAddEvent(description.collider),
                ...description,
                uuid
            })
        }
    }

    addVehicle(element, options) {
        if (Config.physics().enabled) {
            const uuid = element.uuid();
            const description = getBoxDescriptionForElement(element);

            this.storeElement(element, options);

            this.worker.postMessage({
                event: PHYSICS_EVENTS.ADD.VEHICLE,
                uuid,
                ...description,
                ...options
            })
        }
    }

    addModel(model, options) {
        if (Config.physics().enabled) {
            const uuid = model.uuid();
            const vertices = [];
            const matrices = [];
            const indexes = [];

            iterateGeometries(model.getBody(), {}, (vertexArray, matrixArray, indexArray) => {
                vertices.push(vertexArray);
                matrices.push(matrixArray);
                indexes.push(indexArray);
            });

            this.storeElement(model, options);

            this.worker.postMessage({
                event: PHYSICS_EVENTS.ADD.MODEL,
                uuid,
                vertices,
                matrices,
                indexes,
                ...DEFAULT_DESCRIPTION,
                ...extractPositionAndQuaternion(model),
                ...options
            })

        }
    }

    setLinearVelocity = (element, velocity) => {
        if (Config.physics().enabled) {
            const uuid = element.uuid();

            this.worker.postMessage({
                event: PHYSICS_EVENTS.ELEMENT.SET.LINEAR_VELOCITY,
                uuid,
                velocity
            });
        }
    }

    setPosition = (element, position) => {
        if (Config.physics().enabled) {
            const uuid = element.uuid();

            this.worker.postMessage({
                event: PHYSICS_EVENTS.ELEMENT.SET.POSITION,
                uuid,
                position
            });
        }
    }

    setVehiclePosition = (vehicle, { x, y, z }) => {
        if (Config.physics().enabled) {
            const uuid = vehicle.uuid();

            this.worker.postMessage({
                event: PHYSICS_EVENTS.VEHICLE.SET.POSITION,
                uuid,
                position: { x, y, z }
            })
        }
    }

    setVehicleQuaternion = (vehicle, { x, y, z, w }) => {
        if (Config.physics().enabled) {
            const uuid = vehicle.uuid();

            this.worker.postMessage({
                event: PHYSICS_EVENTS.VEHICLE.SET.QUATERNION,
                uuid,
                quaternion: { x, y, z, w }
            });
        }
    }

    resetVehicle = (vehicle, position, quaternion) => {
        if (Config.physics().enabled) {
            const uuid = vehicle.uuid();

            this.worker.postMessage({
                event: PHYSICS_EVENTS.VEHICLE.RESET,
                uuid,
                quaternion: {
                    x: quaternion.x,
                    y: quaternion.y,
                    z: quaternion.z,
                    w: quaternion.w
                },
                position: {
                    x: position.x,
                    y: position.y,
                    z: position.z
                }
            });
        }
    }

    applyImpulse = (element, impulse) => {
        if (Config.physics().enabled) {
            const uuid = element.uuid();

            this.worker.postMessage({
                event: PHYSICS_EVENTS.ELEMENT.APPLY.IMPULSE,
                uuid,
                impulse
            });
        }
    }

    updateBodyState(element, state) {
        if (Config.physics().enabled) {
            const uuid = element.uuid();

            this.worker.postMessage({
                event: PHYSICS_EVENTS.ELEMENT.UPDATE,
                uuid,
                state
            });
        }
    }

    disposeElement = element => {
        if (Config.physics().enabled) {
            const uuid = element.uuid();

            this.worker.postMessage({
                event: PHYSICS_EVENTS.ELEMENT.DISPOSE,
                uuid
            });
        }
    };
    
    explosion = (element, strength, radius) => {
        if (Config.physics().enabled) {
            const uuid = element.uuid();

            this.worker.postMessage({
                event: PHYSICS_EVENTS.EFFECTS.EXPLOSION,
                uuid,
                strength,
                radius
            });
        }
    };
}

export { 
    PHYSICS_EVENTS,
    PHYSICS_CONSTANTS,
    physicsUtils,
};

export default new Physics();
