const config = {
    presets: [
        ["@babel/preset-env", {
            "targets": {
                // Modern browsers that support WebGL, async/await, and ES modules
                "browsers": ["> 0.5%", "not dead", "not ie 11"]
            }
        }],
    ],
    plugins: [
        'babel-plugin-syntax-jsx',
        ["babel-plugin-inferno", {"imports": true}],
        "@babel/plugin-proposal-class-properties",
        "@babel/plugin-transform-classes"
    ]
};

module.exports = config;
