const QUERY_PREFIX = '?';
const AMPERSAND = '&';
const EQUALS = '=';
const EMPTY = '';
const EMPTY_QUERY = {};

export const toQueryString = (query = {}) => {
    const keys = Object.keys(query);
    if (keys.length == 0) {
        return EMPTY;
    }

    const q = QUERY_PREFIX + (keys.map(k =>  k + EQUALS + query[k] + AMPERSAND).join(EMPTY));

    return q.endsWith(AMPERSAND) ? q.substr(0, q.length -1) : q;
};

export const parseQuery = (queryString = '') => {
    return queryString.length > 1 ?
        queryString
            .replace(QUERY_PREFIX, EMPTY)
            .split(AMPERSAND)
            .map(couple => {
                const split = couple.split(EQUALS);
                return { [split[0]]: split[1] };
            })
            .reduce((acc, param) => ({ ...acc, ...param }), {}) :
        EMPTY_QUERY;
}
