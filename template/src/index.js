import { Router } from 'mage-engine';
import config from './config';

window.addEventListener('load', () => {
    Router.start(config);
}, false);
