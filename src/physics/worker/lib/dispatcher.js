import {
    UPDATE_BODY_EVENT,
    READY_EVENT,
    TERMINATE_EVENT,
    DISPATCH_EVENT,
    PHYSICS_UPDATE_EVENT
} from '../../messages';

export class Dispatcher {

    sendPhysicsUpdate = dt => postMessage({ event: PHYSICS_UPDATE_EVENT, dt })
    sendReadyEvent = () => postMessage({ event: READY_EVENT });
    sendTerminateEvent = () => postMessage({ event: TERMINATE_EVENT });

    sendBodyUpdate = (uuid, position, rotation, dt) => postMessage({
        event: UPDATE_BODY_EVENT,
        uuid,
        position: { x: position.x(), y: position.y(), z: position.z() },
        quaternion: { x: rotation.x(), y: rotation.y(), z: rotation.z(), w: rotation.w() },
        dt
    });

    sendDispatchEvent = (uuid, eventName, eventData) => postMessage({
        event: DISPATCH_EVENT,
        uuid,
        eventName,
        eventData
    });
};

export default new Dispatcher();