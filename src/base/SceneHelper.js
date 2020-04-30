import {
    Grid,
    Cube,
    Sphere,
    Cylinder
} from '../entities/helpers';

export default class SceneHelper {

    addGrid(size, division, color1, color2) {
        return new Grid(size, division, color1, color2);
    }

    addCube(side, color, options) {
        return new Cube(side, color, options);
    }

    addSphere(radius, color, options) {
        return new Sphere(radius, color, options);
    }

    addCylinder(radiusTop, radiusBottom, height, color, options) {
        return new Cylinder(radiusTop, radiusBottom, height, color, options);
    }
}