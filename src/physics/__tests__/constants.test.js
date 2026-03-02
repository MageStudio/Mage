import {
    LIBRARY_NAME,
    TYPES,
    COLLIDER_TYPES,
    DEFAULT_VEHICLE_STATE,
    DEFAULT_RIGIDBODY_STATE,
    DEFAULT_SCALE,
    DEFAULT_QUATERNION,
    DEFAULT_POSITION,
    DEFAULT_LINEAR_VELOCITY,
    DEFAULT_ANGULAR_VELOCITY,
    DEFAULT_IMPULSE,
    DISABLE_DEACTIVATION,
    GRAVITY,
    FRONT_LEFT,
    FRONT_RIGHT,
    BACK_LEFT,
    BACK_RIGHT,
    DEFAULT_STEERING_INCREMENT,
    DEFAULT_STEERING_CLAMP,
    DEFAULT_MAX_ENGINE_FORCE,
    DEFAULT_MAX_BREAKING_FORCE,
    EXPLOSION_SIZES,
    EXPLOSION_STRENGTHS,
} from "../constants";

describe("physics/constants.js", () => {
    test("LIBRARY_NAME is ammo.js", () => {
        expect(LIBRARY_NAME).toBe("ammo.js");
    });

    describe("TYPES", () => {
        test("has all physics body types", () => {
            expect(TYPES.BOX).toBe("BOX");
            expect(TYPES.SPHERE).toBe("SPHERE");
            expect(TYPES.VEHICLE).toBe("VEHICLE");
            expect(TYPES.MESH).toBe("MESH");
            expect(TYPES.PLAYER).toBe("PLAYER");
        });
    });

    describe("COLLIDER_TYPES", () => {
        test("has all collider types", () => {
            expect(COLLIDER_TYPES.BOX).toBe("BOX");
            expect(COLLIDER_TYPES.SPHERE).toBe("SPHERE");
            expect(COLLIDER_TYPES.VEHICLE).toBe("VEHICLE");
            expect(COLLIDER_TYPES.PLAYER).toBe("PLAYER");
        });
    });

    describe("DEFAULT_VEHICLE_STATE", () => {
        test("has correct defaults", () => {
            expect(DEFAULT_VEHICLE_STATE.vehicleSteering).toBe(0);
            expect(DEFAULT_VEHICLE_STATE.acceleration).toBe(false);
            expect(DEFAULT_VEHICLE_STATE.breaking).toBe(false);
            expect(DEFAULT_VEHICLE_STATE.right).toBe(false);
            expect(DEFAULT_VEHICLE_STATE.left).toBe(false);
        });
    });

    describe("DEFAULT_RIGIDBODY_STATE", () => {
        test("has zero velocity", () => {
            expect(DEFAULT_RIGIDBODY_STATE.velocity).toEqual({ x: 0, y: 0, z: 0 });
        });

        test("has no movement", () => {
            expect(DEFAULT_RIGIDBODY_STATE.movement.forward).toBe(false);
            expect(DEFAULT_RIGIDBODY_STATE.movement.backwards).toBe(false);
        });

        test("has zero direction", () => {
            expect(DEFAULT_RIGIDBODY_STATE.direction).toEqual({ x: 0, y: 0, z: 0 });
        });
    });

    describe("default vectors", () => {
        test("DEFAULT_SCALE is (1,1,1)", () => {
            expect(DEFAULT_SCALE).toEqual({ x: 1, y: 1, z: 1 });
        });

        test("DEFAULT_QUATERNION is identity", () => {
            expect(DEFAULT_QUATERNION).toEqual({ x: 0, y: 0, z: 0, w: 1 });
        });

        test("DEFAULT_POSITION is origin", () => {
            expect(DEFAULT_POSITION).toEqual({ x: 0, y: 0, z: 0 });
        });

        test("DEFAULT_LINEAR_VELOCITY is zero", () => {
            expect(DEFAULT_LINEAR_VELOCITY).toEqual({ x: 0, y: 0, z: 0 });
        });

        test("DEFAULT_ANGULAR_VELOCITY is zero", () => {
            expect(DEFAULT_ANGULAR_VELOCITY).toEqual({ x: 0, y: 0, z: 0 });
        });

        test("DEFAULT_IMPULSE is zero", () => {
            expect(DEFAULT_IMPULSE).toEqual({ x: 0, y: 0, z: 0 });
        });
    });

    test("DISABLE_DEACTIVATION is 4", () => {
        expect(DISABLE_DEACTIVATION).toBe(4);
    });

    test("GRAVITY points down", () => {
        expect(GRAVITY.y).toBeLessThan(0);
        expect(GRAVITY.x).toBe(0);
        expect(GRAVITY.z).toBe(0);
    });

    describe("wheel constants", () => {
        test("has four wheel positions", () => {
            expect(FRONT_LEFT).toBe(0);
            expect(FRONT_RIGHT).toBe(1);
            expect(BACK_LEFT).toBe(2);
            expect(BACK_RIGHT).toBe(3);
        });
    });

    describe("vehicle defaults", () => {
        test("steering values are positive numbers", () => {
            expect(DEFAULT_STEERING_INCREMENT).toBeGreaterThan(0);
            expect(DEFAULT_STEERING_CLAMP).toBeGreaterThan(0);
        });

        test("engine force is a positive number", () => {
            expect(DEFAULT_MAX_ENGINE_FORCE).toBeGreaterThan(0);
        });

        test("breaking force is a positive number", () => {
            expect(DEFAULT_MAX_BREAKING_FORCE).toBeGreaterThan(0);
        });
    });

    describe("EXPLOSION_SIZES", () => {
        test("has increasing sizes", () => {
            expect(EXPLOSION_SIZES.SMALL).toBeLessThan(EXPLOSION_SIZES.MEDIUM);
            expect(EXPLOSION_SIZES.MEDIUM).toBeLessThan(EXPLOSION_SIZES.LARGE);
            expect(EXPLOSION_SIZES.LARGE).toBeLessThan(EXPLOSION_SIZES.MASSIVE);
        });
    });

    describe("EXPLOSION_STRENGTHS", () => {
        test("has increasing strengths", () => {
            expect(EXPLOSION_STRENGTHS.VERY_WEAK).toBeLessThan(EXPLOSION_STRENGTHS.WEAK);
            expect(EXPLOSION_STRENGTHS.WEAK).toBeLessThan(EXPLOSION_STRENGTHS.MEDIUM);
            expect(EXPLOSION_STRENGTHS.MEDIUM).toBeLessThan(EXPLOSION_STRENGTHS.LARGE);
            expect(EXPLOSION_STRENGTHS.LARGE).toBeLessThan(EXPLOSION_STRENGTHS.MASSIVE);
            expect(EXPLOSION_STRENGTHS.MASSIVE).toBeLessThan(EXPLOSION_STRENGTHS.OK_NO);
        });
    });
});
