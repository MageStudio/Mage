import { Matrix4, MeshBasicMaterial, Vector3 } from "three";
import { ConvexGeometry } from "three/examples/jsm/geometries/ConvexGeometry.js";
import Box from "../entities/base/Box";
import Sphere from "../entities/base/Sphere";
import Element from "../entities/Element";
import { COLLIDER_TYPES } from "./constants";
import { getWorldBoundingBoxSize, getWorldBoundingSphereRadius } from "./utils";

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
        const size = getWorldBoundingBoxSize(element.getBody());

        if (size) {
            w = size.width + HIT_BOX_INCREASE;
            h = size.height + HIT_BOX_INCREASE;
            l = size.length + HIT_BOX_INCREASE;
        } else {
            const fallback = new Vector3();
            element.boundingBox.getSize(fallback);
            w = fallback.x + HIT_BOX_INCREASE;
            h = fallback.y + HIT_BOX_INCREASE;
            l = fallback.z + HIT_BOX_INCREASE;
        }
    }

    const box = new Box(w, h, l, HIT_BOX_COLOR, DEFAULT_HITBOX_OPTIONS);

    box.setWireframe(true);
    box.setWireframeLineWidth(2);

    return box;
};

export const getSphereHitbox = element => {
    const opts = element.getPhysicsOptions() || {};
    const radius =
        opts.colliderRadius ??
        getWorldBoundingSphereRadius(element.getBody()) ??
        element.boundingSphere.radius;

    const sphere = new Sphere(radius, HIT_BOX_COLOR, DEFAULT_HITBOX_OPTIONS);

    sphere.setWireframe(true);
    sphere.setWireframeLineWidth(2);

    return sphere;
};

// Vertices of every mesh under `body`, in the body's OWN local frame. The
// hitbox is added as a child of the element, so it inherits the element's
// position/rotation/scale — the points must therefore exclude them, which is
// why this uses inverse(body.matrixWorld) rather than the collider's world
// frame.
const collectLocalPoints = body => {
    body.updateWorldMatrix(true, true);

    const toLocal = new Matrix4().copy(body.matrixWorld).invert();
    const points = [];
    const vertex = new Vector3();

    body.traverse(obj => {
        const position =
            obj.geometry && obj.geometry.attributes && obj.geometry.attributes.position;
        if (!position) return;

        const matrix = toLocal.clone().multiply(obj.matrixWorld);
        for (let i = 0; i < position.count; i++) {
            points.push(vertex.fromBufferAttribute(position, i).applyMatrix4(matrix).clone());
        }
    });

    return points;
};

// Draws the actual convex wrap rather than its bounding box — a hull that gets
// outlined as a box would hide exactly the discrepancy the author needs to see.
export const getHullHitbox = element => {
    const points = collectLocalPoints(element.getBody());

    if (points.length < 4) {
        return getBoxHitbox(element);
    }

    const hull = new Element({
        geometry: new ConvexGeometry(points),
        material: new MeshBasicMaterial({ color: HIT_BOX_COLOR }),
        ...DEFAULT_HITBOX_OPTIONS,
    });

    hull.setWireframe(true);
    hull.setWireframeLineWidth(2);

    return hull;
};

export const mapColliderTypeToHitbox = (colliderType = COLLIDER_TYPES.BOX) =>
    ({
        [COLLIDER_TYPES.BOX]: getBoxHitbox,
        [COLLIDER_TYPES.SPHERE]: getSphereHitbox,
        [COLLIDER_TYPES.HULL]: getHullHitbox,
    })[colliderType] || getBoxHitbox;

export const addHitBox = element => {
    const colliderType = element.getPhysicsOptions("colliderType");
    const getHitbox = mapColliderTypeToHitbox(colliderType);

    element.add(getHitbox(element));
};
