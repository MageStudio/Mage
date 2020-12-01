import {
    GRAVITY,
    TYPES
} from '../constants';

import { handleRigidbodyUpdate } from './bodies';
import { handleVehicleUpdate } from './vehicles';

import dispatcher from './lib/dispatcher';
import { handlePlayerUpdate } from './player';

export class World {

    constructor() {
        this.elements = {};
        this.initialised = false;

        this.collisionConfiguration = undefined;
        this.dispatcher = undefined;
        this.broadphase = undefined;
        this.solver = undefined;
        this.ammoWorld = undefined;
    }

    init = (options) => {
        const { gravity = GRAVITY } = options;

        this.collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
        this.dispatcher = new Ammo.btCollisionDispatcher(this.collisionConfiguration);
        this.broadphase = new Ammo.btDbvtBroadphase();
        this.solver = new Ammo.btSequentialImpulseConstraintSolver();
        this.ammoWorld = new Ammo.btDiscreteDynamicsWorld(this.dispatcher, this.broadphase, this.solver, this.collisionConfiguration);
        this.ammoWorld.setGravity(new Ammo.btVector3(gravity.x, gravity.y, gravity.z));

        this.initialised = true;
    };

    getElement = uuid => this.elements[uuid];

    isInitialised = () => this.initialised;

    getAmmoWorld = () => this.ammoWorld;

    addRigidBody = body => {
        this.ammoWorld.addRigidBody(body);
    }

    addAction = action => {
        this.ammoWorld.addAction(action);
    }

    stepSimulation = dt => {
        this.ammoWorld.stepSimulation(dt);
    }

    simulate = (dt) => {
        this.stepSimulation(dt);

        Object
            .keys(this.elements)
            .forEach(uuid => {
                const element = this.getElement(uuid);

                switch(element.type) {
                    case TYPES.BOX:
                    case TYPES.MESH:
                        handleRigidbodyUpdate(element, dt);
                        break;
                    case TYPES.PLAYER:
                        handlePlayerUpdate(element, dt);
                        break;
                    case TYPES.VEHICLE:
                        handleVehicleUpdate(element, dt);
                        break;
                    default:
                        break;
                }
            });

        dispatcher.sendPhysicsUpdate(dt);
    }

    setBody = data => {
        this.elements[data.uuid] = data;
    }

    updateBodyState = (uuid, state) => {
        this.elements[uuid].state = {
            ...this.elements[uuid].state,
            ...state
        };
    }

    terminate = () => {
        Ammo.destroy(this.ammoWorld);
        Ammo.destroy(this.solver);
        Ammo.destroy(this.dispatcher);
        Ammo.destroy(this.collisionConfiguration);

        dispatcher.sendTerminateEvent();
    }
};

export default new World();