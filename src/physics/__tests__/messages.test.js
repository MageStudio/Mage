import { PHYSICS_EVENTS } from "../messages";

describe("physics/messages.js", () => {
    test("has top-level events", () => {
        expect(PHYSICS_EVENTS.DISPATCH).toBeDefined();
        expect(PHYSICS_EVENTS.TERMINATE).toBeDefined();
        expect(PHYSICS_EVENTS.READY).toBeDefined();
        expect(PHYSICS_EVENTS.INIT).toBeDefined();
        expect(PHYSICS_EVENTS.UPDATE).toBeDefined();
    });

    describe("LOAD events", () => {
        test("has AMMO load event", () => {
            expect(PHYSICS_EVENTS.LOAD.AMMO).toBeDefined();
        });
    });

    describe("ADD events", () => {
        test("has events for each addable type", () => {
            expect(PHYSICS_EVENTS.ADD.BOX).toBeDefined();
            expect(PHYSICS_EVENTS.ADD.VEHICLE).toBeDefined();
            expect(PHYSICS_EVENTS.ADD.MODEL).toBeDefined();
            expect(PHYSICS_EVENTS.ADD.PLAYER).toBeDefined();
            expect(PHYSICS_EVENTS.ADD.SPHERE).toBeDefined();
        });
    });

    describe("ELEMENT events", () => {
        test("has CRUD events", () => {
            expect(PHYSICS_EVENTS.ELEMENT.DISPOSE).toBeDefined();
            expect(PHYSICS_EVENTS.ELEMENT.COLLISION).toBeDefined();
            expect(PHYSICS_EVENTS.ELEMENT.UPDATE).toBeDefined();
            expect(PHYSICS_EVENTS.ELEMENT.CREATED).toBeDefined();
        });

        test("has SET sub-events", () => {
            expect(PHYSICS_EVENTS.ELEMENT.SET.POSITION).toBeDefined();
            expect(PHYSICS_EVENTS.ELEMENT.SET.QUATERNION).toBeDefined();
            expect(PHYSICS_EVENTS.ELEMENT.SET.LINEAR_VELOCITY).toBeDefined();
        });

        test("has RESET event", () => {
            expect(PHYSICS_EVENTS.ELEMENT.RESET).toBeDefined();
        });

        test("has APPLY.IMPULSE event", () => {
            expect(PHYSICS_EVENTS.ELEMENT.APPLY.IMPULSE).toBeDefined();
        });
    });

    describe("VEHICLE events", () => {
        test("has SET sub-events", () => {
            expect(PHYSICS_EVENTS.VEHICLE.SET.POSITION).toBeDefined();
            expect(PHYSICS_EVENTS.VEHICLE.SET.QUATERNION).toBeDefined();
        });

        test("has RESET, SPEED, DIRECTION", () => {
            expect(PHYSICS_EVENTS.VEHICLE.RESET).toBeDefined();
            expect(PHYSICS_EVENTS.VEHICLE.SPEED).toBeDefined();
            expect(PHYSICS_EVENTS.VEHICLE.DIRECTION).toBeDefined();
        });
    });

    describe("EFFECTS events", () => {
        test("has EXPLOSION event", () => {
            expect(PHYSICS_EVENTS.EFFECTS.EXPLOSION).toBeDefined();
        });
    });

    test("all event values are strings", () => {
        const flatten = obj => {
            const result = [];
            for (const val of Object.values(obj)) {
                if (typeof val === "string") result.push(val);
                else if (typeof val === "object") result.push(...flatten(val));
            }
            return result;
        };
        const allEvents = flatten(PHYSICS_EVENTS);
        allEvents.forEach(e => expect(typeof e).toBe("string"));
    });

    test("all event values are unique", () => {
        const flatten = obj => {
            const result = [];
            for (const val of Object.values(obj)) {
                if (typeof val === "string") result.push(val);
                else if (typeof val === "object") result.push(...flatten(val));
            }
            return result;
        };
        const allEvents = flatten(PHYSICS_EVENTS);
        expect(new Set(allEvents).size).toBe(allEvents.length);
    });
});
