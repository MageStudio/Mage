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

    describe("loadAssetByPath de-duplication", () => {
        let load;
        let pendingLoads;

        beforeEach(() => {
            pendingLoads = [];
            load = jest.fn((path, onLoad, onProgress, onError) => {
                pendingLoads.push({ path, onLoad, onError });
            });
            images.textureLoader = { load };
            images.cubeTexturesLoader = { load };
            jest.spyOn(console, "warn").mockImplementation(() => {});
        });

        afterEach(() => {
            console.warn.mockRestore();
        });

        // minimal stand-in for three's Texture: clone() shares the decoded image
        class FakeTexture {
            constructor(image) {
                this.isTexture = true;
                this.image = image;
                this.repeat = { x: 1, y: 1 };
                this.needsUpdate = false;
            }

            clone() {
                const texture = new FakeTexture(this.image);
                texture.repeat = { ...this.repeat };
                return texture;
            }
        }

        const completePendingLoads = () =>
            pendingLoads.forEach(({ path, onLoad }) => onLoad(new FakeTexture({ src: path })));

        test("loads the same path once and gives each id its own texture sharing the image", async () => {
            const first = images.loadAssetByPath("/_wall.png", "wall.png", "/");
            completePendingLoads();
            const firstTexture = await first;

            const secondTexture = await images.loadAssetByPath("/_wall.png", "asset-id", "/");

            expect(load).toHaveBeenCalledTimes(1);
            expect(images.map["/_wall.png"]).toBe(firstTexture);
            expect(images.map["/_asset-id"]).toBe(secondTexture);
            expect(secondTexture).not.toBe(firstTexture);
            expect(secondTexture.image).toBe(firstTexture.image);
            expect(secondTexture.needsUpdate).toBe(true);
        });

        test("per-use texture settings on one id don't leak to the other", async () => {
            const first = images.loadAssetByPath("/_wall.png", "wall.png", "/");
            completePendingLoads();
            await first;
            await images.loadAssetByPath("/_wall.png", "asset-id", "/");

            images.get("/_asset-id").repeat.x = 4;

            expect(images.get("/_wall.png").repeat.x).toBe(1);
        });

        test("does not clone non-texture assets", async () => {
            images.imageLoader = { load };
            const first = images.loadAssetByPath(
                "/_wall.png",
                "wall.png",
                "/",
                images.LOADERS.IMAGE,
            );
            const image = { src: "/_wall.png" };
            pendingLoads[0].onLoad(image);
            await first;

            const second = await images.loadAssetByPath(
                "/_wall.png",
                "asset-id",
                "/",
                images.LOADERS.IMAGE,
            );

            expect(second).toBe(image);
            expect(images.map["/_asset-id"]).toBe(image);
        });

        test("concurrent in-flight calls share a single load", async () => {
            const first = images.loadAssetByPath("/_wall.png", "wall.png", "/");
            const second = images.loadAssetByPath("/_wall.png", "asset-id", "/");

            expect(load).toHaveBeenCalledTimes(1);

            completePendingLoads();
            const [firstTexture, secondTexture] = await Promise.all([first, second]);

            expect(images.map["/_wall.png"]).toBe(firstTexture);
            expect(images.map["/_asset-id"]).toBe(secondTexture);
            expect(secondTexture.image).toBe(firstTexture.image);
        });

        test("keeps separate loads for different loader types on the same path", () => {
            images.loadAssetByPath("/_wall.png", "wall", "/", images.LOADERS.TEXTURE);
            images.loadAssetByPath("/_wall.png", "wall", "/", images.LOADERS.CUBE_TEXTURE);

            expect(load).toHaveBeenCalledTimes(2);
        });

        test("does not cache a failed load", async () => {
            const failed = images.loadAssetByPath("/_wall.png", "wall.png", "/");
            pendingLoads[0].onError(new Error("load failed"));
            expect(await failed).toBeNull();

            const retry = images.loadAssetByPath("/_wall.png", "wall.png", "/");
            expect(load).toHaveBeenCalledTimes(2);

            const texture = new FakeTexture({ src: "/_wall.png" });
            pendingLoads[1].onLoad(texture);
            expect(await retry).toBe(texture);
        });

        test("does not cache a load that throws synchronously", async () => {
            load.mockImplementationOnce(() => {
                throw new Error("boom");
            });

            expect(await images.loadAssetByPath("/_wall.png", "wall.png", "/")).toBeNull();

            images.loadAssetByPath("/_wall.png", "wall.png", "/");
            expect(load).toHaveBeenCalledTimes(2);
        });

        test("disposeTexture clears the cached load for that texture", async () => {
            const first = images.loadAssetByPath("/_wall.png", "wall.png", "/");
            completePendingLoads();
            const texture = await first;
            texture.dispose = jest.fn();

            images.disposeTexture("/_wall.png");

            expect(texture.dispose).toHaveBeenCalled();
            expect(images.loadsByUrl).toEqual({});

            images.loadAssetByPath("/_wall.png", "wall.png", "/");
            expect(load).toHaveBeenCalledTimes(2);
        });
    });

    describe("load with textures", () => {
        test("waits for textures to finish loading", async () => {
            let finishLoad;
            images.textureLoader = {
                load: jest.fn((path, onLoad) => {
                    finishLoad = () => onLoad({ path });
                }),
            };

            const loading = images.load({}, { wall: "/_wall.png" }, {}, "/");
            let settled = false;
            loading.then(() => {
                settled = true;
            });

            await Promise.resolve();
            expect(settled).toBe(false);

            finishLoad();
            const result = await loading;

            expect(settled).toBe(true);
            expect(result).toEqual([{ path: "/_wall.png" }]);
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
