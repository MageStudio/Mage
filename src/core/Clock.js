export class Clock {

    constructor() {
        this.timestamp = null;
    }

    getDelta() {
        const time = Date.now();
        if (this.timestamp) {
            const delta = time - this.timestamp;
            this.timestamp = time;

            return delta;
        } else {
            this.timestamp = time;

            return 0;
        }
    }
}

export default new Clock();