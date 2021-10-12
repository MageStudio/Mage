import {
    TERMINATE_EVENT,
    LOAD_EVENT,
    UPDATE_BODY_EVENT,
    ADD_BOX_EVENT,
    ADD_VEHICLE_EVENT,
    ADD_MODEL_EVENT,
    ADD_PLAYER_EVENT,
    SET_LINEAR_VELOCITY_EVENT,
    SET_POSITION_EVENT,
    APPLY_IMPULSE_EVENT,
    DISPOSE_ELEMENT_EVENT,
    ADD_SPHERE_EVENT,
    SET_CAR_POSITION_EVENT,
    SET_CAR_QUATERNION_EVENT,
    RESET_CAR_EVENT
} from '../messages';

import {
    LIBRARY_NAME
} from '../constants';

import { addVehicle, resetCar, setVehiclePosition, setVehicleQuaternion } from './vehicles';
import { addBox, addMesh, setLinearVelocity, applyImpuse, addSphere, setPosition } from './bodies';
import { addPlayer } from './player';

import dispatcher from './lib/dispatcher';
import world from './world';

const handleLoadEvent = options => Ammo => {
    self.Ammo = Ammo;

    onmessage = ({ data }) => {
        switch(data.event) {
            case ADD_BOX_EVENT:
                addBox(data);
                break;
            case ADD_SPHERE_EVENT:
                addSphere(data);
                break;
            case ADD_VEHICLE_EVENT:
                addVehicle(data);
                break;
            case ADD_MODEL_EVENT:
                addMesh(data);
                break;
            case ADD_PLAYER_EVENT:
                addPlayer(data);
                break;
            case SET_LINEAR_VELOCITY_EVENT:
                setLinearVelocity(data);
                break;
            case SET_POSITION_EVENT:
                setPosition(data);
                break;
            case SET_CAR_POSITION_EVENT:
                setVehiclePosition(data);
                break;
            case SET_CAR_QUATERNION_EVENT:
                setVehicleQuaternion(data);
                break;
            case RESET_CAR_EVENT:
                resetCar(data);
                break;
            case APPLY_IMPULSE_EVENT:
                applyImpuse(data);
                break;
            case UPDATE_BODY_EVENT:
                world.updateBodyState(data.uuid, data.state);
                break;
            case DISPOSE_ELEMENT_EVENT:
                world.disposeBody(data.uuid);
                break;
            case TERMINATE_EVENT:
                world.terminate();
                break;
        }
    }

    world.init(options);
    dispatcher.sendReadyEvent();
    world.simulate()
};

const loadAmmo = (options) => {
    const scriptUrl = options.host + '/' + (options.path || LIBRARY_NAME);
    importScripts(scriptUrl);

    Ammo().then(handleLoadEvent(options));
};

onmessage = ({ data }) => {
    switch(data.event) {
        case LOAD_EVENT:
            loadAmmo(data);
            break;
        default:
            break;
    }
}