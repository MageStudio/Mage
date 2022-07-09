import { render } from 'inferno';
import { createElement } from 'inferno-create-element';
import { Provider } from 'inferno-redux';
import { getStore } from '../store/Store';
import BaseUI from './BaseUI';
import Config from '../core/config';
import Router from '../router/Router';
import { dispatch } from '../store';
import { createElementFromSelector, removeElement } from '../lib/dom';
import { showLoadingScreen, hideLoadingScreen } from '../store/actions/ui';
import { locationPathChange } from '../store/actions/location';

const ROOT_ID = '#ui';
export const LABELS_ROOT_ID = '#labels_ui';

const createProps = () => ({
    level: Router.getCurrentLevel()
});

export const getUIContainer = (id = ROOT_ID) => {
    let rootElement = document.querySelector(id);

    if (!rootElement) {
        rootElement = createElementFromSelector(id);
        document.body.appendChild(rootElement);
    }

    return rootElement;
};

export const requestLoadingScreen = () => dispatch(showLoadingScreen());
export const removeLoadingScreen = () => dispatch(hideLoadingScreen());

export const dispatchLocationPathChange = path => dispatch(locationPathChange(path));

export const mount = () => {
    const { root = BaseUI, enabled = true } = Config.ui();
    if (!enabled) return;

    const store = getStore();
    const uiElement = createElement(root, createProps());

    if (store) {
        render(
            createElement(Provider, {
                store: getStore(),
                children: uiElement
            }),
            getUIContainer()
        );
    } else {
        render(uiElement, getUIContainer())
    }
};

export const unmount = (id = ROOT_ID) => {
    const container = document.querySelector(id);

    // Rendering null will trigger unmount lifecycle hooks for whole vDOM tree and remove global event listeners.
    // https://github.com/infernojs/inferno#tear-down
    render(null, container);
    // removing the container as well
    removeElement(id);
};
