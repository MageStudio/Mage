import Color from "../Color";

describe("Color", () => {

    describe("static randomColor", () => {
        test("returns a hex string by default", () => {
            const color = Color.randomColor();
            expect(color).toMatch(/^#[0-9A-F]{6}$/);
        });

        test("returns a number when asNumber is true", () => {
            const color = Color.randomColor(true);
            expect(typeof color).toBe("number");
        });
    });

    describe("static componentToHex", () => {
        test("converts component to 2-char hex", () => {
            expect(Color.componentToHex(255)).toBe("ff");
            expect(Color.componentToHex(0)).toBe("00");
            expect(Color.componentToHex(15)).toBe("0f");
        });
    });

    describe("static gbToHex", () => {
        test("converts RGB to hex string", () => {
            expect(Color.gbToHex(255, 128, 0)).toBe("0xff8000");
        });

        test("converts black", () => {
            expect(Color.gbToHex(0, 0, 0)).toBe("0x000000");
        });

        test("converts white", () => {
            expect(Color.gbToHex(255, 255, 255)).toBe("0xffffff");
        });
    });

    describe("static getIntValueFromHex", () => {
        test("converts hex string to integer", () => {
            expect(Color.getIntValueFromHex("ff")).toBe(255);
            expect(Color.getIntValueFromHex("00")).toBe(0);
            expect(Color.getIntValueFromHex("0f")).toBe(15);
        });
    });

    describe("constructor and getColor", () => {
        test("creates Color instance and returns internal color", () => {
            const c = new Color("#ff0000");
            expect(c.getColor()).toBeDefined();
        });
    });
});
