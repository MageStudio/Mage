import { difference } from "../array";

describe("array.js", () => {

    describe("difference", () => {
        test("returns elements in a but not in b", () => {
            expect(difference([1, 2, 3, 4], [2, 4])).toEqual([1, 3]);
        });

        test("returns empty array when all elements are in b", () => {
            expect(difference([1, 2], [1, 2, 3])).toEqual([]);
        });

        test("returns original array when b is empty", () => {
            expect(difference([1, 2, 3], [])).toEqual([1, 2, 3]);
        });

        test("returns empty array when a is empty", () => {
            expect(difference([], [1, 2, 3])).toEqual([]);
        });

        test("works with string arrays", () => {
            expect(difference(["a", "b", "c"], ["b"])).toEqual(["a", "c"]);
        });
    });
});
