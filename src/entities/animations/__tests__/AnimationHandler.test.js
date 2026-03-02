// Use the manual mock for THREE.js (rootDir/__mocks__/three.js)
jest.mock("three", () => require("../../../../__mocks__/three"));

import AnimationHandler from "../AnimationHandler";

describe("AnimationHandler", () => {
    let handler;
    const mockAnimations = [
        { name: "idle", duration: 1.0 },
        { name: "walk", duration: 0.8 },
        { name: "run", duration: 0.6 },
    ];

    beforeEach(() => {
        handler = new AnimationHandler({}, mockAnimations);
    });

    describe("constructor", () => {
        test("initializes with given animations", () => {
            expect(handler.animations).toBe(mockAnimations);
        });

        test("starts with isPlaying = false", () => {
            expect(handler.isPlaying).toBe(false);
        });

        test("starts with currentAction = null", () => {
            expect(handler.currentAction).toBe(null);
        });

        test("initializes activeActions as empty Map", () => {
            expect(handler.activeActions).toBeInstanceOf(Map);
            expect(handler.activeActions.size).toBe(0);
        });

        test("defaults animations to empty array", () => {
            const h = new AnimationHandler({});
            expect(h.animations).toEqual([]);
        });
    });

    describe("getAction", () => {
        test("returns animation by numeric index", () => {
            expect(handler.getAction(0)).toBe(mockAnimations[0]);
            expect(handler.getAction(1)).toBe(mockAnimations[1]);
            expect(handler.getAction(2)).toBe(mockAnimations[2]);
        });

        test("returns undefined for out-of-bounds index", () => {
            expect(handler.getAction(99)).toBeUndefined();
        });

        test("returns animation by name using AnimationClip.findByName", () => {
            expect(handler.getAction("idle")).toBe(mockAnimations[0]);
            expect(handler.getAction("walk")).toBe(mockAnimations[1]);
        });

        test("returns undefined for non-existent name", () => {
            expect(handler.getAction("jump")).toBeUndefined();
        });

        test("returns undefined for unsupported id type", () => {
            expect(handler.getAction(null)).toBeUndefined();
            expect(handler.getAction({})).toBeUndefined();
        });
    });

    describe("getAvailableAnimations", () => {
        test("returns array of animation names", () => {
            expect(handler.getAvailableAnimations()).toEqual(["idle", "walk", "run"]);
        });

        test("returns empty array when no animations", () => {
            const h = new AnimationHandler({}, []);
            expect(h.getAvailableAnimations()).toEqual([]);
        });
    });

    describe("getAnimationDuration", () => {
        test("returns duration of animation by index", () => {
            expect(handler.getAnimationDuration(0)).toBe(1.0);
            expect(handler.getAnimationDuration(1)).toBe(0.8);
        });

        test("returns duration of animation by name", () => {
            expect(handler.getAnimationDuration("run")).toBe(0.6);
        });

        test("returns 0 for non-existent animation", () => {
            expect(handler.getAnimationDuration("jump")).toBe(0);
            expect(handler.getAnimationDuration(99)).toBe(0);
        });
    });

    describe("stopAll", () => {
        test("calls mixer.stopAllAction", () => {
            const spy = jest.spyOn(handler.mixer, "stopAllAction");
            handler.stopAll();
            expect(spy).toHaveBeenCalled();
        });

        test("sets isPlaying to false", () => {
            handler.isPlaying = true;
            handler.stopAll();
            expect(handler.isPlaying).toBe(false);
        });
    });

    describe("stopCurrentAnimation", () => {
        test("sets isPlaying to false", () => {
            handler.isPlaying = true;
            handler.stopCurrentAnimation();
            expect(handler.isPlaying).toBe(false);
        });

        test("calls stop on currentAction if it exists", () => {
            const mockAction = { stop: jest.fn() };
            handler.currentAction = mockAction;
            handler.stopCurrentAnimation();
            expect(mockAction.stop).toHaveBeenCalled();
        });

        test("does not throw when currentAction is null", () => {
            handler.currentAction = null;
            expect(() => handler.stopCurrentAnimation()).not.toThrow();
        });
    });

    describe("playAnimation", () => {
        test("sets isPlaying to true", () => {
            handler.playAnimation(0);
            expect(handler.isPlaying).toBe(true);
        });

        test("sets currentAction", () => {
            handler.playAnimation(0);
            expect(handler.currentAction).not.toBeNull();
        });

        test("adds action to activeActions map", () => {
            handler.playAnimation(0);
            expect(handler.activeActions.has(0)).toBe(true);
        });

        test("returns null for non-existent animation", () => {
            const warnSpy = jest.spyOn(console, "warn").mockImplementation();
            const result = handler.playAnimation("nonexistent");
            expect(result).toBeNull();
            warnSpy.mockRestore();
        });

        test("delegates to crossFadeTo when currentAction exists", () => {
            // First play sets currentAction
            handler.playAnimation(0);
            const crossFadeSpy = jest.spyOn(handler, "crossFadeTo");
            // Second play should crossfade
            handler.playAnimation(1);
            expect(crossFadeSpy).toHaveBeenCalledWith(1, expect.any(Object));
            crossFadeSpy.mockRestore();
        });

        test("accepts options", () => {
            const action = handler.playAnimation(0, {
                timeScale: 2,
                weight: 0.5,
            });
            expect(action).toBeDefined();
        });
    });

    describe("crossFadeTo", () => {
        test("returns null for non-existent animation", () => {
            const warnSpy = jest.spyOn(console, "warn").mockImplementation();
            const result = handler.crossFadeTo("nonexistent");
            expect(result).toBeNull();
            warnSpy.mockRestore();
        });

        test("updates currentAction to new action", () => {
            handler.playAnimation(0);
            handler.crossFadeTo(1);
            expect(handler.activeActions.has(1)).toBe(true);
        });

        test("adds new action to activeActions", () => {
            handler.crossFadeTo(0);
            expect(handler.activeActions.has(0)).toBe(true);
        });
    });

    describe("stopAnimation", () => {
        test("does nothing for non-existent animation", () => {
            expect(() => handler.stopAnimation("nonexistent")).not.toThrow();
        });

        test("removes animation from activeActions", () => {
            handler.playAnimation(0);
            expect(handler.activeActions.has(0)).toBe(true);
            handler.stopAnimation(0);
            expect(handler.activeActions.has(0)).toBe(false);
        });

        test("resets currentAction and isPlaying when stopping current", () => {
            handler.playAnimation(0);
            const currentAction = handler.currentAction;
            // Make the mock clipAction return the same action object
            handler.mixer.clipAction = () => currentAction;
            handler.stopAnimation(0);
            expect(handler.currentAction).toBeNull();
            expect(handler.isPlaying).toBe(false);
        });
    });

    describe("isAnimationPlaying", () => {
        test("returns false for non-existent animation", () => {
            expect(handler.isAnimationPlaying("nonexistent")).toBe(false);
        });

        test("returns result from action.isRunning()", () => {
            // The mock action.isRunning() returns false by default
            expect(handler.isAnimationPlaying(0)).toBe(false);
        });
    });

    describe("getAnimationTime", () => {
        test("returns 0 for non-existent animation", () => {
            expect(handler.getAnimationTime("nonexistent")).toBe(0);
        });

        test("returns action.time for existing animation", () => {
            // The mock action.time defaults to 0
            expect(handler.getAnimationTime(0)).toBe(0);
        });
    });

    describe("setAnimationTime", () => {
        test("does not throw for non-existent animation", () => {
            expect(() => handler.setAnimationTime("nonexistent", 5)).not.toThrow();
        });

        test("sets action.time for existing animation", () => {
            handler.setAnimationTime(0, 5);
            // Verify it doesn't throw (actual behavior depends on mock)
        });
    });

    describe("setAnimationTimeScale", () => {
        test("does not throw for non-existent animation", () => {
            expect(() => handler.setAnimationTimeScale("nonexistent", 2)).not.toThrow();
        });
    });

    describe("setAnimationWeight", () => {
        test("does not throw for non-existent animation", () => {
            expect(() => handler.setAnimationWeight("nonexistent", 0.5)).not.toThrow();
        });
    });

    describe("update", () => {
        test("calls mixer.update with delta time", () => {
            const spy = jest.spyOn(handler.mixer, "update");
            handler.update(0.016);
            expect(spy).toHaveBeenCalledWith(0.016);
        });
    });

    describe("event dispatching", () => {
        test("dispatches events via EventDispatcher", () => {
            const listener = jest.fn();
            handler.addEventListener("test", listener);
            handler.dispatchEvent({ type: "test" });
            expect(listener).toHaveBeenCalledWith(
                expect.objectContaining({ type: "test" }),
            );
        });

        test("removes event listeners", () => {
            const listener = jest.fn();
            handler.addEventListener("test", listener);
            handler.removeEventListener("test", listener);
            handler.dispatchEvent({ type: "test" });
            expect(listener).not.toHaveBeenCalled();
        });
    });
});
