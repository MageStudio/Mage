import { PerspectiveCamera, Scene as THREEScene } from "three";

jest.mock("../../physics", () => ({
    __esModule: true,
    default: { addEventListener: jest.fn(), removeEventListener: jest.fn() },
    PHYSICS_CONSTANTS: { COLLIDER_TYPES: {} },
}));
jest.mock("../../images/Images", () => ({ __esModule: true, default: {} }));

import Scene from "../../core/Scene";
import Universe from "../../core/universe";
import Controls from "../Controls";

const makeDom = () => ({
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }),
});

describe("Controls.setTransformControls", () => {
    let control;

    beforeEach(() => {
        global.document = { addEventListener: jest.fn(), removeEventListener: jest.fn() };
        Scene.scene = new THREEScene();
        Scene.gizmoScene = new THREEScene();
        Scene.elements = [];
        jest.spyOn(Scene, "getCameraBody").mockReturnValue(new PerspectiveCamera());
        jest.spyOn(Scene, "getDOMElement").mockReturnValue(makeDom());
        control = Controls.setTransformControls();
    });

    afterEach(() => jest.restoreAllMocks());

    test("control lives in gizmoScene, not the level scene, and is not in Universe/elements", () => {
        expect(Scene.gizmoScene.children).toContain(control);
        expect(Scene.getScene().children).not.toContain(control);
        expect(Scene.elements).toHaveLength(0);
        expect(Universe.find(control)).toBeFalsy();
    });

    test("dispose removes the control from gizmoScene", () => {
        control.dispose();
        expect(Scene.gizmoScene.children).not.toContain(control);
    });

    test("gizmo and plane stay on layer 2", () => {
        const layer2 = 1 << 2;
        expect(control.gizmo.layers.mask).toBe(layer2);
        expect(control.plane.layers.mask).toBe(layer2);
    });
});
