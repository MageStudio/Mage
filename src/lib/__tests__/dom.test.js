import { isClassname, isId, DEFAULT_FULL_SIZE_STYLE } from "../dom";

describe("dom.js", () => {
    describe("isClassname", () => {
        test("returns true for strings starting with '.'", () => {
            expect(isClassname(".myClass")).toBe(true);
        });

        test("returns true for '.' alone", () => {
            expect(isClassname(".")).toBe(true);
        });

        test("returns false for strings starting with '#'", () => {
            expect(isClassname("#myId")).toBe(false);
        });

        test("returns false for plain strings", () => {
            expect(isClassname("myClass")).toBe(false);
        });

        test("returns false for empty string", () => {
            expect(isClassname("")).toBe(false);
        });
    });

    describe("isId", () => {
        test("returns true for strings starting with '#'", () => {
            expect(isId("#myId")).toBe(true);
        });

        test("returns true for '#' alone", () => {
            expect(isId("#")).toBe(true);
        });

        test("returns false for strings starting with '.'", () => {
            expect(isId(".myClass")).toBe(false);
        });

        test("returns false for plain strings", () => {
            expect(isId("myId")).toBe(false);
        });

        test("returns false for empty string", () => {
            expect(isId("")).toBe(false);
        });
    });

    describe("DEFAULT_FULL_SIZE_STYLE", () => {
        test("has position absolute", () => {
            expect(DEFAULT_FULL_SIZE_STYLE.position).toBe("absolute");
        });

        test("has full height and width", () => {
            expect(DEFAULT_FULL_SIZE_STYLE.height).toBe("100%");
            expect(DEFAULT_FULL_SIZE_STYLE.width).toBe("100%");
        });

        test("has zero margin", () => {
            expect(DEFAULT_FULL_SIZE_STYLE.margin).toBe("0");
        });
    });
});
