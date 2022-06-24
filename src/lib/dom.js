import { removeFirst } from "./strings";

export const isClassname = word => word.startsWith('.');

export const isId = word => word.startsWith('#');

export const DEFAULT_FULL_SIZE_STYLE = {
    position: 'absolute',
    height: '100%',
    width: '100%',
    margin: '0'
};

export const getOrCreateElement = (selector, type, style) => (
    document.querySelector(selector) ||
    createElementFromSelector(selector, type, style)
)

export const createElementFromSelector = (selector, type = 'div', style = DEFAULT_FULL_SIZE_STYLE) => {
    const element = document.createElement(type);
    
    Object
        .keys(style)
        .forEach((property) => {
            element.style.setProperty(property, style[property]);
        });

    if (isClassname(selector)) {
        element.className = removeFirst(selector);
    } else if (isId(selector)) {
        element.id = removeFirst(selector);
    }

    return element;
};
