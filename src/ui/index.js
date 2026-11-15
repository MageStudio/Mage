import { render } from "inferno";
import { createElement } from "inferno-create-element";
import BaseUI from "./BaseUI";
import Config from "../core/config";
import Router from "../router/Router";
import { createElementFromSelector, removeElement } from "../lib/dom";

const ROOT_ID = "#ui";
export const LABELS_ROOT_ID = "#labels_ui";

const createProps = () => ({
    level: Router.getCurrentLevel(),
});

export const getUIContainer = (id = ROOT_ID) => {
    let rootElement = document.querySelector(id);

    if (!rootElement) {
        rootElement = createElementFromSelector(id);
        document.body.appendChild(rootElement);
    }

    return rootElement;
};

let loadingScreenVisible = false;

export const requestLoadingScreen = () => {
    loadingScreenVisible = true;
};
export const removeLoadingScreen = () => {
    loadingScreenVisible = false;
};
export const isLoadingScreenVisible = () => loadingScreenVisible;

export const mount = () => {
    const { root = BaseUI, enabled = true } = Config.ui();
    if (!enabled) return;

    render(createElement(root, createProps()), getUIContainer());
};

export const unmount = (id = ROOT_ID) => {
    const container = document.querySelector(id);

    // Rendering null will trigger unmount lifecycle hooks for whole vDOM tree and remove global event listeners.
    // https://github.com/infernojs/inferno#tear-down
    render(null, container);
    // removing the container as well
    removeElement(id);
};
