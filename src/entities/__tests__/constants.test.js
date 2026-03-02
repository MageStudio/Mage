import {
    ENTITY_TYPES,
    FLAT_ENTITY_TYPES,
    FLAT_ENTITY_SUBTYPES,
    ENTITY_EVENTS,
    DEFAULT_TAG,
} from "../constants";

describe("entities/constants.js", () => {
    describe("ENTITY_TYPES", () => {
        const expectedCategories = [
            "SCENE",
            "CAMERA",
            "MESH",
            "LABEL",
            "LIGHT",
            "AUDIO",
            "MODEL",
            "SPRITE",
            "PARTICLE",
            "SCENERY",
            "HELPER",
        ];

        test("has all expected entity categories", () => {
            expectedCategories.forEach(cat => {
                expect(ENTITY_TYPES[cat]).toBeDefined();
            });
        });

        test("each category has TYPE and SUBTYPES", () => {
            expectedCategories.forEach(cat => {
                const entry = ENTITY_TYPES[cat];
                expect(entry.TYPE).toBeDefined();
                expect(entry.SUBTYPES).toBeDefined();
                expect(typeof entry.TYPE).toBe("string");
                expect(typeof entry.SUBTYPES).toBe("object");
            });
        });

        test("each category has at least one subtype", () => {
            expectedCategories.forEach(cat => {
                const subtypes = Object.keys(ENTITY_TYPES[cat].SUBTYPES);
                expect(subtypes.length).toBeGreaterThanOrEqual(1);
            });
        });

        test("has UNKNOWN type as string", () => {
            expect(ENTITY_TYPES.UNKNOWN).toBe("UNKNOWN");
        });

        test("MESH has expected subtypes", () => {
            const subtypes = ENTITY_TYPES.MESH.SUBTYPES;
            expect(subtypes.BOX).toBeDefined();
            expect(subtypes.SPHERE).toBeDefined();
            expect(subtypes.PLANE).toBeDefined();
            expect(subtypes.CYLINDER).toBeDefined();
        });

        test("LIGHT has expected subtypes", () => {
            const subtypes = ENTITY_TYPES.LIGHT.SUBTYPES;
            expect(subtypes.AMBIENT).toBeDefined();
            expect(subtypes.SUN).toBeDefined();
            expect(subtypes.POINT).toBeDefined();
            expect(subtypes.SPOT).toBeDefined();
        });

        test("PARTICLE has expected subtypes", () => {
            const subtypes = ENTITY_TYPES.PARTICLE.SUBTYPES;
            expect(subtypes.EMITTER).toBeDefined();
            expect(subtypes.SYSTEM).toBeDefined();
            expect(subtypes.EXPLOSION).toBeDefined();
            expect(subtypes.FIRE).toBeDefined();
        });
    });

    describe("FLAT_ENTITY_TYPES", () => {
        test("is an array", () => {
            expect(Array.isArray(FLAT_ENTITY_TYPES)).toBe(true);
        });

        test("contains 12 entries (11 categories + UNKNOWN)", () => {
            expect(FLAT_ENTITY_TYPES).toHaveLength(12);
        });

        test("contains all category TYPE values", () => {
            expect(FLAT_ENTITY_TYPES).toContain(ENTITY_TYPES.SCENE.TYPE);
            expect(FLAT_ENTITY_TYPES).toContain(ENTITY_TYPES.CAMERA.TYPE);
            expect(FLAT_ENTITY_TYPES).toContain(ENTITY_TYPES.MESH.TYPE);
            expect(FLAT_ENTITY_TYPES).toContain(ENTITY_TYPES.LIGHT.TYPE);
            expect(FLAT_ENTITY_TYPES).toContain(ENTITY_TYPES.MODEL.TYPE);
        });

        test("contains UNKNOWN", () => {
            expect(FLAT_ENTITY_TYPES).toContain(ENTITY_TYPES.UNKNOWN);
        });

        test("all entries are strings", () => {
            FLAT_ENTITY_TYPES.forEach(type => {
                expect(typeof type).toBe("string");
            });
        });
    });

    describe("FLAT_ENTITY_SUBTYPES", () => {
        test("is an array", () => {
            expect(Array.isArray(FLAT_ENTITY_SUBTYPES)).toBe(true);
        });

        test("has no undefined entries", () => {
            FLAT_ENTITY_SUBTYPES.forEach(subtype => {
                expect(subtype).toBeDefined();
                expect(typeof subtype).toBe("string");
            });
        });

        test("contains subtypes from multiple categories", () => {
            expect(FLAT_ENTITY_SUBTYPES).toContain(ENTITY_TYPES.MESH.SUBTYPES.BOX);
            expect(FLAT_ENTITY_SUBTYPES).toContain(ENTITY_TYPES.LIGHT.SUBTYPES.AMBIENT);
            expect(FLAT_ENTITY_SUBTYPES).toContain(ENTITY_TYPES.PARTICLE.SUBTYPES.FIRE);
            expect(FLAT_ENTITY_SUBTYPES).toContain(ENTITY_TYPES.SCENERY.SUBTYPES.SKY);
        });

        test("has no duplicates", () => {
            const unique = new Set(FLAT_ENTITY_SUBTYPES);
            expect(unique.size).toBe(FLAT_ENTITY_SUBTYPES.length);
        });
    });

    describe("ENTITY_EVENTS", () => {
        test("has DISPOSE event", () => {
            expect(ENTITY_EVENTS.DISPOSE).toBe("DISPOSE");
        });

        test("has STATE_MACHINE.CHANGE event", () => {
            expect(ENTITY_EVENTS.STATE_MACHINE.CHANGE).toBe("STATE_MACHINE_CHANGE");
        });

        test("has ANIMATION events", () => {
            expect(ENTITY_EVENTS.ANIMATION.LOOP).toBe("LOOP");
            expect(ENTITY_EVENTS.ANIMATION.FINISHED).toBe("FINISHED");
        });

        test("has AUDIO.ENDED event", () => {
            expect(ENTITY_EVENTS.AUDIO.ENDED).toBe("ended");
        });
    });

    describe("DEFAULT_TAG", () => {
        test("equals 'all'", () => {
            expect(DEFAULT_TAG).toBe("all");
        });
    });
});
