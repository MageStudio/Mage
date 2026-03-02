import { upperCaseFirst, removeFirst, template } from "../strings";

describe("strings.js", () => {
    describe("upperCaseFirst", () => {
        test("capitalizes first letter of a word", () => {
            expect(upperCaseFirst("hello")).toBe("Hello");
        });

        test("capitalizes first letter of a sentence", () => {
            expect(upperCaseFirst("hello world")).toBe("Hello world");
        });

        test("returns empty string for empty input", () => {
            expect(upperCaseFirst("")).toBe("");
        });

        test("returns empty string for undefined input", () => {
            expect(upperCaseFirst(undefined)).toBe("");
        });

        test("returns empty string for null input", () => {
            expect(upperCaseFirst(null)).toBe("");
        });

        test("returns empty string for non-string input", () => {
            expect(upperCaseFirst(123)).toBe("");
        });

        test("handles single character", () => {
            expect(upperCaseFirst("a")).toBe("A");
        });

        test("preserves already capitalized string", () => {
            expect(upperCaseFirst("Hello")).toBe("Hello");
        });
    });

    describe("removeFirst", () => {
        test("removes first character from string", () => {
            expect(removeFirst("hello")).toBe("ello");
        });

        test("returns empty string for single char", () => {
            expect(removeFirst("a")).toBe("");
        });

        test("returns empty string for empty string", () => {
            expect(removeFirst("")).toBe("");
        });
    });

    describe("template", () => {
        test("creates template with positional values", () => {
            const t = template`${0} is ${"name"}`;
            expect(t("Hello", { name: "World" })).toBe("Hello is World");
        });

        test("creates template with named values from dict", () => {
            const t = template`Hello ${"name"}!`;
            expect(t({ name: "Marco" })).toBe("Hello Marco!");
        });

        test("handles template with no placeholders", () => {
            const t = template`Hello World`;
            expect(t()).toBe("Hello World");
        });
    });
});
