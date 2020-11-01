import Input from '../../core/input/Input';
import BaseScript from '../BaseScript';
import Physics from '../../physics';

export default class BaseCar extends BaseScript {

    constructor() {
        super('BaseCar');
    }

    start(element, options) {
        const {
            wheels,
            accelerationKey = 'w',
            brakingKey = 's',
            rightKey = 'd',
            leftKey = 'a',
            debug = false,
            ...physicsOptions
        } = options;

        this.car = element;
        this.wheels = wheels;

        this.state = {
            acceleration: false,
            braking: false,
            right: false,
            left: false
        };

        this.accelerationKey = accelerationKey;
        this.brakingKey = brakingKey;
        this.rightKey = rightKey;
        this.leftKey = leftKey;

        Input.enable();
        Physics.addVehicle(this.car, { wheels: wheels.map(w => w.uuid()), ...physicsOptions });

        if (debug) {
            this.car.addHitBox();
        }
    }

    handleInput() {
        this.state.acceleration = Input.keyboard.isPressed(this.accelerationKey);
        this.state.braking = Input.keyboard.isPressed(this.brakingKey);
        this.state.right = Input.keyboard.isPressed(this.rightKey);
        this.state.left = Input.keyboard.isPressed(this.leftKey);
    }

    sendCarUpdate() {
        Physics.updateBodyState(this.car, this.state);
    }

    update(dt) {
        this.handleInput();
        this.sendCarUpdate();
    }

}