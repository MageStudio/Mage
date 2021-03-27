import Audio from '../audio/Audio';
import Video from '../video/Video';
import Images from '../images/Images';
import Models from '../models/Models';
import Lights from '../lights/Lights';
import Scripts from '../scripts/Scripts';
import { ASSETS_TYPES, ROOT } from '../lib/constants';
import { isLevelName } from '../lib/utils/assets';

const DEFAULT_COMMON_ASSETS = {
    [ASSETS_TYPES.AUDIO]: {},
    [ASSETS_TYPES.VIDEO]: {},
    [ASSETS_TYPES.IMAGES]: {},
    [ASSETS_TYPES.TEXTURES]: {},
    [ASSETS_TYPES.CUBETEXTURES]: {},
    [ASSETS_TYPES.MODELS]: {},
    [ASSETS_TYPES.PARTICLES]: {},
    [ASSETS_TYPES.SCRIPTS]: {},
    [ASSETS_TYPES.SHADERS]: {},
    _isLoaded: false
};

const DEFAULT_ASSETS = {
    common: DEFAULT_COMMON_ASSETS,
    levels: {}
};

export class Assets {

    constructor() {
        this.assets = DEFAULT_ASSETS;
        this.currentLevel = ROOT;
    }

    setCurrentLevel = level => {
        this.currentLevel = level;

        Models.setCurrentLevel(level);
        Audio.setCurrentLevel(level);
        Images.setCurrentLevel(level);
    }

    parseAssets(assets) {
        const validAssetsTypes = Object.values(ASSETS_TYPES);
        const reducer = (group, assetType) => {
            const lowerCaseType = assetType.toLowerCase();

            if (validAssetsTypes.includes(lowerCaseType)) {
                group.common[lowerCaseType] = assets[assetType];
            } else if (isLevelName(lowerCaseType)) {
                const levelAssets = assets[assetType] || {};
                
                group.levels[lowerCaseType] = {
                    ...DEFAULT_COMMON_ASSETS,
                    ...levelAssets
                };


            }
            return group;
        };

        return Object
            .keys(assets)
            .reduce(reducer, DEFAULT_ASSETS);
    }
    

    setAssets(assets = DEFAULT_COMMON_ASSETS) {
        this.assets = this.parseAssets(assets);
    }

    getCommonAssets = () => this.assets.common || DEFAULT_COMMON_ASSETS;

    getLevelAssets = level => this.assets.levels[level] || DEFAULT_COMMON_ASSETS;

    setLevelAssetsLoadedState = (loaded, level) => {
        if (this.assets.levels[level]) {
            this.assets.levels[level]._isLoaded = loaded;
        }
    }

    setLevelAssetsLoadingState = (loading, level) => {
        if (this.assets.levels[level]) {
            this.assets.levels[level]._isLoading = loading;
        }
    }

    getLevelAssetsLoadedState = (level) => level && this.assets.levels[level] && this.assets.levels[level]._isLoaded;
    getLevelAssetsLoadingState = (level) => level && this.assets.levels[level] && this.assets.levels[level]._isLoading;

    setCommonAssetsLoadedState = (loaded) => {
       this.assets.common._isLoaded = loaded;
    }

    setCommonAssetsLoadingState = loading => {
        this.assets.common._isLoading = loading;
    }

    getCommonAssetsLoadedState = () => this.assets.common._isLoaded;
    getCommonAssetsLoadingState = () => this.assets.common._isLoading;

    getAsssetsLoadedState = level => level ? this.getLevelAssetsLoadedState(level) : this.getCommonAssetsLoadedState();
    getAssetsLoadingstate = level => level ? this.getLevelAssetsLoadingState(level) : this.getCommonAssetsLoadingState();

    audio = (level) => level ? this.getLevelAssets(level).audio : this.getCommonAssets().audio;

    video = (level) => level ? this.getLevelAssets(level).video : this.getCommonAssets().video;

    images = (level) => level ? this.getLevelAssets(level).images : this.getCommonAssets().images;

    textures = (level) => level ? this.getLevelAssets(level).textures : this.getCommonAssets().textures;

    cubeTextures = (level) => level ? this.getLevelAssets(level).cubetextures : this.getCommonAssets().cubetextures;

    models = (level) => level ? this.getLevelAssets(level).models : this.getCommonAssets().models;

    particles = (level) => level ? this.getLevelAssets(level).particles : this.getCommonAssets().particles;

    scripts = (level) => level ? this.getLevelAssets(level).scripts : this.getCommonAssets().scripts;

    postAssetsLoad = level => () => {
        if (level) {
            this.setLevelAssetsLoadedState(true, level);
        }
        this.setCommonAssetsLoadedState(true);
    }

    preAssetsLoad = level => () => {
        if (level) {
            this.setLevelAssetsLoadingState(true, level);
        } else {
            this.setCommonAssetsLoadingState(true);
        }
    }

    handleAssetsLoadError = e => {
        console.log(e);
    }

    load = (level) => {
        console.log('loading assets', level, this.assets);

        if (this.getAsssetsLoadedState(level) || this.getAssetsLoadingstate(level)) {
            // we already loaded this assets, or we're still loading them
            return Promise.resolve();
        }

        this.preAssetsLoad(level);

        return Promise.all([ 
            Audio.load(this.audio(level), level),
            Video.load(this.video(level), level),
            Images.load(this.images(level), this.textures(level), this.cubeTextures(level), level),
            Models.loadModels(this.models(level), level),
            Scripts.load(this.scripts(level), level)
        ])
        .then(this.postAssetsLoad(level))
        .catch(this.handleAssetsLoadError)
    }

    update(dt) {
        Audio.update(dt);
        Lights.update(dt);
    }
}

export default new Assets();
