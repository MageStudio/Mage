import {
    EventDispatcher
} from 'three';
import Universe from '../core/Universe';
import Config from '../core/config';
import PhysicsWorker from 'worker:./worker';

import {
    TERMINATE_EVENT,
    LOAD_EVENT,
    UPDATE_BODY_EVENT,
    READY_EVENT,
    ADD_BOX_EVENT,
    ADD_VEHICLE_EVENT,
    DISPATCH_EVENT,
    PHYSICS_EVENTS,
    ADD_MODEL_EVENT,
    PHYSICS_UPDATE_EVENT,
    ADD_PLAYER_EVENT,
    SET_LINEAR_VELOCITY_EVENT,
    APPLY_IMPULSE_EVENT,
    DISPOSE_ELEMENT_EVENT,
    ADD_SPHERE_EVENT,
    SET_POSITION_EVENT,
    SET_CAR_POSITION_EVENT
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
                event: TERMINATE_EVENT
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
                event: LOAD_EVENT,
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
            case READY_EVENT:
                this.workerReady = true;
                break;
            case UPDATE_BODY_EVENT:
                this.handleBodyUpdate(data);
                break;
            case TERMINATE_EVENT:
                this.handleTerminateEvent();
                break;
            case DISPATCH_EVENT:
                this.handleDispatchEvent(data);
                break;
            case PHYSICS_UPDATE_EVENT:
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

    handleBodyUpdate = ({ quaternion, position, uuid }) => {
        const element = Universe.getByUUID(uuid);
 
        if (element) {
            if (element.getPhysicsOptions('applyPhysicsUpdate')) {
                element.handlePhysicsUpdate(position, quaternion);
            } else {
                element.dispatchEvent({
                    type: Element.EVENTS.PHYSICS_UPDATE,
                    position,
                    quaternion
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
                event: DISPOSE_ELEMENT_EVENT,
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
                event: ADD_VEHICLE_EVENT,
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
                event: ADD_MODEL_EVENT,
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
                event: SET_LINEAR_VELOCITY_EVENT,
                uuid,
                velocity
            });
        }
    }

    setPosition = (element, position) => {
        if (Config.physics().enabled) {
            const uuid = element.uuid();

            this.worker.postMessage({
                event: SET_POSITION_EVENT,
                uuid,
                position
            });
        }
    }

    setCarPosition = (car, position) => {
        if (Config.physics().enabled) {
            const uuid = car.uuid();

            this.worker.postMessage({
                event: SET_CAR_POSITION_EVENT,
                uuid,
                position
            })
        }
    }

    applyImpulse = (element, impulse) => {
        if (Config.physics().enabled) {
            const uuid = element.uuid();

            this.worker.postMessage({
                event: APPLY_IMPULSE_EVENT,
                uuid,
                impulse
            });
        }
    }

    updateBodyState(element, state) {
        if (Config.physics().enabled) {
            const uuid = element.uuid();

            this.worker.postMessage({
                event: UPDATE_BODY_EVENT,
                uuid,
                state
            });
        }
    }
}

export { 
    PHYSICS_EVENTS,
    PHYSICS_CONSTANTS,
    physicsUtils,
};

export default new Physics();
