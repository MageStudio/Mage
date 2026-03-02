import { toQueryString, parseQuery } from "../query";

describe("query.js", () => {
    describe("toQueryString", () => {
        test("converts object to query string", () => {
            expect(toQueryString({ a: 1, b: 2 })).toBe("?a=1&b=2");
        });

        test("returns empty string for empty object", () => {
            expect(toQueryString({})).toBe("");
        });

        test("returns empty string for undefined", () => {
            expect(toQueryString()).toBe("");
        });

        test("handles single parameter", () => {
            expect(toQueryString({ key: "value" })).toBe("?key=value");
        });

        test("handles string values", () => {
            expect(toQueryString({ name: "marco" })).toBe("?name=marco");
        });
    });

    describe("parseQuery", () => {
        test("parses query string to object", () => {
            expect(parseQuery("?a=1&b=2")).toEqual({ a: "1", b: "2" });
        });

        test("returns empty object for empty string", () => {
            expect(parseQuery("")).toEqual({});
        });

        test("returns empty object for just question mark", () => {
            expect(parseQuery("?")).toEqual({});
        });

        test("returns empty object for undefined", () => {
            expect(parseQuery()).toEqual({});
        });

        test("handles single parameter", () => {
            expect(parseQuery("?key=value")).toEqual({ key: "value" });
        });

        test("round-trips with toQueryString", () => {
            const original = { a: "1", b: "2" };
            const queryString = toQueryString(original);
            expect(parseQuery(queryString)).toEqual(original);
        });
    });
});
