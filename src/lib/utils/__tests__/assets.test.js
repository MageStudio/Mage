import { buildAssetId, isLevelName } from "../assets";

describe("assets.js", () => {

    describe("buildAssetId", () => {
        test("combines level and name with underscore", () => {
            expect(buildAssetId("model", "/level1")).toBe("/level1_model");
        });

        test("returns name alone when level is empty string", () => {
            expect(buildAssetId("model", "")).toBe("model");
        });

        test("returns name alone when level is null", () => {
            expect(buildAssetId("model", null)).toBe("model");
        });

        test("returns name alone when level is undefined", () => {
            expect(buildAssetId("model", undefined)).toBe("model");
        });

        test("handles complex level paths", () => {
            expect(buildAssetId("character", "/world/level2")).toBe("/world/level2_character");
        });
    });

    describe("isLevelName", () => {
        test("returns true for names starting with /", () => {
            expect(isLevelName("/level1")).toBe(true);
        });

        test("returns true for root path", () => {
            expect(isLevelName("/")).toBe(true);
        });

        test("returns false for names not starting with /", () => {
            expect(isLevelName("level1")).toBe(false);
        });

        test("returns false for empty string", () => {
            expect(isLevelName("")).toBe(false);
        });
    });
});
