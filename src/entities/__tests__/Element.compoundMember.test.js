// Element's transform setters decide between a cheap compound-member update and a
// full rebuild of the owning body. Physics is spied on so only that routing is
// under test; the physics-side behaviour is covered in src/physics/__tests__.
jest.mock("three", () => jest.requireActual("three"));
jest.mock("xstate", () => ({
    createMachine: jest.fn(),
    interpret: jest.fn(() => ({
        start: jest.fn(),
        stop: jest.fn(),
        send: jest.fn(),
        onTransition: jest.fn(),
    })),
}));
jest.mock("../../lib/easing", () => ({ tweenTo: jest.fn(() => Promise.resolve()) }));

import * as THREE from "three";
import Element from "../Element";
import Physics from "../../physics";
import Scene from "../../core/Scene";

let member;

beforeEach(() => {
    Scene.createScene("compound-member-test");
    member = new Element({ body: new THREE.Object3D(), name: "member" });
    jest.spyOn(Physics, "hasElement").mockReturnValue(false);
    jest.spyOn(Physics, "updateCompoundMember").mockImplementation(() => {});
    jest.spyOn(Physics, "refreshOwningBody").mockImplementation(() => {});
});

afterEach(() => jest.restoreAllMocks());

describe("Element transform setters on a compound member", () => {
    it.each([
        ["setPosition", { x: 1, y: 2, z: 3 }],
        ["setRotation", { x: 0, y: 1, z: 0 }],
        ["setQuaternion", { x: 0, y: 0, z: 0, w: 1 }],
    ])("%s updates the member in place without rebuilding", (method, arg) => {
        member[method](arg);

        expect(Physics.updateCompoundMember).toHaveBeenCalledWith(member);
        expect(Physics.refreshOwningBody).not.toHaveBeenCalled();
    });

    it("setScale still rebuilds the owning body", () => {
        member.setScale({ x: 2, y: 2, z: 2 });

        expect(Physics.refreshOwningBody).toHaveBeenCalledWith(member);
        expect(Physics.updateCompoundMember).not.toHaveBeenCalled();
    });
});
