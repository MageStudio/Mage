import {
    EventDispatcher
} from 'three';
import SceneManager from '../base/SceneManager';
import Config from '../base/config';
import worker from './worker';
import { getDescriptionForMesh } from './utils';

import {
    INIT_EVENT,
    MESH_UPDATE,
    ADD_EVENT,
    TERMINATE_EVENT,
    POSITION_CHANGE_EVENT,
    ROTATION_CHANGE_EVENT,
    UPDATE_EVENT
} from './messages';

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
                type: TERMINATE_EVENT,
                path: Config.physics().path
            });
        }
    }

    init() {
        if (Config.physics().enabled) {
            this.worker.postMessage({
                type: INIT_EVENT,
                dt: SceneManager.clock.getDelta()
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

    handleMeshUpdate = ({ rotation, position, uuid }) => {
        // we get mesh from uuid
        // we update mesh position and rotation accordin to payload
        // on update, we receive mesh rotation and position, and uuid
        const mesh = Universe.getByUUID(uuid);

        mesh.clonePosition(position);
        mesh.cloneRotation(rotation);
    };

    add(mesh) {
        if (Config.physics().enabled) {
            const uuid = mesh.uuid();
            const description = getDescriptionForMesh(mesh);

            this.worker.postMessage({
                type: ADD_EVENT,
                description,
                uuid
            })
        }
    }

    applyForce(mesh) {
        // tell worker to apply force to this uuid mesh
    }

    updatePosition(uuid, position) {
        // tell worker to update this uuid mesh
        if (Config.physics().enabled) {
            this.worker.postMessage({
                type: POSITION_CHANGE_EVENT,
                uuid,
                position
            });
        }
    }

    updatePosition(uuid, rotation) {
        // tell worker to update this uuid mesh
        if (Config.physics().enabled) {
            this.worker.postMessage({
                type: ROTATION_CHANGE_EVENT,
                uuid,
                rotation
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
