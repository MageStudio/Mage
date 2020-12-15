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
    ADD_SPHERE_EVENT
} from './messages';
import { getBoxDescriptionForElement, iterateGeometries, DEFAULT_DESCRIPTION } from './utils';
import { getHostURL } from '../lib/url';
import Scene from '../core/Scene';
import {
    PHYSICS_ELEMENT_ALREADY_STORED,
    PHYSICS_ELEMENT_CANT_BE_REMOVED
} from '../lib/messages';

import {
    PHYSICS_COLLIDER_TYPES
} from './constants';

const mapColliderTypeToAddEvent = (type) => ({
    [PHYSICS_COLLIDER_TYPES.BOX]: ADD_BOX_EVENT,
    [PHYSICS_COLLIDER_TYPES.VEHICLE]: ADD_VEHICLE_EVENT,
    [PHYSICS_COLLIDER_TYPES.PLAYER]: ADD_PLAYER_EVENT,
    [PHYSICS_COLLIDER_TYPES.SPHERE]: ADD_SPHERE_EVENT
})[type] || ADD_BOX_EVENT;

const WORKER_READY_TIMEOUT = 200;

export class Physics extends EventDispatcher {

    constructor() {
        super();
        this.worker = new PhysicsWorker();
        this.elements = [];
        this.workerReady = false;
        this.worker.onmessage = this.handleWorkerMessages;
    };

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

    storeElement(element) {
        if (!this.hasElement(element)) {
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
            element.handlePhysicsUpdate(position, quaternion);
        }
    };

    handleDispatchEvent = ({ uuid, eventData, eventName }) => {
        const element = Universe.getByUUID(uuid);
        element.dispatchEvent({
            type: eventName,
            data: eventData
        });
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

    add(element, description) {
        if (Config.physics().enabled) {
            const uuid = element.uuid();

            this.storeElement(element);

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

            this.storeElement(element);

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

            this.storeElement(model);

            this.worker.postMessage({
                event: ADD_MODEL_EVENT,
                uuid,
                vertices,
                matrices,
                indexes,
                ...DEFAULT_DESCRIPTION,
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
    PHYSICS_EVENTS
};

export default new Physics();
