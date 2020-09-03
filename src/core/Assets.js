import Audio from '../audio/Audio';
import Video from '../video/Video';
import Images from '../images/Images';
import Models from '../models/Models';
import Particles from '../fx/particles/Particles';
import Lights from '../lights/Lights';
import Scripts from '../scripts/Scripts';
import { ASSETS_TYPES, DIVIDER } from '../lib/constants';

const DEFAULT_COMMON_ASSETS = {
    [ASSETS_TYPES.AUDIO]: {},
    [ASSETS_TYPES.VIDEO]: {},
    [ASSETS_TYPES.IMAGES]: {},
    [ASSETS_TYPES.TEXTURES]: {},
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

export const buildAssetId = (name, level) => level ? `${level}_${name}` : name;
export const isLevelName = level => level.startsWith(DIVIDER);

export class Assets {

    constructor() {
        this.assets = DEFAULT_ASSETS;
    }

    parseAssets(assets) {
        const validAssetsTypes = Object.values(ASSETS_TYPES);
        const reducer = (group, assetType) => {
            const lowerCaseType = assetType.toLowerCase();

            if (validAssetsTypes.includes(lowerCaseType)) {
                group.common[lowerCaseType] = assets[assetType];
            } else if (isLevelName(lowerCaseType)) {
                group.levels[lowerCaseType] = assets[assetType] || DEFAULT_COMMON_ASSETS;
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

    setLoadedLevelState = (loaded, level) => {
        if (this.assets.levels[level]) {
            this.assets.levels[level]._isLoaded = loaded;
        }
    }

    setLoadedCommonState = (loaded) => {
       this.assets.common._isLoaded = loaded;
    }

    areLevelAssetsLoaded = (level) => this.getLevelAssets(level)._isLoaded

    areCommonAssetsLoaded = () => this.getCommonAssets()._isLoaded;

    audio = (level) => level ? this.getLevelAssets(level).audio : this.getCommonAssets().audio;

    video = (level) => level ? this.getLevelAssets(level).video : this.getCommonAssets().video;

    images = (level) => level ? this.getLevelAssets(level).images : this.getCommonAssets().images;

    textures = (level) => level ? this.getLevelAssets(level).textures : this.getCommonAssets().textures;

    models = (level) => level ? this.getLevelAssets(level).models : this.getCommonAssets().models;

    particles = (level) => level ? this.getLevelAssets(level).particles : this.getCommonAssets().particles;

    scripts = (level) => level ? this.getLevelAssets(level).scripts : this.getCommonAssets().scripts;

    load = (level) => Promise.all([ 
        Audio.load(this.audio(level), level),
        Video.load(this.video(level), level),
        Images.load(this.images(level), this.textures(level), level),
        Models.loadModels(this.models(level), level),
        Scripts.load(this.scripts(level), level)
    ]).then(() => {
        if (level) {
            this.setLoadedLevelState(true, level);
        }
        this.setLoadedCommonState(true);
    });

    update(dt) {
        Audio.update(dt);
        Lights.update(dt);
        Particles.update(dt);
    }
}

export default new Assets();
