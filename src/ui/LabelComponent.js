import { Component, createRef } from "inferno";

export default class LabelComponent extends Component {

    constructor(props) {
        super(props);
        this.element = createRef();
    }

    componentDidUpdate() {
        this.props.onUpdate(this.element.current);
    }

    componentDidMount() {
        this.props.onMount(this.element.current);
    }

    componentWillUnmount() {
        this.props.onUnmount(this.element.current);
    }
}