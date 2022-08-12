import between from 'between.js';

export const LOOPING = {
    BOUNCE: 'bounce',
    REPEAT: 'repeat',
    NONE: false
};

export const EASING_EVENTS = {
    UPDATE: 'update',
    COMPLETE: 'complete'
};

export const FUNCTIONS = {
    ...between.Easing
};

export const tweenTo = (origin, target, options = {}) => (
    new Promise((resolve) => {
        const {
            time,
            easing = FUNCTIONS.Linear.None,
            loop = LOOPING.NONE,
            onUpdate = f => f,
            repeat = undefined
        } = options;

        const tween = new between(origin, target)
            .time(time)
            .easing(easing)
            .on(EASING_EVENTS.UPDATE, onUpdate)

        const infinite = loop && !repeat;
        const onComplete = () => resolve(tween, infinite);

        if (loop) {
            tween.loop(loop, repeat);
        }

        if (infinite) {
            const timeToCompleteLoop = time * 2;
            setTimeout(onComplete, timeToCompleteLoop);
        } else {
            tween.on(EASING_EVENTS.COMPLETE, onComplete);
        }
    })
);

