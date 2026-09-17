jest.mock("whatwg-fetch", () => ({ fetch: jest.fn() }));
// between.js (pulled in transitively via lib/easing) touches
// requestAnimationFrame at import time, which the node test env lacks.
jest.mock("../../lib/easing", () => ({ tweenTo: jest.fn(() => Promise.resolve()) }));
jest.mock("../../lib/location", () => ({
    getLocationHash: jest.fn(),
    setLocationHash: jest.fn(),
}));
jest.mock("../../runner/GameRunner", () => ({ register: jest.fn(() => true) }));

import RouterInstance from "../Router";
import { getLocationHash } from "../../lib/location";

const Router = RouterInstance.constructor;

describe("Router.extractHashAndQuery", () => {
    beforeEach(() => {
        getLocationHash.mockReset();
    });

    test("decodes an encoded hash so it matches the raw registered route", () => {
        RouterInstance.on("/Sunny Meadow", class {});
        getLocationHash.mockReturnValue("#/Sunny%20Meadow");

        const { hash } = Router.extractHashAndQuery();

        expect(hash).toBe("/Sunny Meadow");
        expect(RouterInstance.isValidRoute(hash)).toBe(true);
    });

    test("still parses the query string from an encoded hash", () => {
        getLocationHash.mockReturnValue("#/Sunny%20Meadow?difficulty=hard&lives=3");

        const { hash, query } = Router.extractHashAndQuery();

        expect(hash).toBe("/Sunny Meadow");
        expect(query).toEqual({ difficulty: "hard", lives: "3" });
    });

    test("decodes only the route, leaving encoded query characters in place", () => {
        getLocationHash.mockReturnValue("#/Sunny%20Meadow?x=a%26b");

        const { hash, query } = Router.extractHashAndQuery();

        expect(hash).toBe("/Sunny Meadow");
        expect(query).toEqual({ x: "a%26b" });
    });

    test("leaves plain hashes untouched", () => {
        getLocationHash.mockReturnValue("#/");

        const { hash, query } = Router.extractHashAndQuery();

        expect(hash).toBe("/");
        expect(query).toEqual({});
    });
});
