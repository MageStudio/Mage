jest.mock("three", () => require("../../../__mocks__/three"));
jest.mock("../../core/config", () => ({
    lights: () => ({ textureAnisotropy: 1, shadows: false }),
}));
jest.mock("../../lights/Lights", () => ({
    isUsingCascadeShadowMaps: () => false,
    csm: { setupMaterial: jest.fn() },
}));
jest.mock("../../materials/Toon", () => class ToonMaterial { constructor(opts) { Object.assign(this, opts); } });
jest.mock("vivifyjs", () => ({
    get: jest.fn((prop, obj) => obj && obj[prop]),
}));

import {
    isMesh,
    isSprite,
    isLine,
    isScene,
    notAScene,
    hasMaterial,
    hasGeometry,
    hasTexture,
    processMaterial,
    serialiseMaterial,
    serializeVector,
    serializeQuaternion,
    serializeColor,
    findFirstInScene,
    applyMaterialChange,
    prepareModel,
    disposeTextures,
    disposeMaterial,
    disposeGeometry,
} from "../meshUtils";

describe("meshUtils.js", () => {
    describe("type checking functions", () => {
        describe("isMesh", () => {
            test("returns true for mesh objects", () => {
                expect(isMesh({ isMesh: true })).toBe(true);
            });

            test("returns false for non-mesh objects", () => {
                expect(isMesh({ isMesh: false })).toBe(false);
            });

            test("returns undefined for objects without isMesh", () => {
                expect(isMesh({})).toBeUndefined();
            });
        });

        describe("isSprite", () => {
            test("returns true for sprite objects", () => {
                expect(isSprite({ isSprite: true })).toBe(true);
            });

            test("returns false for non-sprite objects", () => {
                expect(isSprite({ isSprite: false })).toBe(false);
            });
        });

        describe("isLine", () => {
            test("returns true for line objects", () => {
                expect(isLine({ isLine: true })).toBe(true);
            });

            test("returns false for non-line objects", () => {
                expect(isLine({ isLine: false })).toBe(false);
            });
        });

        describe("isScene", () => {
            test("returns true for scene objects", () => {
                expect(isScene({ isScene: true })).toBe(true);
            });

            test("returns false for non-scene objects", () => {
                expect(isScene({ isScene: false })).toBe(false);
            });
        });

        describe("notAScene", () => {
            test("returns false for scene objects", () => {
                expect(notAScene({ isScene: true })).toBe(false);
            });

            test("returns true for non-scene objects", () => {
                expect(notAScene({ isScene: false })).toBe(true);
            });
        });
    });

    describe("material/geometry checks", () => {
        describe("hasMaterial", () => {
            test("returns true when material exists", () => {
                expect(hasMaterial({ material: {} })).toBe(true);
            });

            test("returns false when material is null", () => {
                expect(hasMaterial({ material: null })).toBe(false);
            });

            test("returns false when material is undefined", () => {
                expect(hasMaterial({})).toBe(false);
            });
        });

        describe("hasGeometry", () => {
            test("returns true when geometry exists", () => {
                expect(hasGeometry({ geometry: {} })).toBe(true);
            });

            test("returns false when geometry is missing", () => {
                expect(hasGeometry({})).toBe(false);
            });
        });

        describe("hasTexture", () => {
            test("returns true when material has map", () => {
                expect(hasTexture({ material: { map: {} } })).toBeTruthy();
            });

            test("returns false when material has no map", () => {
                expect(hasTexture({ material: { map: null } })).toBeFalsy();
            });

            test("returns false when no material", () => {
                expect(hasTexture({})).toBeFalsy();
            });
        });
    });

    describe("processMaterial", () => {
        test("applies callback to single material", () => {
            const material = { color: "red" };
            const callback = m => ({ ...m, processed: true });
            const result = processMaterial(material, callback);
            expect(result.processed).toBe(true);
            expect(result.color).toBe("red");
        });

        test("applies callback to array of materials", () => {
            const materials = [{ color: "red" }, { color: "blue" }];
            const callback = m => ({ ...m, processed: true });
            const result = processMaterial(materials, callback);
            expect(result).toHaveLength(2);
            expect(result[0].processed).toBe(true);
            expect(result[1].processed).toBe(true);
        });

        test("returns callback result for single material", () => {
            const result = processMaterial("mat", m => m.toUpperCase());
            expect(result).toBe("MAT");
        });
    });

    describe("serialiseMaterial", () => {
        test("throws when material is null (toJSON returns undefined)", () => {
            expect(() => serialiseMaterial(null)).toThrow();
        });

        test("throws when material is undefined (toJSON returns undefined)", () => {
            expect(() => serialiseMaterial(undefined)).toThrow();
        });

        test("calls toJSON and omits undesired properties", () => {
            const material = {
                toJSON: () => ({
                    color: "#fff",
                    images: ["img1"],
                    map: "texture",
                    alphaMap: "alpha",
                }),
            };
            const result = serialiseMaterial(material);
            expect(result.color).toBe("#fff");
            expect(result.images).toBeUndefined();
            expect(result.map).toBeUndefined();
            expect(result.alphaMap).toBeUndefined();
        });
    });

    describe("serialization functions", () => {
        describe("serializeVector", () => {
            test("serializes vector with x, y, z", () => {
                const vector = { x: 1, y: 2, z: 3 };
                expect(serializeVector(vector)).toEqual({ x: 1, y: 2, z: 3 });
            });

            test("returns falsy for null", () => {
                expect(serializeVector(null)).toBeFalsy();
            });

            test("returns falsy for undefined", () => {
                expect(serializeVector(undefined)).toBeFalsy();
            });

            test("handles zero values", () => {
                const vector = { x: 0, y: 0, z: 0 };
                expect(serializeVector(vector)).toEqual({ x: 0, y: 0, z: 0 });
            });
        });

        describe("serializeQuaternion", () => {
            test("serializes quaternion with x, y, z, w", () => {
                const q = { x: 0, y: 0, z: 0, w: 1 };
                expect(serializeQuaternion(q)).toEqual({ x: 0, y: 0, z: 0, w: 1 });
            });

            test("returns falsy for null", () => {
                expect(serializeQuaternion(null)).toBeFalsy();
            });

            test("returns falsy for undefined", () => {
                expect(serializeQuaternion(undefined)).toBeFalsy();
            });
        });

        describe("serializeColor", () => {
            test("serializes color with r, g, b", () => {
                const color = { r: 1, g: 0.5, b: 0 };
                expect(serializeColor(color)).toEqual({ r: 1, g: 0.5, b: 0 });
            });

            test("returns falsy for null", () => {
                expect(serializeColor(null)).toBeFalsy();
            });

            test("returns falsy for undefined", () => {
                expect(serializeColor(undefined)).toBeFalsy();
            });
        });
    });

    describe("findFirstInScene", () => {
        test("returns first element matching filter", () => {
            const child1 = { name: "a" };
            const child2 = { name: "b" };
            const scene = {
                traverse: fn => {
                    fn(child1);
                    fn(child2);
                },
            };
            const result = findFirstInScene(scene, el => el.name === "b");
            expect(result).toBe(child2);
        });

        test("returns first match only", () => {
            const child1 = { type: "mesh" };
            const child2 = { type: "mesh" };
            const scene = {
                traverse: fn => {
                    fn(child1);
                    fn(child2);
                },
            };
            const result = findFirstInScene(scene, el => el.type === "mesh");
            expect(result).toBe(child1);
        });

        test("returns undefined when no match", () => {
            const scene = {
                traverse: fn => fn({ name: "x" }),
            };
            const result = findFirstInScene(scene, el => el.name === "y");
            expect(result).toBeUndefined();
        });
    });

    describe("applyMaterialChange", () => {
        test("applies callback to element with material", () => {
            const callback = jest.fn(m => m);
            const body = { material: { color: "red" } };
            applyMaterialChange(body, callback);
            expect(callback).toHaveBeenCalledWith(body.material);
        });

        test("traverses children when element has no material", () => {
            const callback = jest.fn(m => m);
            const child = { material: { color: "blue" } };
            const body = {
                traverse: fn => fn(child),
            };
            applyMaterialChange(body, callback);
            expect(callback).toHaveBeenCalledWith(child.material);
        });

        test("skips children without material during traverse", () => {
            const callback = jest.fn(m => m);
            const childNoMat = {};
            const childWithMat = { material: { color: "green" } };
            const body = {
                traverse: fn => { fn(childNoMat); fn(childWithMat); },
            };
            applyMaterialChange(body, callback);
            expect(callback).toHaveBeenCalledTimes(1);
        });
    });

    describe("prepareModel", () => {
        test("returns null for null model", () => {
            const warnSpy = jest.spyOn(console, "warn").mockImplementation();
            expect(prepareModel(null)).toBeNull();
            warnSpy.mockRestore();
        });

        test("returns null for model without traverse", () => {
            const warnSpy = jest.spyOn(console, "warn").mockImplementation();
            expect(prepareModel({})).toBeNull();
            warnSpy.mockRestore();
        });

        test("returns model for valid model with traverse", () => {
            const model = {
                castShadow: false,
                receiveShadow: false,
                traverse: jest.fn(),
            };
            const result = prepareModel(model);
            expect(result).toBe(model);
            expect(model.traverse).toHaveBeenCalled();
        });
    });

    describe("dispose functions", () => {
        describe("disposeTextures", () => {
            test("disposes textures on material", () => {
                const dispose = jest.fn();
                const mesh = {
                    material: {
                        map: { dispose },
                        alphaMap: { dispose },
                    },
                };
                disposeTextures(mesh);
                expect(dispose).toHaveBeenCalledTimes(2);
            });

            test("does nothing when no material", () => {
                expect(() => disposeTextures({})).not.toThrow();
            });
        });

        describe("disposeMaterial", () => {
            test("calls dispose on material", () => {
                const dispose = jest.fn();
                disposeMaterial({ material: { dispose } });
                expect(dispose).toHaveBeenCalled();
            });

            test("does nothing when no material", () => {
                expect(() => disposeMaterial({})).not.toThrow();
            });

            test("does nothing when material has no dispose", () => {
                expect(() => disposeMaterial({ material: {} })).not.toThrow();
            });
        });

        describe("disposeGeometry", () => {
            test("calls dispose on geometry", () => {
                const dispose = jest.fn();
                disposeGeometry({ geometry: { dispose } });
                expect(dispose).toHaveBeenCalled();
            });

            test("does nothing when no geometry", () => {
                expect(() => disposeGeometry({})).not.toThrow();
            });
        });
    });
});
