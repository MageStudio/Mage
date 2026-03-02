import { applyMatrix4ToVector3 } from "../math";

describe("physics/worker/lib/math.js", () => {
    describe("applyMatrix4ToVector3", () => {
        test("identity matrix returns same vector", () => {
            // 4x4 identity matrix (column-major)
            const identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
            const result = applyMatrix4ToVector3({ x: 3, y: 5, z: 7 }, identity);
            expect(result.x).toBeCloseTo(3);
            expect(result.y).toBeCloseTo(5);
            expect(result.z).toBeCloseTo(7);
        });

        test("translation matrix offsets vector", () => {
            // Translation by (10, 20, 30) in column-major
            const translation = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 10, 20, 30, 1];
            const result = applyMatrix4ToVector3({ x: 0, y: 0, z: 0 }, translation);
            expect(result.x).toBeCloseTo(10);
            expect(result.y).toBeCloseTo(20);
            expect(result.z).toBeCloseTo(30);
        });

        test("scale matrix scales vector", () => {
            // Scale by 2 on all axes
            const scale = [2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1];
            const result = applyMatrix4ToVector3({ x: 1, y: 2, z: 3 }, scale);
            expect(result.x).toBeCloseTo(2);
            expect(result.y).toBeCloseTo(4);
            expect(result.z).toBeCloseTo(6);
        });

        test("defaults to zero vector when no coords provided", () => {
            const identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
            const result = applyMatrix4ToVector3({}, identity);
            expect(result.x).toBeCloseTo(0);
            expect(result.y).toBeCloseTo(0);
            expect(result.z).toBeCloseTo(0);
        });
    });
});
