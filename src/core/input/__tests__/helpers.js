export class FakeKeyboardEvent {
    constructor(type, init = {}) {
        this.type = type;
        Object.assign(this, init);
    }
}

export class FakeMouseEvent extends FakeKeyboardEvent {}

export const installWindowStub = () => {
    global.window = {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    };
    global.KeyboardEvent = FakeKeyboardEvent;
    global.MouseEvent = FakeMouseEvent;
};

export const windowEventsOfType = type =>
    global.window.dispatchEvent.mock.calls.map(([e]) => e).filter(e => e.type === type);
