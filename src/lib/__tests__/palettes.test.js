import palettes from "../palettes";

describe("palettes.js", () => {
    describe("BASE palette", () => {
        test("exports BASE palette", () => {
            expect(palettes.BASE).toBeDefined();
        });

        test("has standard color values", () => {
            expect(palettes.BASE.WHITE).toBe(0xffffff);
            expect(palettes.BASE.BLACK).toBe(0x000000);
            expect(palettes.BASE.RED).toBe(0xff0000);
            expect(palettes.BASE.GREEN).toBe(0x00ff00);
            expect(palettes.BASE.BLUE).toBe(0x0000ff);
        });

        test("has secondary colors", () => {
            expect(palettes.BASE.YELLOW).toBe(0xffff00);
            expect(palettes.BASE.CYAN).toBe(0x00ffff);
            expect(palettes.BASE.MAGENTA).toBe(0xff00ff);
        });

        test("has neutral colors", () => {
            expect(palettes.BASE.SILVER).toBe(0xc0c0c0);
            expect(palettes.BASE.GRAY).toBe(0x808080);
        });

        test("all values are numbers", () => {
            Object.values(palettes.BASE).forEach(color => {
                expect(typeof color).toBe("number");
            });
        });
    });

    describe("FRENCH_PALETTE", () => {
        test("exports FRENCH_PALETTE", () => {
            expect(palettes.FRENCH_PALETTE).toBeDefined();
        });

        test("FRENCH is alias for FRENCH_PALETTE", () => {
            expect(palettes.FRENCH).toBe(palettes.FRENCH_PALETTE);
        });

        test("has 20 colors", () => {
            expect(Object.keys(palettes.FRENCH_PALETTE)).toHaveLength(20);
        });

        test("all values are numbers", () => {
            Object.values(palettes.FRENCH_PALETTE).forEach(color => {
                expect(typeof color).toBe("number");
            });
        });

        test("all values are valid hex colors (0-0xFFFFFF)", () => {
            Object.values(palettes.FRENCH_PALETTE).forEach(color => {
                expect(color).toBeGreaterThanOrEqual(0);
                expect(color).toBeLessThanOrEqual(0xffffff);
            });
        });
    });
});
