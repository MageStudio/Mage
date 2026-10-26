import { EventDispatcher } from "three";

/**
 * Wraps an EventDispatcher class so event delivery can be gated while paused.
 * Listeners registered with `{ whilePaused: true }` keep receiving events.
 */
export const Pausable = (Base = EventDispatcher) =>
    class extends Base {
        constructor(...args) {
            super(...args);
            this.paused = false;
            this.whilePausedListeners = new Set();
        }

        addEventListener(type, listener, options = {}) {
            super.addEventListener(type, listener);

            if (options && options.whilePaused === true) {
                this.whilePausedListeners.add(listener);
            }
        }

        removeEventListener(type, listener) {
            super.removeEventListener(type, listener);

            this.whilePausedListeners.delete(listener);
        }

        dispatchEvent(event) {
            if (!this.paused) {
                return super.dispatchEvent(event);
            }

            const listeners = this._listeners && this._listeners[event.type];

            if (!listeners) return;

            if (event.target === undefined || event.target === null) {
                event.target = this;
            }

            listeners
                .slice()
                .filter(listener => this.whilePausedListeners.has(listener))
                .forEach(listener => listener.call(this, event));
        }

        setPaused(flag) {
            this.paused = Boolean(flag);
        }
    };

export default Pausable;
