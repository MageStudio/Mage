import {
    LIBRARY_NAME
} from '../constants';

import { addVehicle, resetVehicle, setVehiclePosition, setVehicleQuaternion } from './vehicles';
import { addBox, addModel, setLinearVelocity, applyImpuse, addSphere, setPosition } from './elements';
import { addPlayer } from './player';

import dispatcher from './lib/dispatcher';
import world from './world';
import { PHYSICS_EVENTS } from '../messages';

const handleLoadEvent = options => Ammo => {
    self.Ammo = Ammo;

    onmessage = ({ data }) => {
        switch(data.event) {
            case PHYSICS_EVENTS.ADD.BOX:
                addBox(data);
                break;
            case PHYSICS_EVENTS.ADD.SPHERE:
                addSphere(data);
                break;
            case PHYSICS_EVENTS.ADD.VEHICLE:
                addVehicle(data);
                break;
            case PHYSICS_EVENTS.ADD.MODEL:
                addModel(data);
                break;
            case PHYSICS_EVENTS.ADD.PLAYER:
                addPlayer(data);
                break;
            case PHYSICS_EVENTS.ELEMENT.SET.LINEAR_VELOCITY:
                setLinearVelocity(data);
                break;
            case PHYSICS_EVENTS.ELEMENT.SET.POSITION:
                setPosition(data);
                break;
            case PHYSICS_EVENTS.VEHICLE.SET.POSITION:
                setVehiclePosition(data);
                break;
            case PHYSICS_EVENTS.VEHICLE.SET.QUATERNION:
                setVehicleQuaternion(data);
                break;
            case PHYSICS_EVENTS.VEHICLE.RESET:
                resetVehicle(data);
                break;
            case PHYSICS_EVENTS.ELEMENT.APPLY.IMPULSE:
                applyImpuse(data);
                break;
            case PHYSICS_EVENTS.ELEMENT.UPDATE:
                world.updateBodyState(data.uuid, data.state);
                break;
            case PHYSICS_EVENTS.ELEMENT.DISPOSE:
                world.disposeBody(data.uuid);
                break;
            case PHYSICS_EVENTS.TERMINATE:
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
        case PHYSICS_EVENTS.LOAD.AMMO:
            loadAmmo(data);
            break;
        default:
            break;
    }
}