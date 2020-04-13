import packageJSON from '../../../package.json';

const DEFAULT_STATE = {
    mage: packageJSON.version
}

export default (state = DEFAULT_STATE, action = {}) => {
    return state;
};
