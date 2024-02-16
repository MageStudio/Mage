import Input from "../../core/input/Input";
import BaseScript from "../BaseScript";
import Physics from "../../physics";

export default class BaseCar extends BaseScript {
    constructor() {
        super("BaseCar");
    }

    start(element, options) {
        const {
            wheels,
            accelerationKey = "w",
            brakingKey = "s",
            rightKey = "d",
            leftKey = "a",
            debug = false,
            autostart = true,
            ...physicsOptions
        } = options;

        this.car = element;
        this.wheels = wheels;

        this.state = {
            acceleration: false,
            braking: false,
            right: false,
            left: false,
        };

        this.accelerationKey = accelerationKey;
        this.brakingKey = brakingKey;
        this.rightKey = rightKey;
        this.leftKey = leftKey;

        this.engineStarted = autostart;

        Input.enable();
        Input.keyboard.listenTo([accelerationKey, brakingKey, rightKey, leftKey]);
        Physics.addVehicle(this.car, { wheels: wheels.map(w => w.uuid()), ...physicsOptions });
    }

    startEngine() {
        this.engineStarted = true;
    }

    stopEngine() {
        this.engineStarted = false;
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
        if (this.engineStarted) {
            this.handleInput();
            this.sendCarUpdate();
        }
    }
}
