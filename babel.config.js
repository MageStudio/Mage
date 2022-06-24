const config = {
    presets: [
        ["@babel/preset-env", {
            "targets": {
                "browsers": ["> 0.25%", "ie >= 11"]
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

console.log('\n\n\ngetting babel config\n\n\n');

module.exports = config;
