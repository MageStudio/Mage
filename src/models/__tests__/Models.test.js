// Models.js has many deep dependencies. We mock them to isolate testable logic.
jest.mock("../../env", () => ({ MAGE_ASSETS_BASE_URL: "" }));
jest.mock("../../entities/Element", () => {
    return jest.fn().mockImplementation(opts => ({
        ...opts,
        setEntityType: jest.fn(),
        setEntitySubtype: jest.fn(),
        addAnimationHandler: jest.fn(),
        getBody: jest.fn(),
    }));
});
jest.mock("../../loaders/GLTFLoader", () => ({
    buildGLTFLoader: jest.fn(() => ({
        loader: { load: jest.fn(), setOptions: jest.fn() },
        tracer: { addEventListener: jest.fn() },
    })),
}));
jest.mock("../../loaders/FBXLoader", () => ({
    buildFBXLoader: jest.fn(() => ({
        loader: { load: jest.fn(), setOptions: jest.fn() },
        tracer: { addEventListener: jest.fn() },
    })),
}));
jest.mock("../../loaders/OBJMTLLoader", () => ({
    buildOBJMTLLoader: jest.fn(() => ({
        loader: { load: jest.fn(), setOptions: jest.fn() },
        tracer: { addEventListener: jest.fn() },
    })),
}));
jest.mock("../SkeletonUtils", () => ({
    clone: jest.fn(scene => scene),
}));
jest.mock("../../lib/meshUtils", () => ({
    prepareModel: jest.fn(model => model),
    processMaterial: jest.fn(),
}));
jest.mock("../../loaders/RequirementsTracer", () => {
    const mock = jest.fn().mockImplementation(() => ({
        addEventListener: jest.fn(),
    }));
    mock.REQUIREMENTS_EVENTS = { MISSING: "MISSING" };
    return { __esModule: true, default: mock, REQUIREMENTS_EVENTS: { MISSING: "MISSING" } };
});

// Now import the module under test - it's a singleton instance
import Models from "../Models";

describe("Models.js", () => {
    describe("Models instance", () => {
        test("initializes with empty map", () => {
            expect(Models.map).toBeDefined();
            expect(typeof Models.map).toBe("object");
        });

        test("initializes with empty models", () => {
            expect(Models.models).toBeDefined();
        });

        test("has setCurrentLevel method", () => {
            expect(typeof Models.setCurrentLevel).toBe("function");
        });

        test("setCurrentLevel updates currentLevel", () => {
            Models.setCurrentLevel("/level1");
            expect(Models.currentLevel).toBe("/level1");
            // Reset
            Models.setCurrentLevel("root");
        });
    });

    describe("storeModel", () => {
        test("stores model in map with extension", () => {
            const mockModel = { scene: {}, animations: [] };
            Models.storeModel("testModel", mockModel, "glb");
            expect(Models.map["testModel"]).toBe(mockModel);
            expect(mockModel.extension).toBe("glb");
            // Clean up
            delete Models.map["testModel"];
        });
    });

    describe("loadModels", () => {
        test("resolves immediately with 'models' when given empty models", async () => {
            const result = await Models.loadModels({}, "root");
            expect(result).toBe("models");
        });
    });

    describe("loadAssetByName", () => {
        test("resolves immediately when model name not found", async () => {
            Models.models = {};
            const result = await Models.loadAssetByName("nonexistent", {});
            expect(result).toBeUndefined();
        });
    });

    describe("onMissingRequirements", () => {
        test("registers event listener", () => {
            const cb = jest.fn();
            expect(() => Models.onMissingRequirements("testModel", cb)).not.toThrow();
        });
    });
});
