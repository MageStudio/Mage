import {
    TERMINATE_EVENT,
    LOAD_EVENT,
    UPDATE_BODY_EVENT,
    ADD_BOX_EVENT,
    ADD_VEHICLE_EVENT,
    ADD_MESH_EVENT,
    ADD_PLAYER_EVENT,
    SET_LINEAR_VELOCITY_EVENT,
    APPLY_IMPULSE_EVENT,
    DISPOSE_ELEMENT_EVENT
} from '../messages';

import {
    LIBRARY_NAME
} from '../constants';

import { addVehicle } from './vehicles';
import { addBox, addMesh, setLinearVelocity, applyImpuse } from './bodies';
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
            case ADD_VEHICLE_EVENT:
                addVehicle(data);
                break;
            case ADD_MESH_EVENT:
                addMesh(data);
                break;
            case ADD_PLAYER_EVENT:
                addPlayer(data);
                break;
            case SET_LINEAR_VELOCITY_EVENT:
                setLinearVelocity(data);
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
        }
    }

    let last = Date.now();
    const mainLoop = () => {
        const now = Date.now();
        world.simulate(now - last);
        last = now;
    }

    setInterval(mainLoop, 1000/60);
    world.init(options);
    dispatcher.sendReadyEvent();
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