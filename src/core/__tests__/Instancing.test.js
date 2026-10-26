// Instancing draws repeated identical meshes as one InstancedMesh each. These tests use the REAL
// `three` and the real Scene/Element/Universe so the scene graph, matrixWorld math and the
// element bookkeeping are genuinely exercised.
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
import Instancing, { Instancing as InstancingClass } from "../Instancing";

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
const leafMeshes = element => {
    const meshes = [];
    element.getBody().traverse(c => c.isMesh && meshes.push(c));
    return meshes;
};

describe("Instancing", () => {
    let source;

    beforeEach(() => {
        Instancing.setEnabled(false);
        Universe.reset();
        Scene.createScene("instancing-test");
        source = makeSource();
        Instancing.setEnabled(true);
    });

    afterEach(() => {
        Instancing.setEnabled(false);
    });

    test("is a disabled singleton by default", () => {
        const fresh = new InstancingClass();
        expect(fresh.isEnabled()).toBe(false);
        expect(fresh.getStats()).toEqual({ groups: 0, meshes: 0 });
        expect(Instancing).toBeInstanceOf(InstancingClass);
    });

    test("update does nothing while disabled", () => {
        Instancing.setEnabled(false);
        makeCopies(source, 3);
        Instancing.update();
        expect(instancedMeshes()).toHaveLength(0);
        expect(Scene.getScene().autoUpdate).toBe(true);
    });

    test("batches repeated meshes into one InstancedMesh per geometry/material pair", () => {
        const elements = makeCopies(source, 5);
        Instancing.markDirty();
        Instancing.update();

        const instanced = instancedMeshes();
        expect(instanced).toHaveLength(2);
        instanced.forEach(im => {
            expect(im.count).toBe(5);
            expect(im.frustumCulled).toBe(false);
            expect(im.userData.mageInstancing).toBe(true);
        });
        elements.forEach(e => leafMeshes(e).forEach(m => expect(m.visible).toBe(false)));
        expect(Instancing.getStats()).toEqual({ groups: 2, meshes: 10 });
    });

    test("a single copy is not instanced and stays visible", () => {
        const [only] = makeCopies(source, 1);
        Instancing.markDirty();
        Instancing.update();

        expect(instancedMeshes()).toHaveLength(0);
        leafMeshes(only).forEach(m => expect(m.visible).toBe(true));
        expect(Instancing.getStats()).toEqual({ groups: 0, meshes: 0 });
    });

    describe("eligibility", () => {
        const batchedCount = () => Instancing.getStats().meshes;

        test("skinned meshes are never instanced", () => {
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshStandardMaterial();
            [1, 2].forEach(() => {
                const group = new THREE.Group();
                const mesh = new THREE.Mesh(geometry, material);
                mesh.isSkinnedMesh = true;
                group.add(mesh);
                makeModel(group);
            });
            Instancing.markDirty();
            Instancing.update();
            expect(batchedCount()).toBe(0);
        });

        test("array materials are never instanced", () => {
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const materials = [new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial()];
            [1, 2].forEach(() => {
                const group = new THREE.Group();
                group.add(new THREE.Mesh(geometry, materials));
                makeModel(group);
            });
            Instancing.markDirty();
            Instancing.update();
            expect(batchedCount()).toBe(0);
        });

        test("transparent materials are never instanced", () => {
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshStandardMaterial({ transparent: true });
            [1, 2].forEach(() => {
                const group = new THREE.Group();
                group.add(new THREE.Mesh(geometry, material));
                makeModel(group);
            });
            Instancing.markDirty();
            Instancing.update();
            expect(batchedCount()).toBe(0);
        });

        test("meshes of an element with an animation handler are never instanced", () => {
            const elements = makeCopies(source, 3);
            elements[0].animationHandler = {};
            elements[1].animationHandler = {};
            elements[2].animationHandler = {};
            Instancing.markDirty();
            Instancing.update();
            expect(batchedCount()).toBe(0);
        });

        test("meshes on layer 1 or 2 are never instanced", () => {
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshStandardMaterial();
            [1, 2].forEach(layer => {
                [1, 2].forEach(() => {
                    const group = new THREE.Group();
                    const mesh = new THREE.Mesh(geometry, material);
                    mesh.layers.set(layer);
                    group.add(mesh);
                    makeModel(group);
                });
            });
            Instancing.markDirty();
            Instancing.update();
            expect(batchedCount()).toBe(0);
        });

        test("a body that is itself a Mesh is never instanced", () => {
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshStandardMaterial();
            const bodies = [1, 2].map(() => new THREE.Mesh(geometry, material));
            bodies.forEach(makeModel);
            Instancing.markDirty();
            Instancing.update();
            expect(batchedCount()).toBe(0);
            bodies.forEach(b => expect(b.visible).toBe(true));
        });

        test("non-model elements are never instanced", () => {
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshStandardMaterial();
            [1, 2].forEach(() => {
                const group = new THREE.Group();
                group.add(new THREE.Mesh(geometry, material));
                new Element({ body: group, name: `plain-${nameCounter++}` });
            });
            Instancing.markDirty();
            Instancing.update();
            expect(batchedCount()).toBe(0);
        });
    });

    describe("sync", () => {
        test("writes a moved member's matrixWorld and bumps the instance matrix version", () => {
            const elements = makeCopies(source, 3);
            Instancing.markDirty();
            Instancing.update();

            const [im] = instancedMeshes();
            const before = im.instanceMatrix.version;

            elements[1].setPosition({ x: 7, y: 2, z: -3 });
            Instancing.update();

            expect(im.instanceMatrix.version).toBeGreaterThan(before);
            const written = new THREE.Matrix4();
            const memberMesh = leafMeshes(elements[1])[0];
            const instanceIndex = [0, 1, 2].find(i => {
                im.getMatrixAt(i, written);
                return written.equals(memberMesh.matrixWorld);
            });
            expect(instanceIndex).toBeDefined();
            expect(memberMesh.matrixWorld.elements[12]).toBe(7);
        });

        test("a frame where nothing moved leaves the version unchanged", () => {
            makeCopies(source, 3);
            Instancing.markDirty();
            Instancing.update();
            const [im] = instancedMeshes();
            const before = im.instanceMatrix.version;

            Instancing.update();
            Instancing.update();

            expect(im.instanceMatrix.version).toBe(before);
        });

        test("a hidden element body gets a zero-scale matrix and gets its matrixWorld back", () => {
            const elements = makeCopies(source, 3);
            elements[0].setPosition({ x: 4, y: 0, z: 0 });
            Instancing.markDirty();
            Instancing.update();
            const [im] = instancedMeshes();
            const memberMesh = leafMeshes(elements[0])[0];
            const indexOf = () => {
                const m = new THREE.Matrix4();
                for (let i = 0; i < im.count; i++) {
                    im.getMatrixAt(i, m);
                    if (m.equals(memberMesh.matrixWorld)) return i;
                }
                return -1;
            };
            const hiddenIndex = indexOf();
            expect(hiddenIndex).toBeGreaterThanOrEqual(0);

            elements[0].getBody().visible = false;
            Instancing.update();
            const m = new THREE.Matrix4();
            im.getMatrixAt(hiddenIndex, m);
            const scale = new THREE.Vector3();
            m.decompose(new THREE.Vector3(), new THREE.Quaternion(), scale);
            expect(scale.toArray()).toEqual([0, 0, 0]);

            elements[0].getBody().visible = true;
            Instancing.update();
            im.getMatrixAt(hiddenIndex, m);
            expect(m.equals(memberMesh.matrixWorld)).toBe(true);
        });
    });

    describe("ejection", () => {
        const expectEjected = mesh => {
            expect(mesh.visible).toBe(true);
            expect(mesh.userData.mageInstancingEjected).toBe(true);
        };

        test("replacing a member's material ejects it for good", () => {
            const elements = makeCopies(source, 3);
            Instancing.markDirty();
            Instancing.update();

            const mesh = leafMeshes(elements[0])[0];
            mesh.material = new THREE.MeshStandardMaterial({ color: 0x0000ff });
            Instancing.update();

            expectEjected(mesh);
            expect(Instancing.getStats()).toEqual({ groups: 2, meshes: 5 });
            const batched = instancedMeshes().find(im => im.geometry === mesh.geometry);
            expect(batched.count).toBe(2);

            Instancing.markDirty();
            Instancing.update();
            expectEjected(mesh);
            expect(Instancing.getStats()).toEqual({ groups: 2, meshes: 5 });
        });

        test("flipping castShadow ejects the member", () => {
            const elements = makeCopies(source, 3);
            Instancing.markDirty();
            Instancing.update();

            const mesh = leafMeshes(elements[2])[1];
            mesh.castShadow = !mesh.castShadow;
            Instancing.update();
            expectEjected(mesh);

            Instancing.markDirty();
            Instancing.update();
            expectEjected(mesh);
            expect(Instancing.getStats().meshes).toBe(5);
        });

        test("removing an element drops its meshes, and a group below 2 is dissolved", () => {
            const [a, b] = makeCopies(source, 2);
            Instancing.markDirty();
            Instancing.update();
            expect(Instancing.getStats()).toEqual({ groups: 2, meshes: 4 });

            Scene.remove(a.getBody());
            Instancing.update();

            expect(instancedMeshes()).toHaveLength(0);
            expect(Instancing.getStats()).toEqual({ groups: 0, meshes: 0 });
            leafMeshes(b).forEach(m => {
                expect(m.visible).toBe(true);
                expect(m.userData.mageInstancingEjected).toBeUndefined();
            });
        });
    });

    test("regroup disposes every old InstancedMesh and never the shared geometry or material", () => {
        const elements = makeCopies(source, 3);
        Instancing.markDirty();
        Instancing.update();

        const old = instancedMeshes();
        const disposeSpies = old.map(() => jest.fn());
        old.forEach((im, i) => im.addEventListener("dispose", disposeSpies[i]));
        const sharedDisposed = jest.fn();
        const mesh = leafMeshes(elements[0])[0];
        mesh.geometry.addEventListener("dispose", sharedDisposed);
        mesh.material.addEventListener("dispose", sharedDisposed);

        Instancing.markDirty();
        Instancing.update();

        disposeSpies.forEach(spy => expect(spy).toHaveBeenCalledTimes(1));
        expect(sharedDisposed).not.toHaveBeenCalled();
        const fresh = instancedMeshes();
        expect(fresh).toHaveLength(2);
        fresh.forEach(im => expect(old).not.toContain(im));
    });

    test("setEnabled(false) restores everything; update keeps autoUpdate off while enabled", () => {
        const elements = makeCopies(source, 3);
        Instancing.markDirty();
        Instancing.update();
        expect(Scene.getScene().autoUpdate).toBe(false);

        const ejectedMesh = leafMeshes(elements[0])[0];
        ejectedMesh.material = new THREE.MeshStandardMaterial();
        Instancing.update();
        expect(Scene.getScene().autoUpdate).toBe(false);

        Instancing.setEnabled(false);

        expect(instancedMeshes()).toHaveLength(0);
        expect(Scene.getScene().autoUpdate).toBe(true);
        expect(Instancing.getStats()).toEqual({ groups: 0, meshes: 0 });
        elements.forEach(e =>
            leafMeshes(e).forEach(m => {
                expect(m.visible).toBe(true);
                if (m !== ejectedMesh) {
                    expect(m.userData.mageInstancingEjected).toBeUndefined();
                }
            }),
        );
    });

    test("picking hits the source mesh and never an InstancedMesh", () => {
        const [element] = makeCopies(source, 3);
        element.setPosition({ x: 0, y: 0, z: 0 });
        Instancing.markDirty();
        Instancing.update();

        const raycaster = new THREE.Raycaster(
            new THREE.Vector3(0, 0, 10),
            new THREE.Vector3(0, 0, -1),
        );
        const hits = raycaster.intersectObjects(Scene.getScene().children, true);

        expect(hits.length).toBeGreaterThan(0);
        hits.forEach(hit => expect(hit.object.isInstancedMesh).toBeFalsy());
        expect(leafMeshes(element)).toContain(hits[0].object);
    });

    test("hierarchy and serialisation are identical with instancing on or off", () => {
        makeCopies(source, 3);
        Instancing.markDirty();
        Instancing.update();
        expect(Instancing.getStats()).toEqual({ groups: 2, meshes: 6 });

        const withHierarchy = JSON.stringify(Scene.getHierarchy());
        const withUniverse = JSON.stringify(Universe.toJSON());

        Instancing.setEnabled(false);

        expect(JSON.stringify(Scene.getHierarchy())).toEqual(withHierarchy);
        expect(JSON.stringify(Universe.toJSON())).toEqual(withUniverse);
    });
});
