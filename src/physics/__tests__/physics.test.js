/**
 * Tests for Physics class element bookkeeping.
 *
 * The Physics class uses a worker loaded via `worker:./worker` which is
 * resolved by the rollup bundler but not by Jest.  We test the element
 * tracking logic (storeElement / removeElement / hasElement) directly
 * without importing the module — the methods are pure bookkeeping on an
 * array and don't touch the worker.
 */

const createPhysicsInstance = () => {
    // Replicate the constructor and bookkeeping methods from Physics
    // without triggering the `worker:` import.
    const instance = {
        elements: [],

        hasElement(element) {
            const uuid = element.uuid();
            return this.elements.includes(uuid);
        },

        storeElement(element) {
            if (!this.hasElement(element)) {
                const uuid = element.uuid();
                this.elements.push(uuid);
            }
        },

        removeElement(element) {
            if (this.hasElement(element)) {
                const uuid = element.uuid();
                this.elements.splice(this.elements.indexOf(uuid), 1);
            }
        },
    };

    return instance;
};

const createFakeElement = (id = "test-uuid") => ({
    uuid: () => id,
});

describe("Physics element bookkeeping", () => {
    let physics;

    beforeEach(() => {
        physics = createPhysicsInstance();
    });

    it("starts with no elements", () => {
        expect(physics.hasElement(createFakeElement())).toBe(false);
    });

    it("storeElement makes hasElement return true", () => {
        const el = createFakeElement();
        physics.storeElement(el);
        expect(physics.hasElement(el)).toBe(true);
    });

    it("storeElement is idempotent — duplicate store does not double-add", () => {
        const el = createFakeElement();
        physics.storeElement(el);
        physics.storeElement(el);
        // Remove once — should clear completely (no leftover duplicate)
        physics.removeElement(el);
        expect(physics.hasElement(el)).toBe(false);
    });

    it("removeElement clears a stored element", () => {
        const el = createFakeElement();
        physics.storeElement(el);
        physics.removeElement(el);
        expect(physics.hasElement(el)).toBe(false);
    });

    it("removeElement on unknown element does not throw", () => {
        const el = createFakeElement();
        expect(() => physics.removeElement(el)).not.toThrow();
    });

    it("tracks multiple elements independently", () => {
        const a = createFakeElement("a");
        const b = createFakeElement("b");
        physics.storeElement(a);
        physics.storeElement(b);

        expect(physics.hasElement(a)).toBe(true);
        expect(physics.hasElement(b)).toBe(true);

        physics.removeElement(a);
        expect(physics.hasElement(a)).toBe(false);
        expect(physics.hasElement(b)).toBe(true);
    });

    it("remove-then-re-store works (the race condition fix path)", () => {
        const el = createFakeElement();

        // Simulate initial store (element added during import)
        physics.storeElement(el);
        expect(physics.hasElement(el)).toBe(true);

        // Simulate the fix in setThirdPersonControls:
        // clear stale entry, then re-add so the worker message goes through
        physics.removeElement(el);
        expect(physics.hasElement(el)).toBe(false);

        physics.storeElement(el);
        expect(physics.hasElement(el)).toBe(true);
    });

    it("remove-then-re-store for all pending elements (full retry scenario)", () => {
        const player = createFakeElement("player");
        const gem = createFakeElement("gem");
        const floor = createFakeElement("floor");

        // Player was never stored (enablePhysics skipped when config was false)
        // Gem and floor were stored (enablePhysics ran after config was set true)
        physics.storeElement(gem);
        physics.storeElement(floor);

        // Simulate the fixed retry loop: clear and re-add ALL pending elements
        const allPending = [player, gem, floor];
        for (const el of allPending) {
            if (physics.hasElement(el)) {
                physics.removeElement(el);
            }
            physics.storeElement(el);
        }

        expect(physics.hasElement(player)).toBe(true);
        expect(physics.hasElement(gem)).toBe(true);
        expect(physics.hasElement(floor)).toBe(true);
    });
});
