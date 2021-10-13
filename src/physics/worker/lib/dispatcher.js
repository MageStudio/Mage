import { PHYSICS_EVENTS } from '../../messages';

export class Dispatcher {

    sendPhysicsUpdate = dt => postMessage({ event: PHYSICS_EVENTS.UPDATE, dt })
    sendReadyEvent = () => postMessage({ event: PHYSICS_EVENTS.READY });
    sendTerminateEvent = () => postMessage({ event: PHYSICS_EVENTS.TERMINATE });

    sendBodyUpdate = (uuid, position, rotation, dt) => postMessage({
        event: PHYSICS_EVENTS.ELEMENT.UPDATE,
        uuid,
        position: { x: position.x(), y: position.y(), z: position.z() },
        quaternion: { x: rotation.x(), y: rotation.y(), z: rotation.z(), w: rotation.w() },
        dt
    });

    sendDispatchEvent = (uuid, eventName, eventData) => postMessage({
        event: PHYSICS_EVENTS.DISPATCH,
        uuid,
        eventName,
        eventData
    });
};

export default new Dispatcher();