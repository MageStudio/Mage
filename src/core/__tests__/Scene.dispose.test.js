const mockRenderer = {
    info: { autoReset: true, reset: jest.fn() },
    domElement: { id: "" },
    shadowMap: {},
    setPixelRatio: jest.fn(),
    setSize: jest.fn(),
    dispose: jest.fn(),
    forceContextLoss: jest.fn(),
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

import Scene from "../Scene";

const makeCanvas = parentNode => {
    const canvas = { id: "", parentNode };
    canvas.remove = jest.fn(() => {
        canvas.parentNode = null;
    });
    return canvas;
};

beforeEach(() => {
    jest.clearAllMocks();
    global.window = {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
    };
    global.document = { body: { appendChild: jest.fn(), querySelector: jest.fn() } };
    Scene.rendererElements = {};
    Scene.renderer = mockRenderer;
});

const attach = canvas => {
    canvas.id = Scene.storeRenderer(canvas);
    mockRenderer.domElement = canvas;
};

test("dispose releases the context, removes the canvas and forgets it", () => {
    const canvas = makeCanvas({});
    attach(canvas);

    Scene.dispose();

    expect(Object.keys(Scene.rendererElements)).toEqual([]);
    expect(canvas.remove).toHaveBeenCalledTimes(1);
    expect(mockRenderer.dispose).toHaveBeenCalledTimes(1);
    expect(mockRenderer.forceContextLoss).toHaveBeenCalledTimes(1);
    expect(Scene.renderer).toBe(mockRenderer);
});

test("dispose does not throw when the canvas has no parent", () => {
    const canvas = makeCanvas(null);
    attach(canvas);

    expect(() => Scene.dispose()).not.toThrow();
    expect(Object.keys(Scene.rendererElements)).toEqual([]);
    expect(mockRenderer.forceContextLoss).toHaveBeenCalledTimes(1);
});
