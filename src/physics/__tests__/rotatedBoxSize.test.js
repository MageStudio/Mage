// Uses REAL three (no three mock) to exercise the actual geometry measurement.
import { Mesh, BoxGeometry, Quaternion, Euler, Vector3 } from "three";

import {
    getUnrotatedWorldBoxSize,
    getWorldBoundingBoxSize,
    getBoxDescriptionForElement,
} from "../utils";

const near = (a, b, eps = 1e-2) => Math.abs(a - b) < eps;

// Minimal element wrapping a real Mesh, exposing the surface the box
// description path uses.
const makeElement = body => ({
    getBody: () => body,
    getScale: () => ({ x: body.scale.x, y: body.scale.y, z: body.scale.z }),
    getPosition: () => ({ x: body.position.x, y: body.position.y, z: body.position.z }),
    getQuaternion: () => body.quaternion.clone(),
    boundingBox: undefined,
});

describe("rotated single-box collider sizing", () => {
    // A thin, long slab like an editor platform, tilted 20° about X.
    const makeTiltedSlab = () => {
        const body = new Mesh(new BoxGeometry(1, 1, 1));
        body.scale.set(2.835, 1, 21.53);
        body.quaternion.setFromEuler(new Euler(0.3553, 0, 0));
        body.updateMatrixWorld(true);
        return body;
    };

    it("measures the TRUE extents with rotation removed, not the inflated AABB", () => {
        const body = makeTiltedSlab();

        // The old world-AABB path inflates the thin slab's height (1 -> ~8.4).
        const inflated = getWorldBoundingBoxSize(body);
        expect(inflated.height).toBeGreaterThan(5);

        // The un-rotated measurement recovers the real slab dimensions.
        const size = getUnrotatedWorldBoxSize(body);
        expect(near(size.width, 2.835)).toBe(true);
        expect(near(size.height, 1)).toBe(true);
        expect(near(size.length, 21.53)).toBe(true);
    });

    it("getBoxDescriptionForElement sizes a tilted box by its true footprint", () => {
        const body = makeTiltedSlab();
        const desc = getBoxDescriptionForElement(makeElement(body));

        expect(near(desc.width, 2.835)).toBe(true);
        expect(near(desc.height, 1)).toBe(true);
        expect(near(desc.length, 21.53)).toBe(true);

        // Quaternion is carried so the (correctly sized) box is oriented.
        const q = new Quaternion().setFromEuler(new Euler(0.3553, 0, 0));
        expect(near(desc.quaternion.x, q.x)).toBe(true);
        expect(near(desc.quaternion.w, q.w)).toBe(true);
    });

    it("leaves an axis-aligned box unchanged", () => {
        const body = new Mesh(new BoxGeometry(1, 1, 1));
        body.scale.set(4, 2, 8);
        body.updateMatrixWorld(true);

        const size = getUnrotatedWorldBoxSize(body);
        const world = getWorldBoundingBoxSize(body);
        // No rotation → un-rotated size equals the world AABB.
        expect(near(size.width, world.width)).toBe(true);
        expect(near(size.height, world.height)).toBe(true);
        expect(near(size.length, world.length)).toBe(true);
        expect(near(size.width, 4)).toBe(true);
        expect(near(size.height, 2)).toBe(true);
        expect(near(size.length, 8)).toBe(true);
    });

    it("returns null when there is no geometry", () => {
        const empty = new Mesh();
        empty.geometry = undefined;
        empty.updateMatrixWorld(true);
        // getWorldBoundingBoxSize handles the degenerate case; the un-rotated
        // variant reports null so callers fall back to the legacy path.
        expect(getUnrotatedWorldBoxSize(empty)).toBeNull();
        void Vector3;
    });
});
