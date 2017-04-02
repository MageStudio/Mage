// retrieving M object
var window, M;
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    window = window || {
        asModule: true,
        THREE: {},
        document: {}
    };
    document = window.document;
    M = window.M || {};
}