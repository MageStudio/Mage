import { Mesh, BoxGeometry, Quaternion, Euler } from "three";
import { PHYSICS_EVENTS } from "../messages";
import { COLLIDER_TYPES } from "../constants";

jest.mock("worker:./worker", () => ({ __esModule: true, default: class {} }), { virtual: true });
jest.mock("../../core/config", () => ({
    __esModule: true,
    default: { physics: () => ({ enabled: true }) },
}));

import Physics from "../index";

const makeElement = (id, options, body, children = []) => {
    const el = {
        children,
        isPhysicsEnabled: () => true,
        uuid: () => id,
        getPhysicsOptions: key => (key ? options[key] : options),
        getBody: () => body,
        getParent: () => el._parent || null,
    };
    children.forEach(child => {
        child._parent = el;
    });
    return el;
};

const near = (a, b, eps = 1e-3) => Math.abs(a - b) < eps;

// platform (NONE, kinematic) > swiper (BOX) > tip (BOX, nested physics child)
const makeRealized = () => {
    const rootBody = new Mesh(new BoxGeometry(1, 1, 1));
    const swiperBody = new Mesh(new BoxGeometry(4, 0.5, 0.5));
    const tipBody = new Mesh(new BoxGeometry(0.5, 0.5, 0.5));
    swiperBody.position.set(2, 1, 0);
    tipBody.position.set(1, 0, 0);
    rootBody.add(swiperBody);
    swiperBody.add(tipBody);
    rootBody.updateMatrixWorld(true);

    const tip = makeElement("tip", { colliderType: COLLIDER_TYPES.BOX }, tipBody);
    const swiper = makeElement("swiper", { colliderType: COLLIDER_TYPES.BOX }, swiperBody, [tip]);
    const root = makeElement(
        "platform",
        { colliderType: COLLIDER_TYPES.NONE, kinematic: true, mass: 0 },
        rootBody,
        [swiper],
    );
    Physics.realizeSubtree(root);
    return { root, rootBody, swiper, swiperBody, tip, tipBody };
};

const messages = () => Physics.worker.postMessage.mock.calls.map(c => c[0]);

beforeEach(() => {
    jest.useFakeTimers();
    Physics.elements = [];
    Physics.pendingRefreshRoots = new Map();
    Physics.refreshTimer = null;
    Physics.worker = { postMessage: jest.fn() };
});

afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
});

describe("Physics.updateCompoundMember", () => {
    it("posts a child transform update instead of rebuilding the root", () => {
        const { swiper, swiperBody } = makeRealized();
        Physics.worker.postMessage.mockClear();

        swiperBody.quaternion.setFromEuler(new Euler(0, Math.PI / 2, 0));
        swiperBody.updateMatrixWorld(true);
        Physics.updateCompoundMember(swiper);
        jest.runAllTimers();

        const sent = messages();
        expect(sent.map(m => m.event)).toEqual([PHYSICS_EVENTS.ELEMENT.SET.CHILD_TRANSFORM]);
        expect(sent[0].uuid).toBe("platform");
        const update = sent[0].children.find(c => c.uuid === "swiper");
        const expected = new Quaternion().setFromEuler(new Euler(0, Math.PI / 2, 0));
        expect(near(update.localQuaternion.y, expected.y)).toBe(true);
        expect(near(update.localQuaternion.w, expected.w)).toBe(true);
        expect(near(update.localPosition.x, 2)).toBe(true);
    });

    it("also updates physics descendants of the moved member", () => {
        const { swiper, swiperBody } = makeRealized();
        Physics.worker.postMessage.mockClear();

        swiperBody.position.set(2, 3, 0);
        swiperBody.updateMatrixWorld(true);
        Physics.updateCompoundMember(swiper);

        const [msg] = messages();
        expect(msg.children.map(c => c.uuid).sort()).toEqual(["swiper", "tip"]);
        const tipUpdate = msg.children.find(c => c.uuid === "tip");
        expect(near(tipUpdate.localPosition.x, 3)).toBe(true);
        expect(near(tipUpdate.localPosition.y, 3)).toBe(true);
    });

    it("skips members without a shape (colliderType NONE)", () => {
        const { swiper, swiperBody } = makeRealized();
        swiper.getPhysicsOptions = () => ({ colliderType: COLLIDER_TYPES.NONE });
        Physics.worker.postMessage.mockClear();

        swiperBody.position.set(2, 3, 0);
        swiperBody.updateMatrixWorld(true);
        Physics.updateCompoundMember(swiper);

        const [msg] = messages();
        expect(msg.children.map(c => c.uuid)).toEqual(["tip"]);
    });

    it("does nothing for elements outside a realized body", () => {
        const lone = makeElement("lone", { colliderType: COLLIDER_TYPES.BOX }, new Mesh());
        Physics.updateCompoundMember(lone);
        expect(Physics.worker.postMessage).not.toHaveBeenCalled();
    });

    it("leaves a pending rebuild to pick the change up", () => {
        const { swiper } = makeRealized();
        Physics.worker.postMessage.mockClear();

        Physics.refreshOwningBody(swiper);
        Physics.updateCompoundMember(swiper);
        expect(Physics.worker.postMessage).not.toHaveBeenCalled();
    });

    it("never disposes or re-adds the root across 60 frames of child rotation", () => {
        const { swiper, swiperBody } = makeRealized();
        Physics.worker.postMessage.mockClear();

        for (let i = 0; i < 60; i++) {
            swiperBody.rotation.y = i * 0.1;
            swiperBody.updateMatrixWorld(true);
            Physics.updateCompoundMember(swiper);
            jest.runAllTimers();
        }
        const events = messages().map(m => m.event);
        expect(events).toHaveLength(60);
        expect(events).not.toContain(PHYSICS_EVENTS.ELEMENT.DISPOSE);
        expect(events).not.toContain(PHYSICS_EVENTS.ADD.COMPOUND);
    });
});
