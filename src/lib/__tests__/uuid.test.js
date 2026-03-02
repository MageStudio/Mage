import { generateUUID, generateRandomName } from "../uuid";

describe("uuid.js", () => {

    describe("generateUUID", () => {
        test("returns a string", () => {
            expect(typeof generateUUID()).toBe("string");
        });

        test("returns an 8-character hex string", () => {
            const uuid = generateUUID();
            expect(uuid).toMatch(/^[0-9a-f]{8}$/);
        });

        test("generates different values on successive calls", () => {
            const a = generateUUID();
            const b = generateUUID();
            expect(a).not.toBe(b);
        });

        test("produces deterministic output with mocked Math.random", () => {
            const mockRandom = jest.spyOn(Math, "random").mockReturnValue(0.5);
            const uuid = generateUUID();
            expect(typeof uuid).toBe("string");
            expect(uuid.length).toBe(8);
            mockRandom.mockRestore();
        });
    });

    describe("generateRandomName", () => {
        test("prefixes UUID with given prefix and underscore", () => {
            const name = generateRandomName("entity");
            expect(name).toMatch(/^entity_[0-9a-f]{8}$/);
        });

        test("works with empty prefix", () => {
            const name = generateRandomName("");
            expect(name).toMatch(/^_[0-9a-f]{8}$/);
        });
    });
});
