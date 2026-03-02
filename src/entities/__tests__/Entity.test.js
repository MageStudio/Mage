jest.mock("three", () => require("../../../__mocks__/three"));
jest.mock("xstate", () => ({
    createMachine: jest.fn(),
    interpret: jest.fn(() => ({
        start: jest.fn(),
        stop: jest.fn(),
        send: jest.fn(),
        onTransition: jest.fn(),
    })),
}));
jest.mock("../../scripts/Scripts", () => ({
    get: jest.fn(),
}));
jest.mock("../../core/Scene", () => ({}));
jest.mock("../../core/Universe", () => ({
    getByTag: jest.fn(() => []),
}));
jest.mock("../../lib/easing", () => ({
    tweenTo: jest.fn(() => Promise.resolve()),
}));
jest.mock("../../lib/meshUtils", () => ({
    isScene: jest.fn(() => false),
    serializeQuaternion: jest.fn(q => q && { x: q.x, y: q.y, z: q.z, w: q.w }),
    serializeVector: jest.fn(v => v && { x: v.x, y: v.y, z: v.z }),
}));

import Entity from "../Entity";
import { DEFAULT_TAG, ENTITY_TYPES } from "../constants";

describe("Entity", () => {
    let entity;

    beforeEach(() => {
        entity = new Entity();
    });

    describe("constructor", () => {
        test("creates with default options", () => {
            expect(entity.isMage).toBe(true);
            expect(entity.disposed).toBe(false);
            expect(entity.parent).toBe(false);
            expect(entity.children).toEqual([]);
        });

        test("defaults serializable to true", () => {
            expect(entity.isSerializable()).toBe(true);
        });

        test("sets entityType to UNKNOWN", () => {
            expect(entity.entityType).toBe(ENTITY_TYPES.UNKNOWN);
            expect(entity.entitySubtype).toBe(ENTITY_TYPES.UNKNOWN);
        });

        test("adds DEFAULT_TAG automatically", () => {
            expect(entity.hasTag(DEFAULT_TAG)).toBe(true);
        });

        test("accepts custom tag in options", () => {
            const e = new Entity({ tag: "player" });
            expect(e.hasTag("player")).toBe(true);
            expect(e.hasTag(DEFAULT_TAG)).toBe(true);
        });

        test("accepts custom tags array", () => {
            const e = new Entity({ tags: ["enemy", "npc"] });
            expect(e.hasTag("enemy")).toBe(true);
            expect(e.hasTag("npc")).toBe(true);
        });

        test("sets serializable from options", () => {
            const e = new Entity({ serializable: false });
            expect(e.isSerializable()).toBe(false);
        });
    });

    describe("extendOptions", () => {
        test("merges new options into existing", () => {
            entity.extendOptions({ name: "test" });
            expect(entity.options.name).toBe("test");
        });

        test("overrides existing options", () => {
            entity.extendOptions({ serializable: false });
            expect(entity.options.serializable).toBe(false);
        });
    });

    describe("static create", () => {
        test("creates a new Entity instance", () => {
            const e = Entity.create({ tag: "test" });
            expect(e).toBeInstanceOf(Entity);
            expect(e.hasTag("test")).toBe(true);
        });
    });

    describe("serializable", () => {
        test("isSerializable returns true by default", () => {
            expect(entity.isSerializable()).toBe(true);
        });

        test("setSerializable changes value", () => {
            entity.setSerializable(false);
            expect(entity.isSerializable()).toBe(false);
        });

        test("setSerializable defaults to true", () => {
            entity.setSerializable(false);
            entity.setSerializable();
            expect(entity.isSerializable()).toBe(true);
        });
    });

    describe("disposed", () => {
        test("isDisposed returns false initially", () => {
            expect(entity.isDisposed()).toBe(false);
        });
    });

    describe("reset", () => {
        test("resets to initial state", () => {
            entity.children.push({});
            entity.parent = {};
            entity.reset();
            expect(entity.children).toEqual([]);
            expect(entity.parent).toBe(false);
            expect(entity.isMage).toBe(true);
            expect(entity.tags).toEqual([DEFAULT_TAG]);
        });
    });

    describe("body management", () => {
        test("hasBody returns false when no body set", () => {
            expect(entity.hasBody()).toBe(false);
        });

        test("setBody sets the body", () => {
            const body = { position: { x: 0, y: 0, z: 0 } };
            entity.setBody({ body });
            expect(entity.hasBody()).toBe(true);
            expect(entity.getBody()).toBe(body);
        });

        test("getBody returns undefined when no body", () => {
            expect(entity.getBody()).toBeUndefined();
        });

        test("getBodyByName warns when name not provided", () => {
            const warnSpy = jest.spyOn(console, "warn").mockImplementation();
            entity.getBodyByName();
            expect(warnSpy).toHaveBeenCalled();
            warnSpy.mockRestore();
        });

        test("getBodyByName returns child by name", () => {
            const childObj = { name: "arm" };
            const body = {
                getObjectByName: jest.fn(() => childObj),
            };
            entity.setBody({ body });
            const result = entity.getBodyByName("arm");
            expect(result).toBe(childObj);
        });
    });

    describe("parent management", () => {
        test("hasParent returns false initially", () => {
            expect(entity.hasParent()).toBe(false);
        });

        test("setParent and getParent work", () => {
            const parent = new Entity();
            entity.setParent(parent);
            expect(entity.hasParent()).toBe(true);
            expect(entity.getParent()).toBe(parent);
        });
    });

    describe("children", () => {
        test("hasChildren returns false initially", () => {
            expect(entity.hasChildren()).toBe(false);
        });

        test("hasChildren returns true after adding child", () => {
            entity.children.push({});
            expect(entity.hasChildren()).toBe(true);
        });
    });

    describe("tag management", () => {
        test("addTag adds new tag and returns true", () => {
            const result = entity.addTag("player");
            expect(result).toBe(true);
            expect(entity.hasTag("player")).toBe(true);
        });

        test("addTag returns false for duplicate tag", () => {
            entity.addTag("player");
            const logSpy = jest.spyOn(console, "log").mockImplementation();
            const result = entity.addTag("player");
            expect(result).toBe(false);
            logSpy.mockRestore();
        });

        test("addTag returns false for falsy tag", () => {
            expect(entity.addTag("")).toBe(false);
            expect(entity.addTag(null)).toBe(false);
            expect(entity.addTag(undefined)).toBe(false);
        });

        test("addTags adds multiple tags", () => {
            entity.addTags(["a", "b", "c"]);
            expect(entity.hasTag("a")).toBe(true);
            expect(entity.hasTag("b")).toBe(true);
            expect(entity.hasTag("c")).toBe(true);
        });

        test("removeTag removes existing tag", () => {
            entity.addTag("player");
            const result = entity.removeTag("player");
            expect(result).toBe(true);
            expect(entity.hasTag("player")).toBe(false);
        });

        test("removeTag cannot remove DEFAULT_TAG", () => {
            const logSpy = jest.spyOn(console, "log").mockImplementation();
            const result = entity.removeTag(DEFAULT_TAG);
            expect(result).toBe(false);
            expect(entity.hasTag(DEFAULT_TAG)).toBe(true);
            logSpy.mockRestore();
        });

        test("removeTag returns false for non-existent tag", () => {
            const logSpy = jest.spyOn(console, "log").mockImplementation();
            const result = entity.removeTag("nonexistent");
            expect(result).toBe(false);
            logSpy.mockRestore();
        });

        test("removeAllTags resets to only DEFAULT_TAG", () => {
            entity.addTags(["a", "b", "c"]);
            entity.removeAllTags();
            expect(entity.getTags()).toEqual([DEFAULT_TAG]);
        });

        test("hasTag returns true for existing tag", () => {
            expect(entity.hasTag(DEFAULT_TAG)).toBe(true);
        });

        test("hasTag returns false for non-existent tag", () => {
            expect(entity.hasTag("nonexistent")).toBe(false);
        });

        test("getTags returns all tags", () => {
            entity.addTag("test");
            const tags = entity.getTags();
            expect(tags).toContain(DEFAULT_TAG);
            expect(tags).toContain("test");
        });
    });

    describe("EventDispatcher integration", () => {
        test("can add and dispatch events", () => {
            const listener = jest.fn();
            entity.addEventListener("test", listener);
            entity.dispatchEvent({ type: "test" });
            expect(listener).toHaveBeenCalledWith(
                expect.objectContaining({ type: "test" }),
            );
        });

        test("can remove event listeners", () => {
            const listener = jest.fn();
            entity.addEventListener("test", listener);
            entity.removeEventListener("test", listener);
            entity.dispatchEvent({ type: "test" });
            expect(listener).not.toHaveBeenCalled();
        });
    });
});
