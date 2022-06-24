import { inferno, createElement, htmlTexture } from '../../dist/mage.js';

// const UI = ({ name = 'marco', age = 13 }) => {
//     return createElement('span', null, `My name is: ${name} and my age is: ${age}`)
// };

class UI extends inferno.Component {

    constructor(props) {
        super(props);

        this.state = { test: 0 };
        this.element = inferno.createRef();
    }

    componentDidUpdate() {
        console.log(this.element.current);
        htmlTexture.convertToPng(this.element.current);
    }

    componentDidMount() {
        this.setState({ test: 1 });
        setInterval(() => {
            this.setState({ test: this.state.test + 1 });
        }, 2000)
    }

    render() {
        return createElement('div', { ref: this.element, className: 'three_d_ui' }, `My name is:Marco and i am ${this.state.test} years old`)
    }
}

export default UI;