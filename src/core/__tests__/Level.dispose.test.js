jest.mock("three", () => require("../../../__mocks__/three"));
jest.mock("../Assets", () => ({}));
jest.mock("../universe", () => ({ bigfreeze: jest.fn() }));
jest.mock("../Scene", () => ({ dispose: jest.fn() }));
jest.mock("../Stats", () => ({}));
jest.mock("../Instancing", () => ({ setEnabled: jest.fn() }));
jest.mock("../../audio/Audio", () => ({ dispose: jest.fn() }));
jest.mock("../../fx/postprocessing/PostProcessing", () => ({ dispose: jest.fn() }));
jest.mock("../../fx/particles/Particles", () => ({ dispose: jest.fn() }));
jest.mock("../input/Input", () => ({ __esModule: true, default: { disable: jest.fn() } }));
jest.mock("../../lights/Lights", () => ({ dispose: jest.fn() }));
jest.mock("../../controls/Controls", () => ({ dispose: jest.fn() }));
jest.mock("../../physics", () => ({ dispose: jest.fn() }));
jest.mock("../../entities/camera", () => jest.fn());

import Level from "../Level";
import Input from "../input/Input";

describe("Level.dispose", () => {
    beforeEach(() => {
        global.cancelAnimationFrame = jest.fn();
    });

    it("disables Input", () => {
        const level = new Level();
        level.dispose();

        expect(Input.disable).toHaveBeenCalledTimes(1);
    });
});
