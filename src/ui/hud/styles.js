export const HUD_CLASS = "mage-hud";
export const HUD_HIDDEN_CLASS = "mage-hud-hidden";
const STYLE_ID = "mage-hud-styles";

const CSS = `
.mage-labels {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    pointer-events: none;
}
.mage-label {
    color: #ffffff;
    text-shadow: 0 1px 2px rgba(0,0,0,.85);
    font: 14px/1.2 sans-serif;
    white-space: nowrap;
    pointer-events: none;
}
.${HUD_HIDDEN_CLASS} {
    opacity: 0.4;
    outline: 1px dashed currentColor;
}
`;

// Injected lazily, once, so importing the module never touches `document`.
export const injectStyles = () => {
    if (typeof document === "undefined" || document.getElementById(STYLE_ID)) {
        return;
    }

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = CSS;
    document.head.appendChild(style);
};
