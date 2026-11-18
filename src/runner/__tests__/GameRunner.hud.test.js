/** @jest-environment jsdom */
import { GameRunner } from "../GameRunner";
import UI from "../../ui/hud";
import config from "../../core/config";

jest.mock("../../physics", () => ({
    __esModule: true,
    PHYSICS_STATES: { READY: "ready" },
    default: { waitForState: () => Promise.resolve(), pause: jest.fn(), resume: jest.fn() },
}));
jest.mock("../../core/Importer", () => ({
    Importer: {
        importLevelSnapshot: jest.fn(() => Promise.resolve()),
        parseLevelData: jest.fn(),
    },
}));
jest.mock("../../audio/Audio", () => ({
    __esModule: true,
    default: { hasContext: jest.fn(() => false), context: null },
}));
jest.mock("../../core/input/Input", () => ({
    __esModule: true,
    default: { setPaused: jest.fn(), dispatchMissedReleases: jest.fn() },
}));
jest.mock("../../core/universe", () => ({
    __esModule: true,
    default: { onPause: jest.fn(), onResume: jest.fn() },
}));
jest.mock("../../lib/easing", () => ({
    pauseAllTweens: jest.fn(),
    resumeAllTweens: jest.fn(),
    clearAllTweens: jest.fn(),
}));
jest.mock("../../core/Level", () => ({ __esModule: true, default: class {} }));
jest.mock("../../ui", () => ({
    requestLoadingScreen: jest.fn(),
    removeLoadingScreen: jest.fn(),
}));

const button = name => ({
    name,
    type: "button",
    text: name,
    anchor: "center",
    offset: { x: 0, y: 0 },
});

let seenInOnCreate;

class HudLevel {
    constructor(cfg) {
        this.cfg = cfg;
        this.dispose = jest.fn();
    }
    getPath() {
        return this.cfg.path;
    }
    prepareScene() {}
    init() {
        return Promise.resolve().then(() => this.onCreate());
    }
    onCreate() {
        seenInOnCreate = UI.has("start") ? UI.get("start") : null;
    }
}

const setHud = (path, hud, enabled = true) => {
    jest.spyOn(config, "ui").mockImplementation(level =>
        level === path ? { enabled, hud } : undefined,
    );
};

describe("GameRunner HUD lifecycle", () => {
    let runner;

    beforeEach(() => {
        config.setContainer("#game");
        document.body.innerHTML = "";
        UI.clear();
        seenInOnCreate = undefined;
        runner = new GameRunner();
        runner.register("menu", HudLevel);
        runner.register("game", HudLevel);
        jest.spyOn(config, "getLevelData").mockReturnValue({});
    });

    afterEach(() => jest.restoreAllMocks());

    it("builds the HUD before init so onCreate can reach widgets, even when ui is disabled", async () => {
        setHud("menu", { elements: [button("start")] }, false);
        await runner.start("menu");

        expect(seenInOnCreate).not.toBeNull();
        expect(seenInOnCreate.name).toBe("start");
    });

    it("clears code-created and config widgets when switching level", async () => {
        setHud("menu", { elements: [button("start")] });
        await runner.start("menu");
        UI.create(button("fromCode"));
        expect(UI.has("fromCode")).toBe(true);

        setHud("game", { elements: [button("score")] });
        await runner.start("game");

        expect(UI.has("start")).toBe(false);
        expect(UI.has("fromCode")).toBe(false);
        expect(UI.has("score")).toBe(true);
        expect(document.querySelectorAll(".mage-hud button")).toHaveLength(1);
    });

    it("disposeCurrentLevel clears the HUD", async () => {
        setHud("menu", { elements: [button("start")] });
        await runner.start("menu");
        runner.disposeCurrentLevel();

        expect(UI.getAll()).toEqual([]);
    });
});
