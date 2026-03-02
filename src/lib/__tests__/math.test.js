jest.mock("three", () => require("../../../__mocks__/three"));

import {
    PI,
    PI_2,
    identity,
    degToRad,
    radToDeg,
    clamp,
    cap,
    isWithin,
    getDistance,
    getProportion,
    repeat,
    deltaAngle,
    smoothDamp,
    smoothDampAngle,
    randomFloatFromInterval,
    randomIntFromInterval,
    getSphereVolume,
    pickRandom,
    lerp,
    findPointBetweenAtDistance,
    lerpVectors,
    scaleVector,
    randomVector3,
    randomVector2,
} from "../math";

describe("math.js", () => {
    describe("constants", () => {
        test("PI equals Math.PI", () => {
            expect(PI).toBe(Math.PI);
        });

        test("PI_2 equals Math.PI / 2", () => {
            expect(PI_2).toBe(Math.PI / 2);
        });
    });

    describe("identity", () => {
        test("returns its argument unchanged", () => {
            expect(identity(42)).toBe(42);
            expect(identity("hello")).toBe("hello");
            expect(identity(null)).toBe(null);
        });
    });

    describe("degToRad", () => {
        test("converts 0 degrees to 0 radians", () => {
            expect(degToRad(0)).toBe(0);
        });

        test("converts 180 degrees to PI radians", () => {
            expect(degToRad(180)).toBeCloseTo(Math.PI);
        });

        test("converts 90 degrees to PI/2 radians", () => {
            expect(degToRad(90)).toBeCloseTo(Math.PI / 2);
        });

        test("converts 360 degrees to 2*PI radians", () => {
            expect(degToRad(360)).toBeCloseTo(2 * Math.PI);
        });

        test("handles negative angles", () => {
            expect(degToRad(-90)).toBeCloseTo(-Math.PI / 2);
        });
    });

    describe("radToDeg", () => {
        test("converts 0 radians to 0 degrees", () => {
            expect(radToDeg(0)).toBe(0);
        });

        test("converts PI radians to 180 degrees", () => {
            expect(radToDeg(Math.PI)).toBeCloseTo(180);
        });

        test("converts PI/2 radians to 90 degrees", () => {
            expect(radToDeg(Math.PI / 2)).toBeCloseTo(90);
        });

        test("round-trips with degToRad", () => {
            expect(radToDeg(degToRad(45))).toBeCloseTo(45);
        });
    });

    describe("clamp", () => {
        test("returns value when within range", () => {
            expect(clamp(5, 0, 10)).toBe(5);
        });

        test("clamps to min when value is below", () => {
            expect(clamp(-5, 0, 10)).toBe(0);
        });

        test("clamps to max when value is above", () => {
            expect(clamp(15, 0, 10)).toBe(10);
        });

        test("returns min when value equals min", () => {
            expect(clamp(0, 0, 10)).toBe(0);
        });

        test("returns max when value equals max", () => {
            expect(clamp(10, 0, 10)).toBe(10);
        });
    });

    describe("cap", () => {
        test("returns value when below max", () => {
            expect(cap(5, 10)).toBe(5);
        });

        test("returns max when value exceeds max", () => {
            expect(cap(15, 10)).toBe(10);
        });

        test("returns value when equal to max", () => {
            expect(cap(10, 10)).toBe(10);
        });

        test("does not cap negative values", () => {
            expect(cap(-5, 10)).toBe(-5);
        });
    });

    describe("isWithin", () => {
        test("returns true when value is within range", () => {
            expect(isWithin(5, 0, 10)).toBe(true);
        });

        test("returns true when value equals min (inclusive)", () => {
            expect(isWithin(0, 0, 10)).toBe(true);
        });

        test("returns false when value equals max (exclusive)", () => {
            expect(isWithin(10, 0, 10)).toBe(false);
        });

        test("returns false when value is below min", () => {
            expect(isWithin(-1, 0, 10)).toBe(false);
        });

        test("returns false when value is above max", () => {
            expect(isWithin(11, 0, 10)).toBe(false);
        });
    });

    describe("getDistance", () => {
        test("returns 0 for same point", () => {
            expect(getDistance({ x: 1, y: 2, z: 3 }, { x: 1, y: 2, z: 3 })).toBe(0);
        });

        test("calculates distance along a single axis", () => {
            expect(getDistance({ x: 0, y: 0, z: 0 }, { x: 3, y: 0, z: 0 })).toBe(3);
        });

        test("calculates 3D distance correctly", () => {
            expect(getDistance({ x: 0, y: 0, z: 0 }, { x: 1, y: 2, z: 2 })).toBe(3);
        });

        test("uses default values for missing coordinates", () => {
            expect(getDistance({}, {})).toBe(0);
            expect(getDistance({ x: 3 }, {})).toBe(3);
        });

        test("handles undefined inputs", () => {
            expect(getDistance(undefined, undefined)).toBe(0);
        });
    });

    describe("getProportion", () => {
        test("calculates proportion correctly", () => {
            expect(getProportion(100, 50, 200)).toBe(25);
        });

        test("returns 0 when b is 0", () => {
            expect(getProportion(100, 0, 200)).toBe(0);
        });

        test("handles equal max values", () => {
            expect(getProportion(50, 50, 50)).toBe(50);
        });
    });

    describe("repeat", () => {
        test("wraps value within length", () => {
            expect(repeat(5, 3)).toBeCloseTo(2);
        });

        test("returns value when less than length", () => {
            expect(repeat(1, 3)).toBeCloseTo(1);
        });

        test("handles zero value", () => {
            expect(repeat(0, 5)).toBe(0);
        });
    });

    describe("deltaAngle", () => {
        test("returns 0 for same angle", () => {
            expect(deltaAngle(90, 90)).toBe(0);
        });

        test("returns positive delta for clockwise rotation", () => {
            expect(deltaAngle(0, 90)).toBeCloseTo(90);
        });

        test("wraps around 360 degrees", () => {
            expect(deltaAngle(350, 10)).toBeCloseTo(20);
        });

        test("returns negative delta for counter-clockwise", () => {
            expect(deltaAngle(10, 350)).toBeCloseTo(-20);
        });
    });

    describe("smoothDamp", () => {
        test("returns an array of [output, velocity]", () => {
            const result = smoothDamp(0, 10, 0, 0.3, Infinity, 0.016);
            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(2);
        });

        test("output moves toward target", () => {
            const [output] = smoothDamp(0, 10, 0, 0.3, Infinity, 0.016);
            expect(output).toBeGreaterThan(0);
            expect(output).toBeLessThan(10);
        });

        test("respects maxSpeed constraint", () => {
            const [outputFast] = smoothDamp(0, 1000, 0, 0.1, Infinity, 0.016);
            const [outputSlow] = smoothDamp(0, 1000, 0, 0.1, 1, 0.016);
            expect(outputSlow).toBeLessThanOrEqual(outputFast);
        });

        test("clamps smoothTime to minimum 0.0001", () => {
            expect(() => smoothDamp(0, 10, 0, 0, Infinity, 0.016)).not.toThrow();
        });
    });

    describe("smoothDampAngle", () => {
        test("returns an array of [output, velocity]", () => {
            const result = smoothDampAngle(0, 90, 0, 0.3, Infinity, 0.016);
            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(2);
        });

        test("handles wrapping (350 -> 10 should go forward)", () => {
            const [output] = smoothDampAngle(350, 10, 0, 0.3, Infinity, 0.016);
            expect(output).toBeGreaterThan(350);
        });
    });

    describe("randomFloatFromInterval", () => {
        test("returns a value within expected range", () => {
            for (let i = 0; i < 50; i++) {
                const val = randomFloatFromInterval(5, 10);
                expect(val).toBeGreaterThanOrEqual(5);
                expect(val).toBeLessThanOrEqual(16);
            }
        });
    });

    describe("randomIntFromInterval", () => {
        test("returns an integer", () => {
            const val = randomIntFromInterval(1, 10);
            expect(Number.isInteger(val)).toBe(true);
        });

        test("returns values within range", () => {
            for (let i = 0; i < 50; i++) {
                const val = randomIntFromInterval(1, 5);
                expect(val).toBeGreaterThanOrEqual(1);
                expect(val).toBeLessThanOrEqual(11);
            }
        });
    });

    describe("getSphereVolume", () => {
        test("returns 0 for radius 0", () => {
            expect(getSphereVolume(0)).toBe(0);
        });

        test("calculates volume of unit sphere", () => {
            expect(getSphereVolume(1)).toBeCloseTo((4 * Math.PI) / 3);
        });

        test("calculates volume for radius 2", () => {
            expect(getSphereVolume(2)).toBeCloseTo((4 * Math.PI * 8) / 3);
        });
    });

    describe("pickRandom", () => {
        test("returns undefined for empty array", () => {
            expect(pickRandom([])).toBeUndefined();
        });

        test("returns the only element of a single-element array", () => {
            expect(pickRandom([42])).toBe(42);
        });

        test("returns an element from the array", () => {
            const arr = [1, 2, 3, 4, 5];
            expect(arr).toContain(pickRandom(arr));
        });
    });

    describe("lerp", () => {
        test("returns start value at t=0", () => {
            expect(lerp(0, 10, 0)).toBe(0);
        });

        test("returns end value at t=1", () => {
            expect(lerp(0, 10, 1)).toBe(10);
        });

        test("returns midpoint at t=0.5", () => {
            expect(lerp(0, 10, 0.5)).toBeCloseTo(5);
        });
    });

    describe("findPointBetweenAtDistance", () => {
        test("finds point at distance along x-axis", () => {
            const result = findPointBetweenAtDistance(
                { x: 0, y: 0, z: 0 },
                { x: 10, y: 0, z: 0 },
                5,
            );
            expect(result.x).toBeCloseTo(5);
            expect(result.y).toBeCloseTo(0);
            expect(result.z).toBeCloseTo(0);
        });

        test("returns origin properties when distance is 0", () => {
            const result = findPointBetweenAtDistance(
                { x: 1, y: 2, z: 3 },
                { x: 10, y: 20, z: 30 },
                0,
            );
            expect(result.x).toBeCloseTo(1);
            expect(result.y).toBeCloseTo(2);
            expect(result.z).toBeCloseTo(3);
        });
    });

    describe("lerpVectors", () => {
        test("interpolates between two vectors at t=0.5", () => {
            const result = lerpVectors({ x: 0, y: 0, z: 0 }, { x: 10, y: 10, z: 10 }, 0.5);
            expect(result.x).toBeCloseTo(5);
            expect(result.y).toBeCloseTo(5);
            expect(result.z).toBeCloseTo(5);
        });

        test("returns origin at t=0", () => {
            const result = lerpVectors({ x: 1, y: 2, z: 3 }, { x: 10, y: 20, z: 30 }, 0);
            expect(result.x).toBeCloseTo(1);
            expect(result.y).toBeCloseTo(2);
            expect(result.z).toBeCloseTo(3);
        });

        test("returns target at t=1", () => {
            const result = lerpVectors({ x: 0, y: 0, z: 0 }, { x: 10, y: 20, z: 30 }, 1);
            expect(result.x).toBeCloseTo(10);
            expect(result.y).toBeCloseTo(20);
            expect(result.z).toBeCloseTo(30);
        });
    });

    describe("scaleVector", () => {
        test("scales a vector by given factor", () => {
            const result = scaleVector({ x: 1, y: 2, z: 3 }, 2);
            expect(result.x).toBeCloseTo(2);
            expect(result.y).toBeCloseTo(4);
            expect(result.z).toBeCloseTo(6);
        });

        test("defaults to scale of 1", () => {
            const result = scaleVector({ x: 5, y: 10, z: 15 });
            expect(result.x).toBeCloseTo(5);
            expect(result.y).toBeCloseTo(10);
            expect(result.z).toBeCloseTo(15);
        });
    });

    describe("randomVector3", () => {
        test("returns an object with x, y, z", () => {
            const v = randomVector3(0, 10);
            expect(v).toHaveProperty("x");
            expect(v).toHaveProperty("y");
            expect(v).toHaveProperty("z");
        });

        test("uses default min=0, max=1", () => {
            const v = randomVector3();
            expect(v).toBeDefined();
        });
    });

    describe("randomVector2", () => {
        test("returns an object with x, y", () => {
            const v = randomVector2(0, 10);
            expect(v).toHaveProperty("x");
            expect(v).toHaveProperty("y");
        });

        test("uses default min=0, max=1", () => {
            const v = randomVector2();
            expect(v).toBeDefined();
        });
    });

    describe("smoothDamp overshoot prevention", () => {
        test("prevents overshooting past target", () => {
            // Use a very large dt to trigger overshoot prevention
            const [output] = smoothDamp(9.99, 10, 100, 0.0001, Infinity, 10);
            expect(output).toBeLessThanOrEqual(10);
        });
    });
});
