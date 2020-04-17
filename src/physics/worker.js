import { createWorker } from '../lib/workers';

const worker = createWorker(() => {

    const UPDATE_EVENT = 'UPDATE_EVENT';
    const INIT_EVENT = 'INIT_EVENT';
    const ADD_EVENT = 'ADD_EVENT';
    const MESH_UPDATE = 'MESH_UPDATE';
    const TERMINATE_EVENT = 'TERMINATE_EVENT';
    const ROTATION_CHANGE_EVENT = 'ROTATION_CHANGE_EVENT';
    const POSITION_CHANGE_EVENT = 'POSITION_CHANGE_EVENT';

    let world,
        elements;

    const handleInitEvent = ({ dt, path }) => {
        const OIMO = self.importScripts(path);

        elements = [];
        world = new OIMO.World({
            timestep: dt,
            iterations: 8,
            broadphase: 2,
            worldscale: 1,
            random: true,
            info: false,
            gravity: [0, -9.8, 0]
        });
    }

    const handleUpdateEvent = ({ }) => {
        if (world) {
            world.step();

            Object.keys(elements).forEach(uuid => {
                const position = elements[uuid].getPosition();
                const rotation = elements[uuid].getRotation();

                self.postMessage({
                    type: MESH_UPDATE,
                    position,
                    rotation,
                    uuid
                });
            })
        }
    }

    const handleAddEvent = ({ description, uuid }) => {
        if (world) {
            elements[uuid] = world.add(description);
        }
    }

    const handlePositionChangeEvent = ({ uuid, position }) => {
        if (world) {
            elements[uuid].setPosition(position);
        }
    };

    const handleRotationChangeEvent = ({ uuid, rotation }) => {
        if (world) {
            elements[uuid].setRotation(rotation);
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
            case TERMINATE_EVENT:
                handleTerminateEvent();
            default:
                break;
        }
    }
});

export default worker;
