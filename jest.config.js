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
