import { LabelComponent, createElement } from '../../dist/mage.js';

class UI extends LabelComponent {

    constructor(props) {
        super(props);

        this.state = { test: 0 };
    }

    componentDidMount() {
        super.componentDidMount();
        this.setState({ test: 1 });
        setInterval(() => {
            this.setState({ test: this.state.test + 1 });
        }, 2000);
    }

    render() {
        const span = createElement('span', { className: 'progress-bar-fill', style: `width: ${this.state.test}%;` });
        const progressbar = createElement('div', { className: 'progress-bar', children: [span, `${this.state.test}`] });

        return createElement('div', { ref: this.element, className: 'wrapper', children: progressbar });
    }
}

export default UI;