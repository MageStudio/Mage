jest.mock("three", () => require("../../../__mocks__/three"));

import {
    ALMOST_ZERO,
    UP, DOWN, LEFT, RIGHT, FRONT, BACK,
    VECTOR_UP, VECTOR_DOWN, VECTOR_LEFT, VECTOR_RIGHT, VECTOR_FRONT, VECTOR_BACK,
    ORIGIN,
    ZERO_QUATERNION,
    MATERIALS,
    TEXTURES,
    PROPERTIES,
    MATERIAL_PROPERTIES_DEFAULT_VALUES,
    DEFAULT_MATERIAL_PROPERTIES,
    MATERIAL_PROPERTIES_MAP,
    MATERIAL_TEXTURE_MAP,
    UNDESIRED_SERIALISED_MATERIAL_PROPERTIES,
    EFFECTS,
    COLORS,
    ASSETS_TYPES,
    ROOT,
    DIVIDER,
    HASH,
    EMPTY,
    QUERY_START,
    DEFAULT_SELECTOR,
    TAGS,
} from "../constants";

describe("lib/constants.js", () => {
    describe("numeric constants", () => {
        test("ALMOST_ZERO is a very small positive number", () => {
            expect(ALMOST_ZERO).toBe(0.00001);
            expect(ALMOST_ZERO).toBeGreaterThan(0);
        });
    });

    describe("direction string constants", () => {
        test("has all six direction strings", () => {
            expect(UP).toBe("UP");
            expect(DOWN).toBe("DOWN");
            expect(LEFT).toBe("LEFT");
            expect(RIGHT).toBe("RIGHT");
            expect(FRONT).toBe("FRONT");
            expect(BACK).toBe("BACK");
        });
    });

    describe("direction vector constants", () => {
        test("VECTOR_UP points up (0,1,0)", () => {
            expect(VECTOR_UP.type).toBe(UP);
            expect(VECTOR_UP.vector).toBeDefined();
        });

        test("VECTOR_DOWN points down (0,-1,0)", () => {
            expect(VECTOR_DOWN.type).toBe(DOWN);
        });

        test("each vector constant has type and vector", () => {
            [VECTOR_UP, VECTOR_DOWN, VECTOR_LEFT, VECTOR_RIGHT, VECTOR_FRONT, VECTOR_BACK].forEach(v => {
                expect(v.type).toBeDefined();
                expect(v.vector).toBeDefined();
            });
        });
    });

    describe("ORIGIN and ZERO_QUATERNION", () => {
        test("ORIGIN is defined", () => {
            expect(ORIGIN).toBeDefined();
        });

        test("ZERO_QUATERNION is defined", () => {
            expect(ZERO_QUATERNION).toBeDefined();
        });
    });

    describe("MATERIALS", () => {
        test("has all 7 material types", () => {
            expect(Object.keys(MATERIALS)).toHaveLength(7);
            expect(MATERIALS.BASIC).toBe("BASIC");
            expect(MATERIALS.LAMBERT).toBe("LAMBERT");
            expect(MATERIALS.PHONG).toBe("PHONG");
            expect(MATERIALS.DEPTH).toBe("DEPTH");
            expect(MATERIALS.STANDARD).toBe("STANDARD");
            expect(MATERIALS.TOON).toBeDefined();
            expect(MATERIALS.THREE_TOON).toBe("THREE_TOON");
        });
    });

    describe("TEXTURES", () => {
        test("has all texture map keys", () => {
            expect(TEXTURES.MAP).toBe("map");
            expect(TEXTURES.ALPHA).toBe("alphaMap");
            expect(TEXTURES.AO).toBe("aoMap");
            expect(TEXTURES.ENV).toBe("envMap");
            expect(TEXTURES.NORMAL).toBe("normalMap");
            expect(TEXTURES.BUMP).toBe("bumpMap");
        });

        test("all values are strings", () => {
            Object.values(TEXTURES).forEach(v => {
                expect(typeof v).toBe("string");
            });
        });
    });

    describe("PROPERTIES", () => {
        test("has common material properties", () => {
            expect(PROPERTIES.OPACITY).toBe("opacity");
            expect(PROPERTIES.TRANSPARENT).toBe("transparent");
            expect(PROPERTIES.VISIBLE).toBe("visible");
            expect(PROPERTIES.COLOR).toBe("color");
            expect(PROPERTIES.WIREFRAME).toBe("wireframe");
        });

        test("has PBR properties", () => {
            expect(PROPERTIES.METALNESS).toBe("metalness");
            expect(PROPERTIES.ROUGHNESS).toBe("roughness");
            expect(PROPERTIES.EMISSIVE).toBe("emissive");
        });
    });

    describe("MATERIAL_PROPERTIES_DEFAULT_VALUES", () => {
        test("has default for every PROPERTY", () => {
            Object.values(PROPERTIES).forEach(prop => {
                expect(MATERIAL_PROPERTIES_DEFAULT_VALUES).toHaveProperty(prop);
            });
        });

        test("opacity defaults to 1", () => {
            expect(MATERIAL_PROPERTIES_DEFAULT_VALUES[PROPERTIES.OPACITY]).toBe(1.0);
        });

        test("transparent defaults to false", () => {
            expect(MATERIAL_PROPERTIES_DEFAULT_VALUES[PROPERTIES.TRANSPARENT]).toBe(false);
        });

        test("visible defaults to true", () => {
            expect(MATERIAL_PROPERTIES_DEFAULT_VALUES[PROPERTIES.VISIBLE]).toBe(true);
        });
    });

    describe("MATERIAL_PROPERTIES_MAP", () => {
        test("has entries for standard material types", () => {
            expect(MATERIAL_PROPERTIES_MAP[MATERIALS.BASIC]).toBeDefined();
            expect(MATERIAL_PROPERTIES_MAP[MATERIALS.LAMBERT]).toBeDefined();
            expect(MATERIAL_PROPERTIES_MAP[MATERIALS.PHONG]).toBeDefined();
            expect(MATERIAL_PROPERTIES_MAP[MATERIALS.DEPTH]).toBeDefined();
            expect(MATERIAL_PROPERTIES_MAP[MATERIALS.STANDARD]).toBeDefined();
        });

        test("all entries are arrays of property strings", () => {
            Object.values(MATERIAL_PROPERTIES_MAP).forEach(props => {
                expect(Array.isArray(props)).toBe(true);
                props.forEach(p => expect(typeof p).toBe("string"));
            });
        });

        test("all material types include common properties", () => {
            const commonProps = [
                PROPERTIES.OPACITY,
                PROPERTIES.TRANSPARENT,
                PROPERTIES.VISIBLE,
                PROPERTIES.SIDE,
            ];
            Object.values(MATERIAL_PROPERTIES_MAP).forEach(props => {
                commonProps.forEach(cp => expect(props).toContain(cp));
            });
        });
    });

    describe("MATERIAL_TEXTURE_MAP", () => {
        test("all entries are arrays of texture strings", () => {
            Object.values(MATERIAL_TEXTURE_MAP).forEach(textures => {
                expect(Array.isArray(textures)).toBe(true);
                textures.forEach(t => expect(typeof t).toBe("string"));
            });
        });

        test("all material types include MAP texture", () => {
            Object.values(MATERIAL_TEXTURE_MAP).forEach(textures => {
                expect(textures).toContain(TEXTURES.MAP);
            });
        });
    });

    describe("UNDESIRED_SERIALISED_MATERIAL_PROPERTIES", () => {
        test("includes 'images'", () => {
            expect(UNDESIRED_SERIALISED_MATERIAL_PROPERTIES).toContain("images");
        });

        test("includes all texture values", () => {
            Object.values(TEXTURES).forEach(tex => {
                expect(UNDESIRED_SERIALISED_MATERIAL_PROPERTIES).toContain(tex);
            });
        });
    });

    describe("EFFECTS", () => {
        test("has 8 effect types", () => {
            expect(Object.keys(EFFECTS)).toHaveLength(8);
        });

        test("has common effects", () => {
            expect(EFFECTS.BLOOM).toBeDefined();
            expect(EFFECTS.SEPIA).toBeDefined();
            expect(EFFECTS.GLITCH).toBeDefined();
        });
    });

    describe("COLORS", () => {
        test("WHITE is #ffffff", () => {
            expect(COLORS.WHITE).toBe("#ffffff");
        });

        test("BLACK is #000000", () => {
            expect(COLORS.BLACK).toBe("#000000");
        });
    });

    describe("ASSETS_TYPES", () => {
        test("has all asset categories", () => {
            expect(ASSETS_TYPES.AUDIO).toBe("audio");
            expect(ASSETS_TYPES.MODELS).toBe("models");
            expect(ASSETS_TYPES.TEXTURES).toBe("textures");
            expect(ASSETS_TYPES.SCRIPTS).toBe("scripts");
        });
    });

    describe("string constants", () => {
        test("ROOT is /", () => {
            expect(ROOT).toBe("/");
        });

        test("DIVIDER is /", () => {
            expect(DIVIDER).toBe("/");
        });

        test("HASH is #", () => {
            expect(HASH).toBe("#");
        });

        test("EMPTY is empty string", () => {
            expect(EMPTY).toBe("");
        });

        test("QUERY_START is ?", () => {
            expect(QUERY_START).toBe("?");
        });

        test("DEFAULT_SELECTOR is #gameContainer", () => {
            expect(DEFAULT_SELECTOR).toBe("#gameContainer");
        });
    });

    describe("TAGS", () => {
        test("has HELPER tag", () => {
            expect(TAGS.HELPER).toBeDefined();
        });

        test("has nested LIGHTS tags", () => {
            expect(TAGS.LIGHTS.HOLDER).toBeDefined();
            expect(TAGS.LIGHTS.HELPER).toBeDefined();
            expect(TAGS.LIGHTS.TARGET).toBeDefined();
        });

        test("has nested SOUNDS tags", () => {
            expect(TAGS.SOUNDS.HELPER).toBeDefined();
            expect(TAGS.SOUNDS.HOLDER).toBeDefined();
        });

        test("has nested PARTICLES tags", () => {
            expect(TAGS.PARTICLES.HELPER).toBeDefined();
            expect(TAGS.PARTICLES.HOLDER).toBeDefined();
        });
    });
});
