const mockRenderer = {
    info: { autoReset: true, reset: jest.fn(), render: { calls: 0, triangles: 0 } },
    domElement: { id: "" },
    shadowMap: {},
    setPixelRatio: jest.fn(),
    setSize: jest.fn(),
    setRenderTarget: jest.fn(),
    clearDepth: jest.fn(),
    render: jest.fn(),
    dispose: jest.fn(),
    autoClear: true,
};

jest.mock("three", () => ({
    ...jest.requireActual("three"),
    WebGLRenderer: jest.fn(() => mockRenderer),
}));
jest.mock("../../physics", () => ({
    __esModule: true,
    default: { addEventListener: jest.fn(), removeEventListener: jest.fn() },
}));
jest.mock("../../controls/Controls", () => ({ __esModule: true, default: {} }));
jest.mock("../../images/Images", () => ({ __esModule: true, default: {} }));

import { Object3D, PerspectiveCamera } from "three";
import SceneSingleton from "../Scene";
import Universe from "../universe";
import Config from "../config";

const Scene = SceneSingleton;

beforeEach(() => {
    jest.clearAllMocks();
    global.window = {
        devicePixelRatio: 1,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
    };
    global.document = { body: { appendChild: jest.fn(), querySelector: jest.fn() } };
    jest.spyOn(Config, "screen").mockReturnValue({ w: 100, h: 100 });
    jest.spyOn(Config, "container").mockReturnValue(null);
    jest.spyOn(Config, "lights").mockReturnValue({ shadows: false });
    jest.spyOn(Config, "fog").mockReturnValue({ enabled: false });
    Scene.createScene("test");
});

const makeCamera = () => {
    const body = new PerspectiveCamera();
    return { body, camera: { getBody: () => body } };
};

describe("Scene gizmo scene", () => {
    test("createRenderer disables renderer.info.autoReset", () => {
        Scene.createRenderer();
        expect(Scene.getRenderer().info.autoReset).toBe(false);
    });

    test("createScene creates a separate gizmoScene without background", () => {
        expect(Scene.gizmoScene).toBeDefined();
        expect(Scene.gizmoScene).not.toBe(Scene.getScene());
        expect(Scene.gizmoScene.background).toBeNull();
    });

    test("addGizmo/removeGizmo only touch gizmoScene children", () => {
        const universeSpy = jest.spyOn(Universe, "set");
        const obj = new Object3D();
        Scene.addGizmo(obj);
        expect(Scene.gizmoScene.children).toContain(obj);
        expect(Scene.getScene().children).not.toContain(obj);
        expect(Scene.elements).toHaveLength(0);
        expect(universeSpy).not.toHaveBeenCalled();

        Scene.removeGizmo(obj);
        expect(Scene.gizmoScene.children).not.toContain(obj);
    });

    test("createCamera enables layer 1 and leaves layer 2 disabled", () => {
        const { body, camera } = makeCamera();
        Scene.createCamera(camera);
        expect((body.layers.mask & (1 << 1)) !== 0).toBe(true);
        expect((body.layers.mask & (1 << 2)) !== 0).toBe(false);
    });

    describe("renderGizmoLayer", () => {
        let body;
        beforeEach(() => {
            Scene.createRenderer();
            const made = makeCamera();
            body = made.body;
            Scene.createCamera(made.camera);
        });

        test("makes no renderer call when no gizmo child is visible", () => {
            const hidden = new Object3D();
            hidden.visible = false;
            Scene.addGizmo(hidden);
            Scene.renderGizmoLayer();
            expect(mockRenderer.render).not.toHaveBeenCalled();
            expect(mockRenderer.clearDepth).not.toHaveBeenCalled();
        });

        test("renders gizmoScene with layer 2 only and restores the mask", () => {
            Scene.addGizmo(new Object3D());
            const originalMask = body.layers.mask;
            let maskDuringRender;
            mockRenderer.render.mockImplementation(() => {
                maskDuringRender = body.layers.mask;
            });

            Scene.renderGizmoLayer();

            expect(mockRenderer.render).toHaveBeenCalledWith(Scene.gizmoScene, body);
            expect(mockRenderer.render).not.toHaveBeenCalledWith(Scene.getScene(), body);
            expect(maskDuringRender).toBe(1 << 2);
            expect(body.layers.mask).toBe(originalMask);
        });
    });

    test("dispose clears gizmoScene", () => {
        Scene.createRenderer();
        Scene.addGizmo(new Object3D());
        Scene.dispose();
        expect(Scene.gizmoScene.children).toHaveLength(0);
    });
});
