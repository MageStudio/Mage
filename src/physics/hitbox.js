import { Vector3 } from "three";
import Box from "../entities/base/Box";
import Sphere from "../entities/base/Sphere";
import { COLLIDER_TYPES } from "./constants";

const HIT_BOX_COLOR = 0xf368e0;
const HIT_BOX_INCREASE = 0.03;

const DEFAULT_HITBOX_OPTIONS = {
    shadowsEnabled: false,
};

export const getBoxHitbox = element => {
    const opts = element.getPhysicsOptions() || {};
    let w, h, l;

    if (opts.colliderWidth != null || opts.colliderHeight != null || opts.colliderLength != null) {
        w = (opts.colliderWidth ?? 1) + HIT_BOX_INCREASE;
        h = (opts.colliderHeight ?? 1) + HIT_BOX_INCREASE;
        l = (opts.colliderLength ?? 1) + HIT_BOX_INCREASE;
    } else {
        const size = new Vector3();
        element.boundingBox.getSize(size);
        w = size.x + HIT_BOX_INCREASE;
        h = size.y + HIT_BOX_INCREASE;
        l = size.z + HIT_BOX_INCREASE;
    }

    const box = new Box(w, h, l, HIT_BOX_COLOR, DEFAULT_HITBOX_OPTIONS);

    box.setWireframe(true);
    box.setWireframeLineWidth(2);

    return box;
};

export const getSphereHitbox = element => {
    const opts = element.getPhysicsOptions() || {};
    const radius =
        opts.colliderRadius != null ? opts.colliderRadius : element.boundingSphere.radius;
    const sphere = new Sphere(radius, HIT_BOX_COLOR, DEFAULT_HITBOX_OPTIONS);

    sphere.setWireframe(true);
    sphere.setWireframeLineWidth(2);

    return sphere;
};

export const mapColliderTypeToHitbox = (colliderType = COLLIDER_TYPES.BOX) =>
    ({
        [COLLIDER_TYPES.BOX]: getBoxHitbox,
        [COLLIDER_TYPES.SPHERE]: getSphereHitbox,
    })[colliderType] || getBoxHitbox;

export const addHitBox = element => {
    const colliderType = element.getPhysicsOptions("colliderType");
    const getHitbox = mapColliderTypeToHitbox(colliderType);

    element.add(getHitbox(element));
};
