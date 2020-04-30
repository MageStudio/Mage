import {
    EventDispatcher
} from 'three';
import SceneManager from '../base/SceneManager';
import Universe from '../base/Universe';
import Config from '../base/config';
import worker from './worker';

import {
    INIT_EVENT,
    MESH_UPDATE,
    ADD_EVENT,
    TERMINATE_EVENT,
    POSITION_CHANGE_EVENT,
    ROTATION_CHANGE_EVENT,
    UPDATE_EVENT,
    APPLY_FORCE_EVENT,
    ANGULAR_VELOCITY_CHANGE_EVENT,
    LINEAR_VELOCITY_CHANGE_EVENT
} from './messages';

const DEFAULT_WORLD_CONFIG = {
    iterations: 8,
    broadphase: 2,
    worldscale: 1,
    random: true,
    info: false,
    gravity: [0, -9.8, 0]
};

export class Physics extends EventDispatcher {

    constructor() {
        super();
        this.worker = worker;
        this.meshes = [];
        this.worker.onmessage = this.handleWorkerMessages;
    };

    dispose() {
        if (Config.physics().enabled) {
            this.worker.postMessage({
                type: TERMINATE_EVENT
            });
        }
    }

    init() {
        if (Config.physics().enabled) {
            const worldConfig = {
                ...DEFAULT_WORLD_CONFIG,
                ...Config.physics(),
                dt: SceneManager.clock.getDelta()
            };

            this.worker.postMessage({
                type: INIT_EVENT,
                path: Config.physics().path,
                worldConfig: worldConfig
            });
        }
    }

    handleWorkerMessages = ({ data }) => {
        switch (data.type) {
            case MESH_UPDATE:
                this.handleMeshUpdate(data);
                break;
            case TERMINATE_EVENT:
                this.handleTerminateEvent();
                break;
            default:
                break;
        }
    }

    handleTerminateEvent = () => {
        this.worker.terminate();
    };

    handleMeshUpdate = ({ quaternion, position, uuid }) => {
        const mesh = Universe.getByUUID(uuid);

        mesh.copyPosition(position);
        mesh.copyQuaternion(quaternion);
    };

    add(mesh, description) {
        if (Config.physics().enabled) {
            const uuid = mesh.uuid();

            this.worker.postMessage({
                type: ADD_EVENT,
                description,
                uuid
            })
        }
    }

    applyForce(uuid, force) {
        if (Config.physics().enabled) {
            this.worker.postMessage({
                type: APPLY_FORCE_EVENT,
                uuid,
                force
            });
        }
    }

    updatePosition(uuid, position) {
        if (Config.physics().enabled) {
            this.worker.postMessage({
                type: POSITION_CHANGE_EVENT,
                uuid,
                position
            });
        }
    }

    updateRotation(uuid, rotation) {
        if (Config.physics().enabled) {
            this.worker.postMessage({
                type: ROTATION_CHANGE_EVENT,
                uuid,
                rotation
            });
        }
    }

    updateAngularVelocity(uuid, velocity) {
        if (Config.physics().enabled) {
            this.worker.postMessage({
                type: ANGULAR_VELOCITY_CHANGE_EVENT,
                uuid,
                velocity
            });
        }
    }

    updateLinearVelocity(uuid, velocity) {
        if (Config.physics().enabled) {
            this.worker.postMessage({
                type: LINEAR_VELOCITY_CHANGE_EVENT,
                uuid,
                velocity
            });
        }
    }

    update(dt) {
        if (Config.physics().enabled) {
            this.worker.postMessage({
                type: UPDATE_EVENT
            });
        }
    }
}

export default new Physics();
