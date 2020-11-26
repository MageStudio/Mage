import { createRigidBody } from './bodies';
import world from './world';

import {
    TYPES,
    DEFAULT_RIGIDBODY_STATE
} from '../constants';

export const addPlayer = (data) => {
    const { uuid, width, height, position, quaternion, mass, friction } = data;

    const capsule = new Ammo.btCapsuleShape(width, height);
    const body = createRigidBody(capsule, { position, quaternion, mass, friction });

    // disabliing rotation for collisions
    body.setAngularFactor(0);

    world.addRigidBody(body);
    world.setBody({ uuid, body, type: TYPES.PLAYER, state: DEFAULT_RIGIDBODY_STATE });
};