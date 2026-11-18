jest.mock("three", () => require("../../../__mocks__/three"));
jest.mock("xstate", () => ({
    createMachine: jest.fn(),
    interpret: jest.fn(() => ({
        start: jest.fn(),
        stop: jest.fn(),
        send: jest.fn(),
        onTransition: jest.fn(),
    })),
}));
jest.mock("../../scripts/Scripts", () => ({
    get: jest.fn(),
}));
jest.mock("../../core/Scene", () => ({}));
jest.mock("../../core/universe", () => ({
    getByTag: jest.fn(() => []),
}));
jest.mock("../../lib/easing", () => ({
    tweenTo: jest.fn(() => Promise.resolve()),
}));
jest.mock("../../lib/meshUtils", () => ({
    isScene: jest.fn(() => false),
    serializeQuaternion: jest.fn(q => q && { x: q.x, y: q.y, z: q.z, w: q.w }),
    serializeVector: jest.fn(v => v && { x: v.x, y: v.y, z: v.z }),
}));

import * as THREE from "three";
import Entity from "../../entities/Entity";
import { validateAndFreeze } from "../validate";

const PATH = "game.player.weapon";
const msg = found => `mage.state.set: value at "${PATH}" is not JSON-safe (found ${found})`;

describe("validateAndFreeze accepts", () => {
    test.each([
        ["null", null],
        ["true", true],
        ["false", false],
        ["integer", 3],
        ["negative zero", -0],
        ["float", 1.5],
        ["string", ""],
        ["empty array", []],
        ["empty object", {}],
        ["nested", { a: [1, { b: [null, "x", true, { c: 0 }] }] }],
    ])("%s", (_, value) => {
        expect(validateAndFreeze(value, PATH)).toEqual(value);
    });

    test("objects with a null prototype", () => {
        const input = Object.create(null);
        input.a = 1;
        const out = validateAndFreeze(input, PATH);
        expect(Object.getPrototypeOf(out)).toBe(null);
        expect(out.a).toBe(1);
        expect(Object.isFrozen(out)).toBe(true);
    });

    test("a value that appears twice without a cycle", () => {
        const shared = { n: 1 };
        const out = validateAndFreeze({ a: shared, b: shared, c: [shared, shared] }, PATH);
        expect(out.a.n).toBe(1);
        expect(out.c[1].n).toBe(1);
    });

    test("deep nesting", () => {
        let value = { leaf: true };
        for (let i = 0; i < 500; i++) value = { child: value };
        expect(() => validateAndFreeze(value, PATH)).not.toThrow();
    });

    test("primitives are returned as they are", () => {
        expect(validateAndFreeze(5, PATH)).toBe(5);
        expect(validateAndFreeze("s", PATH)).toBe("s");
        expect(validateAndFreeze(null, PATH)).toBe(null);
    });
});

describe("validateAndFreeze rejects", () => {
    test.each([
        ["undefined", undefined],
        ["NaN", NaN],
        ["Infinity", Infinity],
        ["-Infinity", -Infinity],
        ["function", () => 1],
        ["Entity", new Entity()],
        ["Vector3", new THREE.Vector3(1, 2, 3)],
        ["Map", new Map()],
        ["Set", new Set()],
        ["Date", new Date()],
        ["symbol", Symbol("s")],
        ["bigint", BigInt(1)],
    ])("%s with a TypeError naming the path", (found, value) => {
        expect(() => validateAndFreeze(value, PATH)).toThrow(new TypeError(msg(found)));
    });

    test("names the nested path of the offending value", () => {
        expect(() => validateAndFreeze({ a: [1, { b: new Map() }] }, "game.x")).toThrow(
            new TypeError('mage.state.set: value at "game.x.a.1.b" is not JSON-safe (found Map)'),
        );
    });

    test("an array hole", () => {
        // eslint-disable-next-line no-sparse-arrays
        expect(() => validateAndFreeze([1, , 3], PATH)).toThrow(
            'value at "game.player.weapon.1" is not JSON-safe (found undefined)',
        );
    });

    test("an undefined property", () => {
        expect(() => validateAndFreeze({ a: undefined }, PATH)).toThrow(
            'value at "game.player.weapon.a" is not JSON-safe (found undefined)',
        );
    });

    test("an object containing a cycle", () => {
        const a = { name: "a" };
        a.self = a;
        expect(() => validateAndFreeze(a, PATH)).toThrow(
            'value at "game.player.weapon.self" is not JSON-safe (found a cycle)',
        );
    });

    test("an indirect cycle through an array", () => {
        const a = { list: [] };
        a.list.push({ back: a });
        expect(() => validateAndFreeze(a, PATH)).toThrow(TypeError);
        expect(() => validateAndFreeze(a, PATH)).toThrow("found a cycle");
    });

    test("an instance of a user class", () => {
        class Weapon {}
        expect(() => validateAndFreeze({ w: new Weapon() }, "game.p")).toThrow(
            'value at "game.p.w" is not JSON-safe (found Weapon)',
        );
    });

    test("an object with an odd prototype and no constructor name", () => {
        const o = Object.create({ inherited: 1 });
        expect(() => validateAndFreeze(o, PATH)).toThrow(TypeError);
    });

    test("uses the method name in the prefix", () => {
        expect(() => validateAndFreeze(NaN, PATH, "hydrate")).toThrow(
            'mage.state.hydrate: value at "game.player.weapon" is not JSON-safe (found NaN)',
        );
    });

    test("recurses into a store-shaped frozen object that is not trusted", () => {
        const foreign = Object.freeze({ a: Object.freeze({ b: new Map() }) });
        expect(() => validateAndFreeze(foreign, PATH)).toThrow("found Map");
    });
});

describe("validateAndFreeze freezing", () => {
    test("every object and array in the result is frozen", () => {
        const out = validateAndFreeze({ a: [{ b: [1] }], c: { d: {} } }, PATH);
        [out, out.a, out.a[0], out.a[0].b, out.c, out.c.d].forEach(o =>
            expect(Object.isFrozen(o)).toBe(true),
        );
    });

    test("assigning to a stored object throws a TypeError", () => {
        const out = validateAndFreeze({ a: { b: 1 }, list: [1] }, PATH);
        expect(() => {
            out.a.b = 2;
        }).toThrow(TypeError);
        expect(() => {
            out.list[0] = 2;
        }).toThrow(TypeError);
        expect(() => {
            out.list.push(2);
        }).toThrow(TypeError);
    });

    test("leaves the caller's value unfrozen", () => {
        const input = { a: { b: 1 } };
        const out = validateAndFreeze(input, PATH);
        expect(out).not.toBe(input);
        expect(Object.isFrozen(input)).toBe(false);
        expect(Object.isFrozen(input.a)).toBe(false);
    });

    test("later changes to the caller's value don't reach the stored one", () => {
        const input = { a: [1] };
        const out = validateAndFreeze(input, PATH);
        input.a.push(2);
        expect(out.a).toEqual([1]);
    });

    test("a validated value is reused without copying or re-walking", () => {
        const out = validateAndFreeze({ a: { b: 1 } }, PATH);
        expect(validateAndFreeze(out, PATH)).toBe(out);
        const wrapped = validateAndFreeze({ inner: out }, PATH);
        expect(wrapped.inner).toBe(out);
    });

    test("a trusted subtree is not walked again", () => {
        const inner = validateAndFreeze({ a: 1 }, PATH);
        const spy = jest.spyOn(Object, "keys");
        validateAndFreeze({ x: inner, y: 2 }, PATH);
        const walkedInner = spy.mock.calls.some(([arg]) => arg === inner);
        spy.mockRestore();
        expect(walkedInner).toBe(false);
    });

    test("a key named __proto__ stays an own key", () => {
        const input = JSON.parse('{"__proto__": {"x": 1}}');
        const out = validateAndFreeze(input, PATH);
        expect(Object.getPrototypeOf(out)).toBe(Object.prototype);
        expect(Object.keys(out)).toEqual(["__proto__"]);
        expect({}.x).toBeUndefined();
    });
});
