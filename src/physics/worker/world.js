import {
    GRAVITY,
    TYPES
} from '../constants';

import { handleRigidbodyUpdate } from './bodies';
import { handleVehicleUpdate } from './vehicles';

import dispatcher from './lib/dispatcher';
import { handlePlayerUpdate } from './player';
import { COLLISION_DETECTION_EVENT } from '../messages';

class Clock {

    constructor() {
        this.timestamp = null;
    }

    getDelta() {
        const time = Date.now();
        if (this.timestamp) {
            const delta = time - this.timestamp;
            this.timestamp = time;

            return delta;
        } else {
            this.timestamp = time;

            return 0;
        }
    }
}
export class World {

    constructor() {
        this.elements = {};
        this.initialised = false;

        this.collisionConfiguration = undefined;
        this.dispatcher = undefined;
        this.broadphase = undefined;
        this.solver = undefined;
        this.ammoWorld = undefined;

        this.requestAnimationFrameId = null;
        this.clock = new Clock();
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

    removeElement = uuid => {
        if (this.hasElement(uuid)) {
            this.elements[uuid].deleted = true;
        }
    }

    removeDeletedElements = () => (
        Object
            .keys(this.elements)
            .filter(uuid => this.elements[uuid].deleted)
            .forEach(uuid => {
                delete this.elements[uuid];
            })
    );

    hasElement = uuid => {
        return Object.keys(this.elements).includes(uuid);
    }

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

    simulate = () => {
        const dt = this.clock.getDelta();
        this.stepSimulation(dt);

        Object
            .keys(this.elements)
            .forEach(uuid => {
                const element = this.getElement(uuid);

                if (element) {
                    switch(element.type) {
                        case TYPES.BOX:
                        case TYPES.SPHERE:
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
                }
            });

        this.calculateCollisions();
        this.removeDeletedElements();

        dispatcher.sendPhysicsUpdate(dt);

        this.requestAnimationFrameId = requestAnimationFrame(this.simulate.bind(this));
    }

    calculateCollisions = () => {
        let ammoDispatcher = this.ammoWorld.getDispatcher();
        let numManifolds = ammoDispatcher.getNumManifolds();

        for (let i = 0; i < numManifolds; i++) {

            let contactManifold = ammoDispatcher.getManifoldByIndexInternal(i);

            let rb0 = Ammo.castObject(contactManifold.getBody0(), Ammo.btRigidBody);
            let rb1 = Ammo.castObject(contactManifold.getBody1(), Ammo.btRigidBody);
            
            let numContacts = contactManifold.getNumContacts();

            // this iteration doesn't have uuids
            if (!rb0.uuid || !rb1.uuid) continue;

            let contacts = [];

            for (let j = 0; j < numContacts; j++) {

                let contactPoint = contactManifold.getContactPoint(j);
                let distance = contactPoint.getDistance();

                if( distance > 0.0) continue;

                let velocity0 = rb0.getLinearVelocity();
                let velocity1 = rb1.getLinearVelocity();
                let worldPos0 = contactPoint.get_m_positionWorldOnA();
                let worldPos1 = contactPoint.get_m_positionWorldOnB();
                let localPos0 = contactPoint.get_m_localPointA();
                let localPos1 = contactPoint.get_m_localPointB();

                contacts.push({
                    distance,
                    elements:[
                        {
                            uuid: rb0.uuid,
                            velocity: { x: velocity0.x(), y: velocity0.y(), z: velocity0.z() },
                            worldPos: { x: worldPos0.x(), y: worldPos0.y(), z: worldPos0.z() },
                            localPos: { x: localPos0.x(), y: localPos0.y(), z: localPos0.z() }
                        },
                        {
                            uuid: rb1.uuid,
                            velocity: { x: velocity1.x(), y: velocity1.y(), z: velocity1.z() },
                            worldPos: { x: worldPos1.x(), y: worldPos1.y(), z: worldPos1.z() },
                            localPos: { x: localPos1.x(), y: localPos1.y(), z: localPos1.z() }
                        }
                    ]
                });
            }

            dispatcher.sendDispatchEvent(rb0.uuid, COLLISION_DETECTION_EVENT, { contacts });
            dispatcher.sendDispatchEvent(rb1.uuid, COLLISION_DETECTION_EVENT, { contacts });

            // Ammo.destroy(rb0);
            // Ammo.destroy(rb1);
        }
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

    disposeBody(uuid) {
        const element = this.getElement(uuid);
        this.ammoWorld.removeRigidBody(element.body);
        this.removeElement(uuid);
    }

    terminate = () => {
        Ammo.destroy(this.ammoWorld);
        Ammo.destroy(this.solver);
        Ammo.destroy(this.dispatcher);
        Ammo.destroy(this.collisionConfiguration);

        cancelAnimationFrame(this.requestAnimationFrameId);

        dispatcher.sendTerminateEvent();
    }
};

export default new World();