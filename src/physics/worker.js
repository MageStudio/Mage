import { createWorker } from '../lib/workers';

const worker = createWorker(() => {

    const UPDATE_EVENT = 'UPDATE_EVENT';
    const INIT_EVENT = 'INIT_EVENT';
    const ADD_EVENT = 'ADD_EVENT';
    const MESH_UPDATE = 'MESH_UPDATE';
    const TERMINATE_EVENT = 'TERMINATE_EVENT';
    const ROTATION_CHANGE_EVENT = 'ROTATION_CHANGE_EVENT';
    const POSITION_CHANGE_EVENT = 'POSITION_CHANGE_EVENT';
    const APPLY_FORCE_EVENT = 'APPLY_FORCE_EVENT';
    const ANGULAR_VELOCITY_CHANGE_EVENT = 'ANGULAR_VELOCITY_CHANGE_EVENT';
    const LINEAR_VELOCITY_CHANGE_EVENT = 'LINEAR_VELOCITY_CHANGE_EVENT';

    let world,
        elements;

    const isUndefined = e => e === undefined;

    const handleInitEvent = ({ path, worldConfig }) => {
        self.importScripts(path);

        elements = [];
        world = new OIMO.World(worldConfig);
    }

    const handleUpdateEvent = ({ }) => {
        if (world) {
            world.step();

            Object.keys(elements).forEach(uuid => {
                const body = elements[uuid];

                if (!body.sleeping) {
                    const position = elements[uuid].getPosition();
                    const quaternion = elements[uuid].getQuaternion();
    
                    self.postMessage({
                        type: MESH_UPDATE,
                        position,
                        quaternion,
                        uuid
                    });
                }
            })
        }
    }

    const handleAddEvent = ({ description, uuid }) => {
        if (world) {
            console.log('description for', uuid, description);
            elements[uuid] = world.add(description);
        }
    }

    const handlePositionChangeEvent = ({ uuid, position }) => {
        if (world && elements[uuid]) {
            elements[uuid].setPosition(position);
        }
    };

    const handleRotationChangeEvent = ({ uuid, rotation }) => {
        if (world && elements[uuid]) {
            elements[uuid].setRotation(rotation);
        }
    }

    const handleApplyForceEvent = ({ uuid, force }) => {
        if (world && elements[uuid]) {
            elements[uuid].applyImpulse(elements[uuid].getPosition(), force);
        }
    }

    const handleAngularVelocityChangeEvent = ({ uuid, velocity }) => {
        if (world && elements[uuid]) {
            const { x, y, z } = velocity;

            elements[uuid].angularVelocity.x = isUndefined(x) ? elements[uuid].angularVelocity.x : x;
            elements[uuid].angularVelocity.y = isUndefined(y) ? elements[uuid].angularVelocity.y : y;
            elements[uuid].angularVelocity.z = isUndefined(z) ? elements[uuid].angularVelocity.z : z;
        }
    }

    const handleLinearVelocityChangeEvent = ({ uuid, velocity }) => {
        if (world && elements[uuid]) {
            const { x, y, z } = velocity;

            elements[uuid].linearVelocity.x = isUndefined(x) ? elements[uuid].linearVelocity.x : x;
            elements[uuid].linearVelocity.y = isUndefined(y) ? elements[uuid].linearVelocity.y : y;
            elements[uuid].linearVelocity.z = isUndefined(z) ? elements[uuid].linearVelocity.z : z;
        }
    }

    const handleTerminateEvent = () => {
        if (world) {
            world.clear();
            self.postMessage({
                type: TERMINATE_EVENT
            });
        }
    }

    self.onmessage = ({ data }) => {
        switch(data.type) {
            case INIT_EVENT:
                handleInitEvent(data);
                break;
            case UPDATE_EVENT:
                handleUpdateEvent(data);
                break;
            case ADD_EVENT:
                handleAddEvent(data);
                break;
            case ROTATION_CHANGE_EVENT:
                handleRotationChangeEvent(data);
                break;
            case POSITION_CHANGE_EVENT:
                handlePositionChangeEvent(data);
                break;
            case APPLY_FORCE_EVENT:
                handleApplyForceEvent(data);
                break;
            case ANGULAR_VELOCITY_CHANGE_EVENT:
                handleAngularVelocityChangeEvent(data);
                break;
            case LINEAR_VELOCITY_CHANGE_EVENT:
                handleLinearVelocityChangeEvent(data);
                break;
            case TERMINATE_EVENT:
                handleTerminateEvent();
            default:
                break;
        }
    }
});

export default worker;
