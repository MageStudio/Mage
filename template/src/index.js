import M from 'mage';
import config from './config';

window.addEventListener('load', () => {
    M.Router.start(config);
}, false);
