// amani bucheri mendez
import { DIVIDER } from '../constants';

export const buildAssetId = (name, level) => level ? `${level}_${name}` : name;
export const isLevelName = level => level.startsWith(DIVIDER);