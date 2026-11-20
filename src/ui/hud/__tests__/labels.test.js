/** @jest-environment jsdom */
// Uses the real `three` so projection is genuinely exercised.
jest.mock("three", () => jest.requireActual("three"));
jest.mock("xstate", () => ({
    createMachine: jest.fn(),
    interpret: jest.fn(() => ({ start: jest.fn(), stop: jest.fn(), send: jest.fn() })),
}));
jest.mock("../../../scripts/Scripts", () => ({ get: jest.fn() }));
jest.mock("../../../core/Scene", () => ({ getScene: jest.fn(), remove: jest.fn() }));
jest.mock("../../../core/universe", () => ({
    getByTag: jest.fn(() => []),
    set: jest.fn(),
    remove: jest.fn(),
    getByUUID: jest.fn(),
}));
jest.mock("../../../lib/easing", () => ({ tweenTo: jest.fn(() => Promise.resolve()) }));
jest.mock("../../../lib/meshUtils", () => ({
    isScene: jest.fn(() => false),
    serializeQuaternion: jest.fn(q => q && { x: q.x, y: q.y, z: q.z, w: q.w }),
    serializeVector: jest.fn(v => v && { x: v.x, y: v.y, z: v.z }),
}));

import * as THREE from "three";
import Entity from "../../../entities/Entity";
import Config from "../../../core/config";
import UI from "../index";

const W = 800;
const H = 600;

const makeCamera = (z = 10) => {
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
    camera.position.set(0, 0, z);
    camera.updateMatrixWorld(true);
    return camera;
};

let counter = 0;
const makeEntity = (x = 0, y = 0, z = 0, name = `e${++counter}`) => {
    const entity = new Entity();
    const body = new THREE.Object3D();
    body.position.set(x, y, z);
    entity.setBody({ body });
    entity.setName(name);
    body.updateMatrixWorld(true);
    return entity;
};

const labelOf = entity => entity.getLabel().element;
const parseTranslate = element => {
    const [, x, y] = /translate\((-?[\d.e-]+)px, (-?[\d.e-]+)px\)/.exec(element.style.transform);
    return { x: Number(x), y: Number(y) };
};

beforeEach(() => {
    Config.setContainer("#game");
    UI.setEditMode(false);
    UI.clear();
    UI.labels.forEach(handle => handle.dispose());
    UI.labels.clear();
    document.body.innerHTML = "";
    Object.defineProperty(Config.container(), "offsetWidth", { value: W, configurable: true });
    Object.defineProperty(Config.container(), "offsetHeight", { value: H, configurable: true });
});

describe("layer", () => {
    it("renders the label in .mage-hud > .mage-labels with the base class, before widgets", () => {
        UI.create({ name: "w", type: "button", text: "x", anchor: "center" });
        const entity = makeEntity();
        entity.setLabel({ text: "Hero" });

        const root = document.querySelector(".mage-hud");
        expect(root.firstElementChild.className).toBe("mage-labels");
        const node = root.querySelector(".mage-labels > .mage-label");
        expect(node.textContent).toBe("Hero");
        expect(node.style.pointerEvents).toBe("none");
        expect(root.querySelector(".mage-labels").style.pointerEvents).toBe("none");
    });

    it("survives UI.clear() and UI.loadHUD(), and is not a HUD widget", () => {
        const entity = makeEntity();
        entity.setLabel({ text: "Hero" });
        UI.create({ name: "w", type: "button", text: "x", anchor: "center" });

        UI.clear();
        UI.loadHUD({ elements: [{ name: "n", type: "label", anchor: "top" }] });

        expect(document.querySelector(".mage-hud > .mage-labels > .mage-label")).toBe(
            labelOf(entity),
        );
        expect(document.querySelector(".mage-hud").firstElementChild.className).toBe("mage-labels");
        expect(UI.has(entity.getName())).toBe(false);
        expect(UI.getAll().map(h => h.name)).toEqual(["n"]);
        expect(() => UI.get(entity.getName())).toThrow();
    });

    it("injects the base look rule", () => {
        makeEntity().setLabel({ text: "a", style: { color: "red" } });
        const css = document.getElementById("mage-hud-styles").textContent;
        const rule = /\.mage-label \{[^}]*\}/.exec(css)[0];

        expect(rule).toContain("color: #ffffff");
        expect(rule).toContain("text-shadow: 0 1px 2px rgba(0,0,0,.85)");
        expect(rule).toContain("font: 14px/1.2 sans-serif");
        expect(rule).toContain("white-space: nowrap");
        expect(document.querySelector(".mage-label").style.color).toBe("red");
    });
});

describe("projection", () => {
    it("puts the bottom-centre on the projected point above the entity", () => {
        const entity = makeEntity(0, 0, 0);
        entity.setLabel({ text: "Hero", offset: { x: 0, y: 2, z: 0 } });
        const camera = makeCamera();

        UI.updateLabels(camera);

        const ndc = new THREE.Vector3(0, 2, 0).project(camera);
        const { x, y } = parseTranslate(labelOf(entity));
        expect(x).toBeCloseTo(((ndc.x + 1) / 2) * W, 3);
        expect(y).toBeCloseTo(((1 - ndc.y) / 2) * H, 3);
        expect(y).toBeLessThan(H / 2);
        expect(labelOf(entity).style.transform).toContain("translate(-50%, -100%)");
    });

    it("follows the entity and the camera, but not entity rotation", () => {
        const entity = makeEntity();
        entity.setLabel({ text: "Hero", offset: { x: 0, y: 2, z: 0 } });
        const camera = makeCamera();
        UI.updateLabels(camera);
        const before = labelOf(entity).style.transform;

        entity.getBody().rotation.z = Math.PI / 2;
        entity.getBody().updateMatrixWorld(true);
        UI.updateLabels(camera);
        expect(labelOf(entity).style.transform).toBe(before);

        entity.getBody().position.x = 3;
        entity.getBody().updateMatrixWorld(true);
        UI.updateLabels(camera);
        const moved = labelOf(entity).style.transform;
        expect(moved).not.toBe(before);

        camera.position.x = 2;
        camera.updateMatrixWorld(true);
        UI.updateLabels(camera);
        expect(labelOf(entity).style.transform).not.toBe(moved);
    });

    it("hides behind the camera and shows again in front", () => {
        const entity = makeEntity(0, 0, 20);
        entity.setLabel({ text: "Hero" });
        const camera = makeCamera(10);

        UI.updateLabels(camera);
        expect(labelOf(entity).style.display).toBe("none");

        entity.getBody().position.z = 0;
        entity.getBody().updateMatrixWorld(true);
        UI.updateLabels(camera);
        expect(labelOf(entity).style.display).toBe("");
    });

    it("hides beyond the far plane", () => {
        const entity = makeEntity(0, 0, -2000);
        entity.setLabel({ text: "Hero" });
        UI.updateLabels(makeCamera());
        expect(labelOf(entity).style.display).toBe("none");
    });

    it("applies maxDistance", () => {
        const entity = makeEntity(0, 0, 0);
        entity.setLabel({ text: "Hero", maxDistance: 10 });

        UI.updateLabels(makeCamera(11));
        expect(labelOf(entity).style.display).toBe("none");

        UI.updateLabels(makeCamera(9));
        expect(labelOf(entity).style.display).toBe("");
    });

    it("gives the nearer label the higher z-index", () => {
        const near = makeEntity(0, 0, 5);
        const far = makeEntity(0, 0, -5);
        near.setLabel({ text: "near" });
        far.setLabel({ text: "far" });

        UI.updateLabels(makeCamera());

        expect(Number(labelOf(near).style.zIndex)).toBeGreaterThan(
            Number(labelOf(far).style.zIndex),
        );
    });
});

describe("entity visibility", () => {
    it("hides with setVisible(false) without changing the label's own visibility", () => {
        const entity = makeEntity();
        entity.setLabel({ text: "Hero" });
        const camera = makeCamera();

        entity.setVisible(false);
        UI.updateLabels(camera);
        expect(labelOf(entity).style.display).toBe("none");
        expect(entity.getLabel().isVisible()).toBe(true);

        entity.setVisible(true);
        UI.updateLabels(camera);
        expect(labelOf(entity).style.display).toBe("");
        expect(entity.getLabel().isVisible()).toBe(true);
    });

    it("hides a child's label when the parent is hidden", () => {
        const parent = makeEntity();
        const child = makeEntity(0, 1, 0);
        parent.getBody().add(child.getBody());
        child.setLabel({ text: "kid" });
        const camera = makeCamera();

        parent.setVisible(false);
        UI.updateLabels(camera);
        expect(labelOf(child).style.display).toBe("none");
        expect(child.getLabel().isVisible()).toBe(true);
    });
});

describe("handle", () => {
    it("keeps the node on setText and renders markup literally", () => {
        const entity = makeEntity();
        const handle = entity.setLabel({ text: "a" });
        const node = labelOf(entity);

        handle.setText("x");
        expect(labelOf(entity)).toBe(node);
        expect(node.textContent).toBe("x");

        handle.setText("<b>x</b>");
        expect(node.textContent).toBe("<b>x</b>");
        expect(node.querySelector("b")).toBeNull();
        expect(handle.getText()).toBe("<b>x</b>");
    });

    it("has type label and the entity's name, and is the same as UI.getLabel", () => {
        const entity = makeEntity(0, 0, 0, "hero");
        const handle = entity.setLabel({ text: "a" });

        expect(handle.type).toBe("label");
        expect(handle.name).toBe("hero");
        expect(entity.getLabel()).toBe(handle);
        expect(UI.getLabel(entity)).toBe(handle);
    });

    it("throws on setAnchor and on click handlers", () => {
        const handle = makeEntity().setLabel({ text: "a" });

        expect(() => handle.setAnchor("center")).toThrow();
        expect(() => handle.on("click", () => {})).toThrow("Labels don't take clicks");
    });

    it("supports setStyle, show, hide and isVisible", () => {
        const handle = makeEntity().setLabel({ text: "a" });

        handle.setStyle({ color: "blue" });
        expect(handle.element.style.color).toBe("blue");
        handle.hide();
        expect(handle.isVisible()).toBe(false);
        expect(handle.element.style.display).toBe("none");
        handle.show();
        expect(handle.isVisible()).toBe(true);
        expect(handle.element.style.display).toBe("");
    });
});

describe("entity API", () => {
    it("throws for getLabel and removeLabel without a label", () => {
        const entity = makeEntity(0, 0, 0, "hero");

        expect(entity.hasLabel()).toBe(false);
        expect(() => entity.getLabel()).toThrow('Entity "hero" has no label');
        expect(() => entity.removeLabel()).toThrow('Entity "hero" has no label');
    });

    it("replaces the label on a second setLabel", () => {
        const entity = makeEntity();
        entity.setLabel({ text: "one" });
        entity.setLabel({ text: "two" });

        expect(document.querySelectorAll(".mage-label")).toHaveLength(1);
        expect(entity.getLabel().getText()).toBe("two");
    });

    it("removes the node on removeLabel and dispose", () => {
        const a = makeEntity();
        a.setLabel({ text: "a" });
        a.removeLabel();
        expect(document.querySelectorAll(".mage-label")).toHaveLength(0);
        expect(a.hasLabel()).toBe(false);

        const b = makeEntity();
        b.setLabel({ text: "b" });
        b.dispose();
        expect(document.querySelectorAll(".mage-label")).toHaveLength(0);
    });

    it("serialises the label, reflecting handle changes, and omits it when absent", () => {
        const entity = makeEntity();
        expect(entity.toJSON()).not.toHaveProperty("label");

        const handle = entity.setLabel({
            text: "Hero",
            offset: { x: 0, y: 2, z: 0 },
            maxDistance: 5,
            visible: true,
            style: { color: "red" },
        });
        handle.setText("Boss");
        handle.hide();
        handle.setStyle({ "font-size": "20px" });

        expect(entity.toJSON().label).toEqual({
            text: "Boss",
            offset: { x: 0, y: 2, z: 0 },
            maxDistance: 5,
            visible: false,
            style: { color: "red", "font-size": "20px" },
        });
    });
});

describe("edit mode", () => {
    it("ignores maxDistance", () => {
        const entity = makeEntity();
        entity.setLabel({ text: "a", maxDistance: 10 });
        UI.setEditMode(true);

        UI.updateLabels(makeCamera(50));
        expect(labelOf(entity).style.display).toBe("");
    });

    it("renders visible:false labels dimmed instead of hiding them", () => {
        const entity = makeEntity();
        entity.setLabel({ text: "a", visible: false });
        const camera = makeCamera();

        UI.updateLabels(camera);
        expect(labelOf(entity).style.display).toBe("none");

        UI.setEditMode(true);
        UI.updateLabels(camera);
        expect(labelOf(entity).style.display).toBe("");
        expect(labelOf(entity).classList.contains("mage-hud-hidden")).toBe(true);

        UI.setEditMode(false);
        expect(labelOf(entity).classList.contains("mage-hud-hidden")).toBe(false);
    });
});
