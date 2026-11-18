/** @jest-environment jsdom */
import UI from "../index";
import Config from "../../../core/config";

const def = (over = {}) => ({
    name: "a",
    type: "button",
    text: "Go",
    anchor: "center",
    offset: { x: 0, y: 0 },
    ...over,
});

const container = () => Config.container();

beforeEach(() => {
    Config.setContainer("#game");
    UI.setEditMode(false);
    UI.clear();
    document.body.innerHTML = "";
});

describe("layer", () => {
    it("creates a button inside a single .mage-hud root in the container, centred", () => {
        const handle = UI.create(def());
        UI.create(def({ name: "b" }));

        const roots = container().querySelectorAll(".mage-hud");
        expect(roots).toHaveLength(1);
        const button = roots[0].querySelector("button");
        expect(button.textContent).toBe("Go");
        expect(button).toBe(handle.element);
        expect(button.style.left).toBe("calc(50% + 0px)");
        expect(button.style.top).toBe("calc(50% + 0px)");
        expect(button.style.transform).toBe("translate(-50%, -50%)");
    });

    it("styles the root as a click-through overlay and widgets as interactive", () => {
        const { element } = UI.create(def());
        const root = document.querySelector(".mage-hud");

        expect(root.style.position).toBe("absolute");
        expect(root.style.top).toBe("0px");
        expect(root.style.right).toBe("0px");
        expect(root.style.bottom).toBe("0px");
        expect(root.style.left).toBe("0px");
        expect(root.style.pointerEvents).toBe("none");
        expect(element.style.pointerEvents).toBe("auto");
    });

    it("makes a static container relative and leaves a positioned one alone", () => {
        container().style.position = "";
        UI.create(def());
        expect(container().style.position).toBe("relative");

        UI.clear();
        document.body.innerHTML = "";
        container().style.position = "absolute";
        UI.create(def());
        expect(container().style.position).toBe("absolute");
    });
});

describe("anchors", () => {
    const cases = {
        "top-left": { left: "10px", top: "20px", transform: "" },
        top: { left: "calc(50% + 10px)", top: "20px", transform: "translateX(-50%)" },
        "top-right": { right: "10px", top: "20px", transform: "" },
        left: { left: "10px", top: "calc(50% + 20px)", transform: "translateY(-50%)" },
        center: {
            left: "calc(50% + 10px)",
            top: "calc(50% + 20px)",
            transform: "translate(-50%, -50%)",
        },
        right: { right: "10px", top: "calc(50% + 20px)", transform: "translateY(-50%)" },
        "bottom-left": { left: "10px", bottom: "20px", transform: "" },
        bottom: { left: "calc(50% + 10px)", bottom: "20px", transform: "translateX(-50%)" },
        "bottom-right": { right: "10px", bottom: "20px", transform: "" },
    };

    Object.keys(cases).forEach(anchor => {
        it(`positions ${anchor}`, () => {
            const { element } = UI.create(def({ anchor, offset: { x: 10, y: 20 } }));
            const expected = { left: "", right: "", top: "", bottom: "", ...cases[anchor] };

            Object.keys(expected).forEach(key => {
                expect(element.style[key]).toBe(expected[key]);
            });
        });
    });

    it("setAnchor repositions, clears unused sides and throws on unknown anchors", () => {
        const handle = UI.create(def({ anchor: "top-left", offset: { x: 1, y: 2 } }));
        handle.setAnchor("bottom-right", { x: 5, y: 6 });

        expect(handle.element.style.left).toBe("");
        expect(handle.element.style.top).toBe("");
        expect(handle.element.style.right).toBe("5px");
        expect(handle.element.style.bottom).toBe("6px");
        expect(() => handle.setAnchor("nowhere", { x: 0, y: 0 })).toThrow();
    });
});

describe("registry", () => {
    it("throws for duplicate name, unknown type and unknown anchor", () => {
        UI.create(def());
        expect(() => UI.create(def())).toThrow();
        expect(() => UI.create(def({ name: "x", type: "slider" }))).toThrow();
        expect(() => UI.create(def({ name: "y", anchor: "middle" }))).toThrow();
        expect(UI.has("x")).toBe(false);
        expect(UI.has("y")).toBe(false);
    });

    it("get, has, getAll, remove and clear", () => {
        UI.create(def({ name: "one" }));
        UI.create(def({ name: "two" }));
        UI.create(def({ name: "three" }));

        expect(() => UI.get("missing")).toThrow('UI element "missing" not found');
        expect(() => UI.remove("missing")).toThrow();
        expect(UI.has("two")).toBe(true);
        expect(UI.getAll().map(h => h.name)).toEqual(["one", "two", "three"]);

        const { element } = UI.get("two");
        UI.remove("two");
        expect(UI.has("two")).toBe(false);
        expect(element.isConnected).toBe(false);

        UI.clear();
        expect(UI.getAll()).toEqual([]);
        expect(document.querySelectorAll(".mage-hud button")).toHaveLength(0);
    });

    it("loadHUD clears then creates in order; undefined and {} only clear", () => {
        UI.create(def({ name: "old" }));
        UI.loadHUD({ elements: [def({ name: "n1" }), def({ name: "n2", type: "label" })] });
        expect(UI.getAll().map(h => h.name)).toEqual(["n1", "n2"]);

        UI.loadHUD(undefined);
        expect(UI.getAll()).toEqual([]);
        UI.create(def());
        UI.loadHUD({});
        expect(UI.getAll()).toEqual([]);
    });
});

describe("handle", () => {
    it("setText never injects markup and round-trips", () => {
        const handle = UI.create(def({ type: "label" }));
        handle.setText("<b>x</b>");
        expect(handle.element.textContent).toBe("<b>x</b>");
        expect(handle.element.querySelector("b")).toBeNull();
        expect(handle.getText()).toBe("<b>x</b>");
    });

    it("rejects setText on inputs and setValue on labels", () => {
        const input = UI.create(def({ name: "i", type: "input", value: "v" }));
        const label = UI.create(def({ name: "l", type: "label" }));

        expect(() => input.setText("x")).toThrow();
        expect(() => label.setValue("x")).toThrow();
        input.setValue("hello");
        expect(input.getValue()).toBe("hello");
        expect(input.element.value).toBe("hello");
    });

    it("fires click, change (value) and submit (Enter) and supports off", () => {
        const button = UI.create(def());
        const input = UI.create(def({ name: "i", type: "input" }));
        const click = jest.fn();
        const change = jest.fn();
        const submit = jest.fn();

        button.on("click", click);
        input.on("change", change);
        input.on("submit", submit);

        button.element.click();
        input.element.value = "abc";
        input.element.dispatchEvent(new Event("input"));
        input.element.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
        input.element.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

        expect(click).toHaveBeenCalledTimes(1);
        expect(change).toHaveBeenCalledWith("abc");
        expect(submit).toHaveBeenCalledTimes(1);
        expect(submit).toHaveBeenCalledWith("abc");

        button.off("click", click);
        input.off("change", change);
        input.off("submit", submit);
        button.element.click();
        input.element.dispatchEvent(new Event("input"));
        input.element.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
        expect(click).toHaveBeenCalledTimes(1);
        expect(change).toHaveBeenCalledTimes(1);
        expect(submit).toHaveBeenCalledTimes(1);
    });

    it("applies definition style on create and merges setStyle", () => {
        const handle = UI.create(def({ style: { "font-size": "24px", color: "red" } }));
        expect(handle.element.style.getPropertyValue("font-size")).toBe("24px");

        handle.setStyle({ color: "blue", "background-color": "#fff" });
        expect(handle.element.style.getPropertyValue("color")).toBe("blue");
        expect(handle.element.style.getPropertyValue("font-size")).toBe("24px");
        expect(handle.element.style.getPropertyValue("background-color")).toBe(
            "rgb(255, 255, 255)",
        );
    });

    it("supports visible:false, show, hide and isVisible", () => {
        const handle = UI.create(def({ visible: false }));
        expect(handle.element.style.display).toBe("none");
        expect(handle.isVisible()).toBe(false);

        handle.show();
        expect(handle.element.style.display).toBe("");
        expect(handle.isVisible()).toBe(true);

        handle.hide();
        expect(handle.element.style.display).toBe("none");
    });

    it("labels inputs for accessibility and never sets a positive tabindex", () => {
        const withPlaceholder = UI.create(
            def({ name: "p", type: "input", placeholder: "Your name" }),
        );
        const without = UI.create(def({ name: "q", type: "input", placeholder: "" }));
        const button = UI.create(def({ name: "b" }));

        expect(withPlaceholder.element.getAttribute("aria-label")).toBe("Your name");
        expect(without.element.getAttribute("aria-label")).toBe("q");
        [withPlaceholder, without, button].forEach(h => {
            expect(h.element.getAttribute("tabindex")).toBeNull();
        });
    });
});

describe("edit mode", () => {
    it("is off by default", () => {
        expect(UI.isEditMode()).toBe(false);
    });

    it("makes widgets inert and keeps hidden ones rendered, then restores", () => {
        const input = UI.create(def({ name: "i", type: "input" }));
        const hidden = UI.create(def({ name: "h", visible: false }));

        UI.setEditMode(true);
        expect(UI.isEditMode()).toBe(true);
        expect(input.element.getAttribute("tabindex")).toBe("-1");
        expect(hidden.element.getAttribute("tabindex")).toBe("-1");
        expect(input.element.readOnly).toBe(true);
        expect(hidden.element.style.display).not.toBe("none");
        expect(hidden.element.classList.contains("mage-hud-hidden")).toBe(true);
        expect(document.getElementById("mage-hud-styles").textContent).toMatch(/0\.4/);

        const later = UI.create(def({ name: "later", type: "input" }));
        expect(later.element.readOnly).toBe(true);
        expect(later.element.getAttribute("tabindex")).toBe("-1");

        UI.setEditMode(false);
        expect(input.element.getAttribute("tabindex")).toBeNull();
        expect(input.element.readOnly).toBe(false);
        expect(hidden.element.style.display).toBe("none");
        expect(hidden.element.classList.contains("mage-hud-hidden")).toBe(false);
    });
});
