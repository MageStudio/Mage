jest.mock("three", () => require("../../../__mocks__/three"));
jest.mock("../../lib/math", () => ({
    getSphereVolume: jest.fn(r => (4 / 3) * Math.PI * r * r * r),
}));
jest.mock("../../lib/messages", () => ({
    BOUNDINGBOX_NOT_AVAILABLE: "bounding box not available",
}));

import {
    DEFAULT_DESCRIPTION,
    mapColliderTypeToAddEvent,
    parseBoundingBoxSize,
    convertAmmoVector,
    extractPositionAndQuaternion,
} from "../utils";
import { COLLIDER_TYPES } from "../constants";
import { PHYSICS_EVENTS } from "../messages";

describe("physics/utils.js", () => {
    describe("DEFAULT_DESCRIPTION", () => {
        test("has mass of 0", () => {
            expect(DEFAULT_DESCRIPTION.mass).toBe(0);
        });

        test("has friction of 1", () => {
            expect(DEFAULT_DESCRIPTION.friction).toBe(1);
        });

        test("has default quaternion and position", () => {
            expect(DEFAULT_DESCRIPTION.quaternion).toBeDefined();
            expect(DEFAULT_DESCRIPTION.position).toBeDefined();
        });
    });

    describe("mapColliderTypeToAddEvent", () => {
        test("maps BOX to ADD.BOX event", () => {
            expect(mapColliderTypeToAddEvent(COLLIDER_TYPES.BOX)).toBe(PHYSICS_EVENTS.ADD.BOX);
        });

        test("maps SPHERE to ADD.SPHERE event", () => {
            expect(mapColliderTypeToAddEvent(COLLIDER_TYPES.SPHERE)).toBe(
                PHYSICS_EVENTS.ADD.SPHERE,
            );
        });

        test("maps VEHICLE to ADD.VEHICLE event", () => {
            expect(mapColliderTypeToAddEvent(COLLIDER_TYPES.VEHICLE)).toBe(
                PHYSICS_EVENTS.ADD.VEHICLE,
            );
        });

        test("maps PLAYER to ADD.PLAYER event", () => {
            expect(mapColliderTypeToAddEvent(COLLIDER_TYPES.PLAYER)).toBe(
                PHYSICS_EVENTS.ADD.PLAYER,
            );
        });

        test("defaults to ADD.BOX for unknown type", () => {
            expect(mapColliderTypeToAddEvent("UNKNOWN")).toBe(PHYSICS_EVENTS.ADD.BOX);
        });
    });

    describe("parseBoundingBoxSize", () => {
        test("returns size from bounding box getSize", () => {
            const mockBoundingBox = {
                getSize: jest.fn(v => {
                    v.x = 2;
                    v.y = 3;
                    v.z = 4;
                }),
            };
            const result = parseBoundingBoxSize(mockBoundingBox);
            expect(result).toEqual({ x: 2, y: 3, z: 4 });
        });

        test("returns default (1,1,1) when getSize fails", () => {
            const logSpy = jest.spyOn(console, "log").mockImplementation();
            const result = parseBoundingBoxSize({});
            expect(result).toEqual({ x: 1, y: 1, z: 1 });
            logSpy.mockRestore();
        });

        test("returns default when called with no argument", () => {
            const logSpy = jest.spyOn(console, "log").mockImplementation();
            const result = parseBoundingBoxSize();
            expect(result).toEqual({ x: 1, y: 1, z: 1 });
            logSpy.mockRestore();
        });
    });

    describe("convertAmmoVector", () => {
        test("swaps x and z axes", () => {
            const result = convertAmmoVector({ x: 1, y: 2, z: 3 });
            expect(result).toEqual({ x: 3, y: 2, z: 1 });
        });

        test("handles zero vector", () => {
            const result = convertAmmoVector({ x: 0, y: 0, z: 0 });
            expect(result).toEqual({ x: 0, y: 0, z: 0 });
        });
    });

    describe("extractPositionAndQuaternion", () => {
        test("extracts position and quaternion from element", () => {
            const element = {
                getPosition: () => ({ x: 1, y: 2, z: 3 }),
                getQuaternion: () => ({ x: 0, y: 0, z: 0, w: 1 }),
            };
            const result = extractPositionAndQuaternion(element);
            expect(result.position).toEqual({ x: 1, y: 2, z: 3 });
            expect(result.quaternion).toEqual({ x: 0, y: 0, z: 0, w: 1 });
        });
    });
});
