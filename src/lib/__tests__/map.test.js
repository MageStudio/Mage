import { serializeMap, deserialiseMap, populateMap } from "../map";

describe("map.js", () => {

    describe("serializeMap", () => {
        test("serializes a simple Map to JSON string", () => {
            const m = new Map([["a", 1], ["b", 2]]);
            const result = JSON.parse(serializeMap(m));
            expect(result).toEqual({ a: 1, b: 2 });
        });

        test("serializes nested Maps", () => {
            const inner = new Map([["x", 10]]);
            const outer = new Map([["nested", inner]]);
            const result = JSON.parse(serializeMap(outer));
            expect(result).toEqual({ nested: { x: 10 } });
        });

        test("serializes empty Map", () => {
            const m = new Map();
            expect(serializeMap(m)).toBe("{}");
        });

        test("handles non-Map values in Map entries", () => {
            const m = new Map([["str", "hello"], ["num", 42], ["bool", true]]);
            const result = JSON.parse(serializeMap(m));
            expect(result).toEqual({ str: "hello", num: 42, bool: true });
        });
    });

    describe("deserialiseMap", () => {
        test("deserializes JSON string to Map", () => {
            const json = '{"a":1,"b":2}';
            const m = deserialiseMap(json);
            expect(m).toBeInstanceOf(Map);
            expect(m.get("a")).toBe(1);
            expect(m.get("b")).toBe(2);
        });

        test("deserializes empty JSON object to empty Map", () => {
            const m = deserialiseMap("{}");
            expect(m.size).toBe(0);
        });

        test("preserves string values", () => {
            const m = deserialiseMap('{"key":"value"}');
            expect(m.get("key")).toBe("value");
        });
    });

    describe("populateMap", () => {
        test("adds data entries to existing Map", () => {
            const m = new Map([["existing", true]]);
            populateMap(m, { a: 1, b: 2 });
            expect(m.get("a")).toBe(1);
            expect(m.get("b")).toBe(2);
            expect(m.get("existing")).toBe(true);
        });

        test("returns the same Map instance", () => {
            const m = new Map();
            const result = populateMap(m, { a: 1 });
            expect(result).toBe(m);
        });

        test("overwrites existing keys", () => {
            const m = new Map([["a", "old"]]);
            populateMap(m, { a: "new" });
            expect(m.get("a")).toBe("new");
        });

        test("handles empty data", () => {
            const m = new Map([["a", 1]]);
            populateMap(m, {});
            expect(m.size).toBe(1);
        });
    });
});
