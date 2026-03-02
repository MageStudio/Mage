import { omit } from "../object";

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
});
