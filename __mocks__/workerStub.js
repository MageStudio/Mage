// Test stub for rollup `worker:` imports (e.g. `worker:./worker`). The physics
// worker bundle is not exercised in unit tests; this lets modules that import a
// worker be loaded under jest without the rollup worker plugin.
module.exports = class WorkerStub {
    postMessage() {}
    addEventListener() {}
    removeEventListener() {}
    terminate() {}
};
module.exports.default = module.exports;
