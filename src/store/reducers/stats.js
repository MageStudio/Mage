import packageJSON from '../../../package.json';

const DEFAULT_STATE = {
    mage: packageJSON.version
}

const stats = (state = DEFAULT_STATE, action = {}) => {
    return state;
};

export default stats;
