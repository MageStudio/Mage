import { Label, math, LabelComponent, BaseScript, rxjs, createElement } from "../../dist/mage.js";

export class SpeedometerLabel extends LabelComponent {

    constructor(props) {
        super(props);
        this.state = { value: 0 };
    }

    componentDidMount() {
        super.componentDidMount();
        const { speed } = this.props;
        speed
            .subscribe((_value) => {
                const value = math.clamp(_value, 0, _value);
                this.setState({ value: Math.floor(value) })
            });
    }

    render() {
        return createElement('span', { ref: this.element, className: 'speedometer', children: `${this.state.value}` });
    }
}

export default class Speedometer extends BaseScript {

    constructor() {
        super('Speedometer');
    }

    start(car) {
        this.car = car;
        this.speed = new rxjs.Subject();
        const label = new Label({ Component: SpeedometerLabel, speed: this.speed, width: 1, height: 1 });

        this.car.add(label, car.getBody(), { waitForBody: 200, waitForBodyMaxRetries: 5 })
            .then(() => label.setPosition({ x: -2 }));
    }

    physicsUpdate(dt) {
        this.speed.next(this.car.getPhysicsState().speed)
    }
}