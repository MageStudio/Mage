import { Color as THREEColor } from "three";

export default class Color {
    static randomColor(asNumber = false) {
        const letters = "0123456789ABCDEF".split("");
        let color = "";
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return asNumber ? Number(`0x${color}`) : `#${color}`;
    }

    static componentToHex(c) {
        const hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    static gbToHex(r, g, b) {
        return "0x" + Color.componentToHex(r) + Color.componentToHex(g) + Color.componentToHex(b);
    }

    static getIntValueFromHex(hex) {
        return parseInt(hex, 16);
    }

    constructor(color) {
        this.color = new THREEColor(color);
    }

    getColor() {
        return this.color;
    }
}
