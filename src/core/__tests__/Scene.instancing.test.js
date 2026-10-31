// Scene.add/remove mark instancing dirty (through Scene.elementsVersion), with the real Scene.
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
import Scene from "../Scene";
import Universe from "../universe";
import Element from "../../entities/Element";
import { ENTITY_TYPES } from "../../entities/constants";
import Instancing from "../Instancing";

const makeSource = () => {
    const geometryA = new THREE.BoxGeometry(1, 1, 1);
    const geometryB = new THREE.SphereGeometry(1, 8, 8);
    const materialA = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const materialB = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const group = new THREE.Group();
    group.add(new THREE.Mesh(geometryA, materialA));
    group.add(new THREE.Mesh(geometryB, materialB));
    return group;
};

let nameCounter = 0;
const makeModel = body => {
    const element = new Element({ body, name: `model-${nameCounter++}` });
    element.setEntityType(ENTITY_TYPES.MODEL.TYPE);
    element.setEntitySubtype(ENTITY_TYPES.MODEL.SUBTYPES.DEFAULT);
    return element;
};

const makeCopies = (source, count) =>
    Array.from({ length: count }, () => makeModel(source.clone()));

const instancedMeshes = () => Scene.getScene().children.filter(c => c.isInstancedMesh);

describe("Scene marks instancing dirty", () => {
    let source;

    beforeEach(() => {
        Instancing.setEnabled(false);
        Universe.reset();
        Scene.createScene("scene-instancing-test");
        source = makeSource();
        Instancing.setEnabled(true);
    });

    afterEach(() => Instancing.setEnabled(false));

    test("an element added after the first update joins its group without markDirty", () => {
        makeCopies(source, 2);
        Instancing.update();
        expect(Instancing.getStats()).toEqual({ groups: 2, meshes: 4 });

        makeCopies(source, 1);
        Instancing.update();

        expect(Instancing.getStats()).toEqual({ groups: 2, meshes: 6 });
        instancedMeshes().forEach(im => expect(im.count).toBe(3));
    });

    test("an element removed after the first update leaves its group without markDirty", () => {
        const [, , third] = makeCopies(source, 3);
        Instancing.update();
        expect(Instancing.getStats().meshes).toBe(6);

        Scene.remove(third.getBody());
        Instancing.update();

        expect(Instancing.getStats()).toEqual({ groups: 2, meshes: 4 });
    });

    test("createScene resets elementsVersion", () => {
        makeCopies(source, 1);
        expect(Scene.elementsVersion).toBeGreaterThan(0);
        Scene.createScene("another");
        expect(Scene.elementsVersion).toBe(0);
    });
});
