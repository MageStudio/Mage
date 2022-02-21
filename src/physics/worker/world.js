import {
    GRAVITY,
    TYPES
} from '../constants';

import { handleElementUpdate } from './elements';
import { handleVehicleUpdate } from './vehicles';
import { handlePlayerUpdate } from './player';

import dispatcher from './lib/dispatcher';
import { PHYSICS_EVENTS } from '../messages';

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
        this.dynamicsWorld = undefined;

        this.requestAnimationFrameId = null;
        this.clock = new Clock();
    }

    init = (options) => {
        const { gravity = GRAVITY } = options;

        this.collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
        this.dispatcher = new Ammo.btCollisionDispatcher(this.collisionConfiguration);
        this.broadphase = new Ammo.btDbvtBroadphase();
        this.solver = new Ammo.btSequentialImpulseConstraintSolver();
        this.dynamicsWorld = new Ammo.btDiscreteDynamicsWorld(this.dispatcher, this.broadphase, this.solver, this.collisionConfiguration);
        this.dynamicsWorld.setGravity(new Ammo.btVector3(gravity.x, gravity.y, gravity.z));

        // this is needed for ghostObject collisions
        this.dynamicsWorld
            .getBroadphase()
            .getOverlappingPairCache()
            .setInternalGhostPairCallback(new Ammo.btGhostPairCallback())

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

    getDynamicsWorld = () => this.dynamicsWorld;

    addRigidBody = body => {
        this.dynamicsWorld.addRigidBody(body);
    }

    addAction = action => {
        this.dynamicsWorld.addAction(action);
    }

    addCollisionObject = collisionObject => {
        this.dynamicsWorld.addCollisionObject(collisionObject);
    }

    stepSimulation = dt => {
        this.dynamicsWorld.stepSimulation(dt);
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
                            handleElementUpdate(element, dt);
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
        let ammoDispatcher = this.dynamicsWorld.getDispatcher();
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

            dispatcher.sendDispatchEvent(rb0.uuid, PHYSICS_EVENTS.ELEMENT.COLLISION, { contacts });
            dispatcher.sendDispatchEvent(rb1.uuid, PHYSICS_EVENTS.ELEMENT.COLLISION, { contacts });
        }
    }

    addElement = data => {
        this.elements[data.uuid] = data;
    }

    updateBodyState = ({ uuid, state }) => {
        if (this.hasElement(uuid)) {
            this.elements[uuid].state = {
                ...this.elements[uuid].state,
                ...state
            };
        }
    }

    disposeBody({ uuid }) {
        const element = this.getElement(uuid);
        this.dynamicsWorld.removeRigidBody(element.body);
        this.removeElement(uuid);

        dispatcher.sendElementDisposed({ uuid });
    }

    terminate = () => {
        Ammo.destroy(this.dynamicsWorld);
        Ammo.destroy(this.solver);
        Ammo.destroy(this.dispatcher);
        Ammo.destroy(this.collisionConfiguration);

        cancelAnimationFrame(this.requestAnimationFrameId);

        dispatcher.sendTerminateEvent();
    }
};


export default new World();