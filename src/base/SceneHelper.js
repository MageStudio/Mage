import Grid from '../entities/helpers/Grid';

export default class SceneHelper {

    addGrid(size, division, color1, color2) {
        this.grid = new Grid(size, division, color1, color2);
    }
}
