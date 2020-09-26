export const upperCaseFirst = (sentence = '') => (
    sentence && typeof sentence === 'string' && sentence.length ?
        `${sentence[0].toUpperCase()}${sentence.slice(1, sentence.length)}` :
        ''
);

export const removeFirst = sentence => sentence.slice(1, sentence.length);
