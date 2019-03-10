import { Router } from 'mage-engine';
import FirstScene from './FirstScene/App';
import SecondScene from './SecondScene/App';
const assets = {
    Audio : {

    },

    Video : {

    },

    Images : {

    },

    Textures: {

    },

    Models : {

    },

    General : {
        //whatever file you need to load
    }
};

const config = {

    screen: {
        h : window ? window.innerHeight : 800,
        w : window ? window.innerWidth : 600,
        ratio : window ? (window.innerWidth/window.innerHeight) : (600/800),
        frameRate : 60,
        alpha: true
    },

    lights: {
        shadows: true
    },

    physics: {
        enabled: false
    },

    tween: {
        enabled: false
    },

    camera : {
        fov : 75,
        near : 0.1,
        far : 3000000
    }
};

window.addEventListener('load', () => {
    Router.on('/', FirstScene);
    Router.on('/second', SecondScene);

    Router.start(config, assets, '#gameContainer');
}, false);
