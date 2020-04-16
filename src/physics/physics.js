import {
    EventDispatcher
} from 'three';

import { INIT_EVENT } from './messages';
import Oimo from 'oimo';
import worker from './worker';

export class Physics extends EventDispatcher {

    constructor() {
        super();
        this.worker = worker;
        this.meshes = [];
        this.worker.postMessage({
            type: INIT_EVENT,
            lib: Oimo
        });

        this.worker.onmessage = this.handleWorkerMessages;
    };

    handleWorkerMessages = ({ data }) => {
        switch (data.type) {
            case MESH_UPDATE:
                this.handleMeshUpdate(data);
                break;
            default:
                break;
        }
    }

    handleMeshUpdate = ({ rotation, position, uuid }) => {
        // we get mesh from uuid
        // we update mesh position and rotation accordin to payload
        // on update, we receive mesh rotation and position, and uuid
        const mesh = Universe.getByUUID(uuid);

        mesh.position(position);
        mesh.rotation(rotation);
    };

    add(mesh) {
        const uuid = mesh.uuid();
        // find proper description for this mesh;
        // send uuid to worker
        this.worker.postMessage({
            type: ADD_EVENT,
            description,
            uuid
        })
    }

    applyForce(mesh) {
        // tell worker to apply force to this uuid mesh
    }

    updatePosition(mesh) {
        // tell worker to update this uuid mesh
    }

    updateRotation(mesh) {
        // tell worker to update this uuid mesh
    }

    update(dt) {
        this.worker.postMessage({
            type: UPDATE_EVENT
        });
    }
}
