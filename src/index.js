// import Assets from './base/Assets';
import Audio from './audio/Audio';
import AmbientSound from './audio/AmbientSound';
import BackgroundSound from './audio/BackgroundSound';
import DirectionalSound from './audio/DirectionalSound';
import Sound from './audio/Sound';

//import * as THREE from 'three';
import {
    Vector3,
    Color as THREEColor
} from 'three';
import BaseScene, { author } from './base/BaseScene';
import Universe from './base/Universe';
import Color from './base/Color';

import util from './lib/util';
import * as math from './lib/math';
import * as strings from './lib/strings';
import * as uuid from './lib/uuid';
import * as workers from './lib/workers';

import Stats from './base/Stats';
import Config from './base/config';
import Router from './router/Router';
import Scene from './base/Scene';
import Scripts from './scripts/Scripts';
import Controls from './controls/Controls';
import Physics from './physics/physics';

import * as store from './store';
import { Provider, connect } from 'inferno-redux';

import * as constants from './lib/constants';
import debounce from './lib/debounce';

import BaseScript from './scripts/BaseScript';

import Input from './base/input/Input';

import Entity from './entities/Entity';
import Mesh from './entities/Mesh';
import Line from './entities/line';
import Plane from './entities/plane';
import Box from './entities/base/Box';
import Cube from './entities/base/Cube';
import Sphere from './entities/base/Sphere';
import Cylinder from './entities/base/Cylinder';
import Grid from './entities/base/Grid';
//import AnimatedMesh from './entities/AnimatedMesh';
//import ShaderMesh from './entities/ShaderMesh';
import Camera from './entities/Camera';

import AmbientLight from './lights/AmbientLight';
import SunLight from './lights/SunLight';
import PointLight from './lights/PointLight';

import LightLoader from './loaders/LightLoader';
import MeshLoader from './loaders/MeshLoader';

import Atmosphere from './fx/materials/Atmosphere';
import Mirror from './fx/materials/Mirror';
import Ocean from './fx/materials/Ocean';

// import Clouds from './fx/particles/Clouds';
// import Rain from './fx/particles/Rain';

import * as Partykals from 'mage-engine.particles';

import Skybox from './fx/scenery/Skybox';

import Shader from './fx/shaders/Shader';

import Particles from './fx/particles/Particles';
import Images from './images/Images';
import Models from './models/Models';
//import Shaders from './fx/shaders/Shaders';
import PostProcessing from './fx/postprocessing/PostProcessing';


export {
    author,

    BaseScene,
    Config,
    Scene,
    Universe,
    Scripts,
    Router,

    store,
    Provider,
    connect,

    Controls,

    Images,
    Models,
    // Shaders,
    Audio,
    PostProcessing,
    Particles,
    Partykals,
    Physics,

    MeshLoader,
    LightLoader,

    BaseScript,

    Input,

    Entity,
    Mesh,
    Line,
    Plane,
    Box,
    Cube,
    Cylinder,
    Sphere,
    Grid,
    //AnimatedMesh,
    //ShaderMesh,
    Camera,

    Sound,
    AmbientSound,
    BackgroundSound,
    DirectionalSound,

    AmbientLight,
    SunLight,
    PointLight,

    Atmosphere,
    Mirror,
    Ocean,

    Skybox,

    Shader,

    Color,
    Vector3,
    THREEColor,
    util,
    math,
    strings,
    uuid,
    workers,
    constants,
    debounce,
    Stats
};
