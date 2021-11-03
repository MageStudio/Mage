// import Assets from './core/Assets';
import {
    Element,
    ENTITY_TYPES,
    Camera,
    Line,
    CurveLine,
    Plane,
    Box,
    Cube,
    Sphere,
    Cylinder,
    Grid,
    Sprite
} from './entities';

import Audio, { AUDIO_RAMPS } from './audio/Audio';
import AmbientSound from './audio/AmbientSound';
import BackgroundSound from './audio/BackgroundSound';
import DirectionalSound from './audio/DirectionalSound';
import Sound from './audio/Sound';

import * as THREE from 'three';
import {
    Vector3,
    EventDispatcher
} from 'three';
import Level, { author } from './core/Level';

import Universe from './core/Universe';
import Color from './lib/Color';

import Features, { FEATURES } from './lib/features';
import * as math from './lib/math';
import * as strings from './lib/strings';
import * as uuid from './lib/uuid';
import * as workers from './lib/workers';

import Stats from './core/Stats';
import Config from './core/config';
import GameRunner from './runner/GameRunner';
import Router from './router/Router';
import Scene from './core/Scene';
import Scripts, { BUILTIN } from './scripts/Scripts';
import Controls from './controls/Controls';
import Physics, {
    PHYSICS_EVENTS,
    PHYSICS_CONSTANTS,
    physicsUtils
} from './physics';

import * as store from './store';
import { Provider, connect } from 'inferno-redux';

import * as constants from './lib/constants';
import * as functions from './lib/functions';

import BaseScript from './scripts/BaseScript';

import Input, { INPUT_EVENTS } from './core/input/Input';

import AmbientLight from './lights/AmbientLight';
import SunLight from './lights/SunLight';
import PointLight from './lights/PointLight';
import SpotLight from './lights/SpotLight';
import HemisphereLight from './lights/HemisphereLight';
import Lights from './lights/Lights';

import LightLoader from './loaders/LightLoader';
import MeshLoader from './loaders/MeshLoader';

import Atmosphere from './fx/materials/Atmosphere';
import Mirror from './fx/materials/Mirror';
import Ocean from './fx/materials/Ocean';

import * as Partykals from 'mage-engine.particles';

import Skybox from './fx/scenery/Skybox';

import Shader from './fx/shaders/Shader';

import Particles, { PARTICLES } from './fx/particles/Particles';

import ParticlEmitter from './fx/particles/ParticleEmitter';

import Images from './images/Images';
import Models from './models/Models';
//import Shaders from './fx/shaders/Shaders';
import PostProcessing from './fx/postprocessing/PostProcessing';

window.THREE = THREE;

export {
    author,
    Element,
    ENTITY_TYPES,
    Level,

    FEATURES,
    Features,
    Config,
    Scene,
    Universe,
    Scripts,
    BUILTIN,
    Router,
    GameRunner,

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
    PARTICLES,
    ParticlEmitter,
    Partykals,

    Physics,
    PHYSICS_EVENTS,
    PHYSICS_CONSTANTS,
    physicsUtils,

    MeshLoader,
    LightLoader,

    BaseScript,

    Input,
    INPUT_EVENTS,

    Line,
    CurveLine,
    Plane,
    Box,
    Cube,
    Cylinder,
    Sphere,
    Grid,
    Sprite,
    //AnimatedMesh,
    //ShaderMesh,
    Camera,

    Sound,
    AUDIO_RAMPS,
    // AmbientSound,
    BackgroundSound,
    DirectionalSound,

    AmbientLight,
    SunLight,
    PointLight,
    SpotLight,
    HemisphereLight,
    Lights,

    Atmosphere,
    Mirror,
    Ocean,

    Skybox,

    Shader,

    Color,
    Vector3,
    EventDispatcher,
    math,
    strings,
    uuid,
    workers,
    constants,
    functions,
    Stats,

    THREE
};
