import { deepMerge, omit } from "../object";

describe("object.js", () => {
    describe("omit", () => {
        test("removes specified keys from object", () => {
            const obj = { a: 1, b: 2, c: 3 };
            expect(omit(["b"], obj)).toEqual({ a: 1, c: 3 });
        });

        test("removes multiple keys", () => {
            const obj = { a: 1, b: 2, c: 3, d: 4 };
            expect(omit(["a", "c"], obj)).toEqual({ b: 2, d: 4 });
        });

        test("returns same shape if no keys match", () => {
            const obj = { a: 1, b: 2 };
            expect(omit(["x", "y"], obj)).toEqual({ a: 1, b: 2 });
        });

        test("returns empty object if all keys are removed", () => {
            const obj = { a: 1, b: 2 };
            expect(omit(["a", "b"], obj)).toEqual({});
        });

        test("does not mutate the original object", () => {
            const obj = { a: 1, b: 2, c: 3 };
            omit(["b"], obj);
            expect(obj).toEqual({ a: 1, b: 2, c: 3 });
        });

        test("handles empty keys array", () => {
            const obj = { a: 1, b: 2 };
            expect(omit([], obj)).toEqual({ a: 1, b: 2 });
        });
    });

    describe("deepMerge", () => {
        test("merges flat objects", () => {
            expect(deepMerge({ a: 1, b: 2 }, { b: 3, c: 4 })).toEqual({ a: 1, b: 3, c: 4 });
        });

        test("recursively merges nested objects", () => {
            const base = { physics: { enabled: false, gravity: { x: 0, y: -30, z: 0 } } };
            const override = { physics: { gravity: { y: -9.8 } } };
            expect(deepMerge(base, override)).toEqual({
                physics: { enabled: false, gravity: { x: 0, y: -9.8, z: 0 } },
            });
        });

        test("override replaces arrays rather than concatenating", () => {
            expect(deepMerge({ list: [1, 2, 3] }, { list: [9] })).toEqual({ list: [9] });
        });

        test("override replaces primitives", () => {
            expect(deepMerge({ a: 1 }, { a: 2 })).toEqual({ a: 2 });
        });

        test("override with undefined keeps base value", () => {
            expect(deepMerge({ a: 1 }, { a: undefined })).toEqual({ a: undefined });
        });

        test("does not mutate base or override", () => {
            const base = { a: { b: 1 } };
            const override = { a: { c: 2 } };
            deepMerge(base, override);
            expect(base).toEqual({ a: { b: 1 } });
            expect(override).toEqual({ a: { c: 2 } });
        });

        test("returns override when base is not a plain object", () => {
            expect(deepMerge(null, { a: 1 })).toEqual({ a: 1 });
            expect(deepMerge(5, { a: 1 })).toEqual({ a: 1 });
        });

        test("returns base when override is not a plain object", () => {
            expect(deepMerge({ a: 1 }, null)).toEqual(null);
        });
    });
});
