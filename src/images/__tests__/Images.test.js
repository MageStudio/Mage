jest.mock("three", () => {
    const mockLoad = jest.fn((path, onLoad, onProgress, onError) => {
        if (path === "fail") {
            onError(new Error("load failed"));
        } else {
            onLoad({ path });
        }
    });
    return {
        ...require("../../../__mocks__/three"),
        TextureLoader: jest.fn().mockImplementation(() => ({ load: mockLoad })),
        ImageLoader: jest.fn().mockImplementation(() => ({ load: mockLoad })),
        CubeTextureLoader: jest.fn().mockImplementation(() => ({ load: mockLoad })),
    };
});
jest.mock("../../env", () => ({ MAGE_ASSETS_BASE_URL: "" }));

import { Images } from "../Images";

describe("Images", () => {
    let images;

    beforeEach(() => {
        images = new Images();
    });

    describe("constructor", () => {
        test("initializes with empty map", () => {
            expect(images.map).toEqual({});
        });

        test("initializes with zero numImages", () => {
            expect(images.numImages).toBe(0);
        });

        test("initializes currentLevel to /", () => {
            expect(images.currentLevel).toBe("/");
        });
    });

    describe("LOADERS", () => {
        test("has IMAGE, TEXTURE, CUBE_TEXTURE", () => {
            expect(images.LOADERS.IMAGE).toBe("image");
            expect(images.LOADERS.TEXTURE).toBe("texture");
            expect(images.LOADERS.CUBE_TEXTURE).toBe("cubeTexture");
        });
    });

    describe("getLoaderByType", () => {
        test("returns imageLoader for IMAGE type", () => {
            const loader = images.getLoaderByType(images.LOADERS.IMAGE);
            expect(loader).toBe(images.imageLoader);
        });

        test("returns textureLoader for TEXTURE type", () => {
            const loader = images.getLoaderByType(images.LOADERS.TEXTURE);
            expect(loader).toBe(images.textureLoader);
        });

        test("returns cubeTexturesLoader for CUBE_TEXTURE type", () => {
            const loader = images.getLoaderByType(images.LOADERS.CUBE_TEXTURE);
            expect(loader).toBe(images.cubeTexturesLoader);
        });

        test("returns null for unknown type", () => {
            expect(images.getLoaderByType("unknown")).toBeNull();
        });
    });

    describe("setCurrentLevel", () => {
        test("updates currentLevel", () => {
            images.setCurrentLevel("/level1");
            expect(images.currentLevel).toBe("/level1");
        });
    });

    describe("add", () => {
        test("adds image to map", () => {
            images.add("testId", { data: "image" });
            expect(images.map["testId"]).toEqual({ data: "image" });
        });

        test("does not add when id is falsy", () => {
            images.add("", { data: "image" });
            expect(images.map[""]).toBeUndefined();
        });

        test("does not add when image is falsy", () => {
            images.add("testId", null);
            expect(images.map["testId"]).toBeUndefined();
        });
    });

    describe("get", () => {
        test("returns image by id", () => {
            images.map["myTexture"] = { data: "texture" };
            expect(images.get("myTexture")).toEqual({ data: "texture" });
        });

        test("returns false for non-existent id", () => {
            expect(images.get("nonexistent")).toBe(false);
        });
    });

    describe("load", () => {
        test("resolves immediately with 'images' when no assets to load", async () => {
            const result = await images.load({}, {}, {});
            expect(result).toBe("images");
        });
    });

    describe("areThereImagesToLoad", () => {
        test("returns 0 (falsy) when all empty", () => {
            images.images = {};
            images.textures = {};
            images.cubeTextures = {};
            expect(images.areThereImagesToLoad()).toBeFalsy();
        });

        test("returns truthy when textures exist", () => {
            images.images = {};
            images.textures = { tex1: "path" };
            images.cubeTextures = {};
            expect(images.areThereImagesToLoad()).toBeTruthy();
        });
    });
});
