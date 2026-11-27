import { Mesh, BoxGeometry, Quaternion, Euler } from "three";
import { PHYSICS_EVENTS } from "../messages";
import { COLLIDER_TYPES } from "../constants";

jest.mock("worker:./worker", () => ({ __esModule: true, default: class {} }), { virtual: true });
jest.mock("../../core/config", () => ({
    __esModule: true,
    default: { physics: () => ({ enabled: true }) },
}));

import Physics from "../index";

// Repro of the swiper bug: a kinematic NONE platform rotated every frame by a
// script, with a child that is also rotated every frame. The "worker" here only
// tracks the root's rotation from the messages it receives; echoes of that
// rotation reach the root's THREE object a few frames late, as
// Element.handlePhysicsUpdate does at runtime.
const ECHO_LAG_FRAMES = 3;
const FRAMES = 90;

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

const yAngle = q => new Euler().setFromQuaternion(new Quaternion(q.x, q.y, q.z, q.w), "YXZ").y;

beforeEach(() => {
    jest.useFakeTimers();
    Physics.elements = [];
    Physics.pendingRefreshRoots = new Map();
    Physics.refreshTimer = null;
});

afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
});

const run = rotateChild => {
    const rootBody = new Mesh(new BoxGeometry(1, 1, 1));
    const swiperBody = new Mesh(new BoxGeometry(4, 0.5, 0.5));
    swiperBody.position.set(2, 1, 0);
    rootBody.add(swiperBody);
    rootBody.updateMatrixWorld(true);

    const swiper = makeElement("swiper", { colliderType: COLLIDER_TYPES.BOX }, swiperBody);
    const root = makeElement(
        "platform",
        { colliderType: COLLIDER_TYPES.NONE, kinematic: true, mass: 0 },
        rootBody,
        [swiper],
    );

    // Worker stand-in: the root's current rotation, as the worker would hold it.
    let workerAngle = null;
    const workerAngles = [];
    Physics.worker = {
        postMessage: msg => {
            if (
                msg.event === PHYSICS_EVENTS.ADD.COMPOUND ||
                msg.event === PHYSICS_EVENTS.ELEMENT.SET.QUATERNION
            ) {
                workerAngle = yAngle(msg.quaternion);
            }
        },
    };
    Physics.realizeSubtree(root);
    workerAngle = 0;

    const echoes = [];
    for (let frame = 1; frame <= FRAMES; frame++) {
        // Script: rotate the root (realized body) ...
        const angle = frame * 0.02;
        rootBody.rotation.set(0, angle, 0);
        rootBody.updateMatrixWorld(true);
        Physics.setElementQuaternion(root, {
            x: rootBody.quaternion.x,
            y: rootBody.quaternion.y,
            z: rootBody.quaternion.z,
            w: rootBody.quaternion.w,
        });

        // ... and its child (a compound member).
        rotateChild(swiper, swiperBody, frame);

        // The echo of an older worker rotation lands after the script ran but
        // before the debounced rebuild (setTimeout 0) does, as messages do.
        if (echoes.length >= ECHO_LAG_FRAMES) {
            rootBody.rotation.set(0, echoes[echoes.length - ECHO_LAG_FRAMES], 0);
            rootBody.updateMatrixWorld(true);
        }

        jest.runAllTimers();
        workerAngles.push(workerAngle);
        echoes.push(workerAngle);
    }
    return workerAngles;
};

describe("animating a compound child while the root rotates", () => {
    it("keeps the root rotation monotonic in the worker over 60+ frames", () => {
        const angles = run((swiper, swiperBody, frame) => {
            swiperBody.rotation.y = frame * 0.3;
            swiperBody.updateMatrixWorld(true);
            Physics.updateCompoundMember(swiper);
        });

        expect(angles).toHaveLength(FRAMES);
        for (let i = 1; i < angles.length; i++) {
            expect(angles[i]).toBeGreaterThan(angles[i - 1]);
        }
    });

    it("rolls the root back when the child is handled by a full rebuild (old behaviour)", () => {
        const angles = run((swiper, swiperBody, frame) => {
            swiperBody.rotation.y = frame * 0.3;
            swiperBody.updateMatrixWorld(true);
            Physics.refreshOwningBody(swiper);
        });

        const rolledBack = angles.some((a, i) => i > 0 && a <= angles[i - 1]);
        expect(rolledBack).toBe(true);
    });
});
