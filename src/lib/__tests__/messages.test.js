import * as messages from "../messages";

describe("messages.js", () => {
    describe("PREFIX", () => {
        test("is [Mage]", () => {
            expect(messages.PREFIX).toBe("[Mage]");
        });
    });

    describe("DEPRECATED constant", () => {
        test("is [DEPRECATED]", () => {
            expect(messages.DEPRECATED).toBe("[DEPRECATED]");
        });
    });

    describe("DEPRECATIONS", () => {
        test("all values contain PREFIX", () => {
            Object.values(messages.DEPRECATIONS).forEach(msg => {
                expect(msg).toContain(messages.PREFIX);
            });
        });

        test("all values contain DEPRECATED", () => {
            Object.values(messages.DEPRECATIONS).forEach(msg => {
                expect(msg).toContain(messages.DEPRECATED);
            });
        });

        test("has expected deprecation keys", () => {
            expect(messages.DEPRECATIONS.MODELS_GETMODEL).toBeDefined();
            expect(messages.DEPRECATIONS.SCRIPTS_CREATE).toBeDefined();
            expect(messages.DEPRECATIONS.ELEMENT_SET_TEXTURE_MAP).toBeDefined();
        });
    });

    describe("error messages", () => {
        test("all exported string constants contain PREFIX", () => {
            const stringExports = Object.entries(messages).filter(
                ([key, val]) => typeof val === "string" && key !== "PREFIX" && key !== "DEPRECATED",
            );

            stringExports.forEach(([key, msg]) => {
                expect(msg).toContain(messages.PREFIX);
            });
        });

        test("entity messages are defined", () => {
            expect(messages.ENTITY_NOT_SET).toBeDefined();
            expect(messages.ENTITY_TYPE_NOT_ALLOWED).toBeDefined();
            expect(messages.ENTITY_CANT_ADD_NOT_ENTITY).toBeDefined();
        });

        test("element messages are defined", () => {
            expect(messages.ELEMENT_NOT_SET).toBeDefined();
            expect(messages.ELEMENT_NAME_NOT_PROVIDED).toBeDefined();
            expect(messages.ELEMENT_NO_MATERIAL_SET).toBeDefined();
        });

        test("script messages are defined", () => {
            expect(messages.SCRIPT_NOT_FOUND).toBeDefined();
            expect(messages.SCRIPT_NOT_PROVIDED).toBeDefined();
        });

        test("asset loading messages are defined", () => {
            expect(messages.ASSETS_MODEL_LOAD_FAIL).toBeDefined();
            expect(messages.ASSETS_AUDIO_LOAD_FAIL).toBeDefined();
            expect(messages.ASSETS_TEXTURE_LOAD_FAIL).toBeDefined();
        });

        test("SCRIPT_NEEDS_TO_BE_INSTANCE is a function (template)", () => {
            expect(typeof messages.SCRIPT_NEEDS_TO_BE_INSTANCE).toBe("function");
        });

        test("SCRIPT_NEEDS_TO_BE_INSTANCE interpolates name", () => {
            const result = messages.SCRIPT_NEEDS_TO_BE_INSTANCE({ name: "MyScript" });
            expect(result).toContain("MyScript");
            expect(result).toContain("BaseScript");
        });
    });
});
