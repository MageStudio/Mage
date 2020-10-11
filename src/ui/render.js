import { render } from 'inferno';
import { createElement } from 'inferno-create-element';
import { Provider } from 'inferno-redux';
import { getStore } from '../store/Store';
import BaseUI from './BaseUI';

const ROOT_ID = '#ui';

export const mount = (UI = BaseUI, options = {}) => {
    const {
        root = ROOT_ID,
        ...props
    } = options;

    const store = getStore();
    const uiElement = createElement(UI, props);
    let rootElement = document.querySelector(root);

    if (!rootElement) {
        rootElement = createElementFromSelector(root);
        document.body.appendChild(rootElement);
    }

    if (store) {
        render(
            createElement(Provider, {
                store: getStore(),
                children: uiElement
            }),
            rootElement
        );
    } else {
        render(uiElement, rootElement)
    }
};


export const unmount = ({ root = ROOT_ID } = {}) => {
    // Rendering null will trigger unmount lifecycle hooks for whole vDOM tree and remove global event listeners.
    // https://github.com/infernojs/inferno#tear-down
    render(null, document.querySelector(root));
};
