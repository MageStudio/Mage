const eslint = require("@eslint/js");
const prettier = require("eslint-plugin-prettier/recommended");
const globals = require("globals");

module.exports = [
    {
        ignores: [
            "dist/",
            "node_modules/",
            "__mocks__/",
            "config/",
            "src/loaders/ColladaLoader.js",
            "src/loaders/GLTFLoader.js",
            "src/loaders/FBXLoader.js",
            "src/lib/fflate.js",
            "src/models/SkeletonUtils.js",
            "src/controls/Orbit.js",
            "src/controls/Transform.js",
            "src/controls/TransformGizmo.js",
            "src/fx/materials/Ocean.js",
            "src/fx/materials/Water.old.js",
            "src/fx/materials/Mirror.js",
            "src/scripts/builtin/SmoothCameraFollow.js",
        ],
    },
    eslint.configs.recommended,
    prettier,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            globals: {
                ...globals.browser,
                requestNextFrame: "readonly",
                global: "readonly",
            },
        },
        rules: {
            "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
            "no-console": "off",
            "no-dupe-class-members": "warn",
            "no-empty": ["error", { allowEmptyCatch: true }],
            "prettier/prettier": ["error", { endOfLine: "auto" }],
        },
    },
    {
        files: ["**/__tests__/**/*.js", "**/*.test.js"],
        languageOptions: {
            globals: {
                ...globals.jest,
                ...globals.commonjs,
            },
        },
    },
    {
        files: ["src/physics/worker/**/*.js"],
        languageOptions: {
            globals: {
                Ammo: "readonly",
                postMessage: "readonly",
                importScripts: "readonly",
            },
        },
    },
    {
        files: ["src/lib/features.js"],
        languageOptions: {
            globals: {
                ActiveXObject: "readonly",
            },
        },
    },
];
