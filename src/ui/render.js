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

    render(
        createElement(Provider, {
            store: getStore(),
            children: createElement(UI, props)
        }),
        document.querySelector(root)
    );
};


export const unmount = ({ root = ROOT_ID } = {}) => {
    // Rendering null will trigger unmount lifecycle hooks for whole vDOM tree and remove global event listeners.
    // https://github.com/infernojs/inferno#tear-down
    render(null, document.querySelector(root));
};
