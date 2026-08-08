import { Mesh, BoxGeometry } from "three";
import { PHYSICS_EVENTS } from "../messages";
import { COLLIDER_TYPES } from "../constants";

jest.mock("worker:./worker", () => ({ __esModule: true, default: class {} }), { virtual: true });
jest.mock("../../core/config", () => ({
    __esModule: true,
    default: { physics: () => ({ enabled: true }) },
}));

import Physics from "../index";

// Two hulls, each a unit cube, offset either side of the model origin — the
// shape a decomposed archway or a two-lump rock produces.
const TWO_HULLS = [{ points: cube(-2) }, { points: cube(2) }];

function cube(offsetX) {
    const points = [];
    for (const x of [-0.5, 0.5]) {
        for (const y of [-0.5, 0.5]) {
            for (const z of [-0.5, 0.5]) points.push(x + offsetX, y, z);
        }
    }
    return points;
}

const makeElement = (id, options, body, { hulls = null, children = [] } = {}) => ({
    children,
    isPhysicsEnabled: () => true,
    uuid: () => id,
    getPhysicsOptions: key => (key ? options[key] : options),
    getBody: () => body,
    getCollisionHulls: () => hulls,
});

const boxMesh = (size = 2) => {
    const mesh = new Mesh(new BoxGeometry(size, size, size));
    mesh.updateMatrixWorld(true);
    return mesh;
};

const lastMessage = () => {
    const calls = Physics.worker.postMessage.mock.calls;
    return calls[calls.length - 1][0];
};

beforeEach(() => {
    Physics.elements = [];
    Physics.worker = { postMessage: jest.fn() };
});

describe("stored collision variants", () => {
    it("emits one compound leaf per stored hull", () => {
        const element = makeElement(
            "rock",
            { colliderType: COLLIDER_TYPES.MODEL_SHAPE, collisionVariant: "detailed" },
            boxMesh(2),
            { hulls: TWO_HULLS },
        );

        Physics.realizeSubtree(element);

        const message = lastMessage();
        expect(message.event).toBe(PHYSICS_EVENTS.ADD.COMPOUND);
        // One element, two shapes — this is what a single computed hull cannot do.
        expect(message.shapes).toHaveLength(2);
        message.shapes.forEach(shape => {
            expect(shape.colliderType).toBe(COLLIDER_TYPES.MODEL_SHAPE);
            expect(shape.points).toHaveLength(24);
        });
    });

    it("gives every leaf the element's uuid so contacts still resolve to the model", () => {
        const element = makeElement(
            "rock",
            { colliderType: COLLIDER_TYPES.MODEL_SHAPE, collisionVariant: "detailed" },
            boxMesh(2),
            { hulls: TWO_HULLS },
        );

        Physics.realizeSubtree(element);

        expect(lastMessage().shapes.map(s => s.childUuid)).toEqual(["rock", "rock"]);
    });

    it("keeps each hull's own offset rather than centring it", () => {
        // Stored points encode where each piece sits relative to the model
        // origin, so the leaves share a placement and differ in their points.
        const element = makeElement(
            "rock",
            { colliderType: COLLIDER_TYPES.MODEL_SHAPE, collisionVariant: "detailed" },
            boxMesh(2),
            { hulls: TWO_HULLS },
        );

        Physics.realizeSubtree(element);

        const [first, second] = lastMessage().shapes;
        expect(first.localPosition).toEqual(second.localPosition);
        expect(Math.min(...first.points.filter((_, i) => i % 3 === 0))).toBeCloseTo(-2.5);
        expect(Math.min(...second.points.filter((_, i) => i % 3 === 0))).toBeCloseTo(1.5);
    });

    it("bakes the instance's scale into the stored points", () => {
        // Hulls are stored unscaled and shared by every instance, so the scale
        // has to be applied per instance — a compound leaf has none of its own.
        const body = boxMesh(2);
        body.scale.set(3, 1, 1);
        body.updateMatrixWorld(true);

        const element = makeElement(
            "rock",
            { colliderType: COLLIDER_TYPES.MODEL_SHAPE, collisionVariant: "detailed" },
            body,
            { hulls: TWO_HULLS },
        );

        Physics.realizeSubtree(element);

        const [first] = lastMessage().shapes;
        expect(Math.min(...first.points.filter((_, i) => i % 3 === 0))).toBeCloseTo(-7.5);
        expect(first.width).toBeCloseTo(3);
    });

    it("positions the leaves relative to the compound root", () => {
        const rootBody = boxMesh(2);
        const childBody = boxMesh(2);
        childBody.position.set(4, 0, 0);
        rootBody.add(childBody);
        rootBody.updateMatrixWorld(true);

        const child = makeElement(
            "model",
            { colliderType: COLLIDER_TYPES.MODEL_SHAPE, collisionVariant: "detailed" },
            childBody,
            { hulls: TWO_HULLS },
        );
        const root = makeElement("root", { colliderType: COLLIDER_TYPES.BOX }, rootBody, {
            children: [child],
        });

        Physics.realizeSubtree(root);

        const message = lastMessage();
        // Root box + two hull leaves from the welded child.
        expect(message.shapes).toHaveLength(3);
        expect(message.shapes[1].localPosition.x).toBeCloseTo(4);
        expect(message.shapes[2].localPosition.x).toBeCloseTo(4);
    });

    it("falls back to a computed hull when the element has no variant", () => {
        const element = makeElement(
            "rock",
            { colliderType: COLLIDER_TYPES.MODEL_SHAPE },
            boxMesh(2),
            { hulls: null },
        );

        Physics.realizeSubtree(element);

        // The single measured hull: 8 corners of the box.
        expect(lastMessage().shapes).toHaveLength(1);
        expect(lastMessage().shapes[0].points).toHaveLength(24);
    });

    it("skips a stored hull too small to build", () => {
        const element = makeElement(
            "rock",
            { colliderType: COLLIDER_TYPES.MODEL_SHAPE, collisionVariant: "detailed" },
            boxMesh(2),
            { hulls: [{ points: [0, 0, 0] }, { points: cube(0) }] },
        );

        Physics.realizeSubtree(element);

        expect(lastMessage().shapes).toHaveLength(1);
    });
});
