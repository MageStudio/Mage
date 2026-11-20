jest.mock("whatwg-fetch", () => ({ fetch: jest.fn() }));
jest.mock("../../lib/easing", () => ({ tweenTo: jest.fn(() => Promise.resolve()) }));

import { Importer } from "../Importer";

const makeElement = () => ({
    setPosition: jest.fn(),
    setRotation: jest.fn(),
    setQuaternion: jest.fn(),
    setScale: jest.fn(),
    setOpacity: jest.fn(),
    setUuid: jest.fn(),
    setName: jest.fn(),
    setWorldTransform: jest.fn(),
    addScript: jest.fn(),
    setData: jest.fn(),
    addTags: jest.fn(),
    setLabel: jest.fn(),
});

describe("Importer.completeCommonCreationSteps label", () => {
    it("calls setLabel with the saved label", () => {
        const element = makeElement();
        const label = { text: "Hero", offset: { x: 0, y: 2, z: 0 } };

        Importer.completeCommonCreationSteps(element, { data: {}, label });

        expect(element.setLabel).toHaveBeenCalledTimes(1);
        expect(element.setLabel).toHaveBeenCalledWith(label);
    });

    it("does not call setLabel when there is no label", () => {
        const element = makeElement();

        Importer.completeCommonCreationSteps(element, { data: {} });

        expect(element.setLabel).not.toHaveBeenCalled();
    });
});
