import { COLLIDER_TYPES } from "../../constants";

// world.js reads `self.requestAnimationFrame` at module load (it runs in a
// WebWorker at runtime). Provide a `self` before requiring it under node/jest.
let resolveChildUuid;
beforeAll(() => {
    global.self = global;
    resolveChildUuid = require("../world").resolveChildUuid;
});

// Ammo hands contact points to us as btVector3s (accessed via .x()/.y()/.z()).
const vec = (x, y, z) => ({ x: () => x, y: () => y, z: () => z });

const identityQ = { x: 0, y: 0, z: 0, w: 1 };
const floorChild = {
    uuid: "floor",
    colliderType: COLLIDER_TYPES.BOX,
    localPosition: { x: 0, y: 0, z: 0 },
    localQuaternion: identityQ,
    halfExtents: { x: 5, y: 0.5, z: 5 },
    radius: 0.5,
};
const wallChild = {
    uuid: "wall",
    colliderType: COLLIDER_TYPES.BOX,
    localPosition: { x: 4, y: 2.5, z: 0 },
    localQuaternion: identityQ,
    halfExtents: { x: 0.5, y: 2, z: 5 },
    radius: 0.5,
};
const childMap = [floorChild, wallChild];

describe("resolveChildUuid", () => {
    it("returns the body's own uuid for a plain (non-compound) body", () => {
        expect(resolveChildUuid({ uuid: "sphere" }, vec(0, 0, 0))).toBe("sphere");
    });

    it("resolves a contact against the wall face to the wall child", () => {
        expect(resolveChildUuid({ uuid: "floor", childMap }, vec(3.5, 2.5, 0))).toBe("wall");
    });

    it("resolves a contact on the floor surface to the floor child", () => {
        expect(resolveChildUuid({ uuid: "floor", childMap }, vec(0, 0.5, 0))).toBe("floor");
    });

    it("returns the only child's uuid without inspecting the point", () => {
        expect(resolveChildUuid({ uuid: "floor", childMap: [wallChild] }, vec(0, 0, 0))).toBe(
            "wall",
        );
    });

    it("resolves a rotated child's contact using its local quaternion", () => {
        // Wall rotated 90° about Y: its local +x half-extent now spans local ±z.
        const rotatedWall = {
            ...wallChild,
            localPosition: { x: 0, y: 2.5, z: 0 },
            localQuaternion: { x: 0, y: Math.SQRT1_2, z: 0, w: Math.SQRT1_2 },
        };
        const map = [floorChild, rotatedWall];
        // A point 0.4 along local z is inside the rotated wall (half-extent 0.5
        // on what is now the z axis) but far outside the floor's thin y slab.
        expect(resolveChildUuid({ uuid: "floor", childMap: map }, vec(0, 2.5, 0.4))).toBe("wall");
    });
});
