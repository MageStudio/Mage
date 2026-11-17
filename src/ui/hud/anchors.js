export const ANCHORS = [
    "top-left",
    "top",
    "top-right",
    "left",
    "center",
    "right",
    "bottom-left",
    "bottom",
    "bottom-right",
];

const SIDES = ["left", "right", "top", "bottom"];

const px = value => `${Number(value) || 0}px`;
const calc = value => `calc(50% + ${px(value)})`;

export const isValidAnchor = anchor => ANCHORS.includes(anchor);

/**
 * Positions `element` (inline styles only) so that its matching point sits on
 * the container anchor point, moved by offset. Right and bottom edges use
 * positive offsets inwards.
 */
export const applyAnchor = (element, anchor, offset = {}) => {
    const { x = 0, y = 0 } = offset || {};
    const style = element.style;

    SIDES.forEach(side => style.removeProperty(side));
    style.removeProperty("transform");

    const horizontal = anchor.includes("left") ? "left" : anchor.includes("right") ? "right" : null;
    const vertical = anchor.includes("top") ? "top" : anchor.includes("bottom") ? "bottom" : null;

    let translateX = false;
    let translateY = false;

    if (horizontal) {
        style.setProperty(horizontal, px(x));
    } else {
        style.setProperty("left", calc(x));
        translateX = true;
    }

    if (vertical) {
        style.setProperty(vertical, px(y));
    } else {
        style.setProperty("top", calc(y));
        translateY = true;
    }

    if (translateX && translateY) {
        style.setProperty("transform", "translate(-50%, -50%)");
    } else if (translateX) {
        style.setProperty("transform", "translateX(-50%)");
    } else if (translateY) {
        style.setProperty("transform", "translateY(-50%)");
    }
};
