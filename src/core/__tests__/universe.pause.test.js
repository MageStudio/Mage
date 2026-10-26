import { Universe } from "../universe";

describe("Universe pause hooks", () => {
    test("onPause and onResume walk every element in reality", () => {
        const universe = new Universe();
        const a = { onPause: jest.fn(), onResume: jest.fn() };
        const b = { onPause: jest.fn(), onResume: jest.fn() };
        universe.reality = { a, b };

        universe.onPause();
        universe.onResume();

        expect(a.onPause).toHaveBeenCalledTimes(1);
        expect(b.onPause).toHaveBeenCalledTimes(1);
        expect(a.onResume).toHaveBeenCalledTimes(1);
        expect(b.onResume).toHaveBeenCalledTimes(1);
    });
});
