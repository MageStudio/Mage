"use strict";

module.exports = {
    roots: ["<rootDir>/src"],

    testMatch: [
        "**/__tests__/**/*.test.js",
        "**/*.test.js",
    ],

    transform: {
        "^.+\\.js$": "babel-jest",
    },

    moduleNameMapper: {
        // Rollup `worker:` imports have no jest resolver; stub them so modules
        // that pull in a web worker can be loaded in unit tests.
        "^worker:.*$": "<rootDir>/src/__mocks__/workerStub.js",
    },

    transformIgnorePatterns: [
        "/node_modules/(?!three/)",
    ],

    collectCoverageFrom: [
        "src/lib/**/*.js",
        "src/entities/**/*.js",
        "src/models/**/*.js",
        "src/physics/**/*.js",
        "src/images/**/*.js",
        "!src/lib/fflate.js",
        "!src/lib/workers.js",
        "!src/physics/worker/index.js",
    ],

    testEnvironment: "node",
};
