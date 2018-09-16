import Light from './light';

export default class AmbientLight extends Light {
    
    constructor(color, _intensity, _position) {
        var intensity = _intensity ? _intensity : 1,
            position = _position ? _position : new THREE.Vector3(0, 0, 0);
        super(color, intensity, position);
        this.light = new THREE.AmbientLight(color);
        app.add(this.light, this);
    }

}
