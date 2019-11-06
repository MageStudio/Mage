import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';


export default {
    // input for bundle, same concept as 'entry' in webpack
    input: './src/index.js',
    // non-relative imports are not included by rollup,
    // here we explicitly list our external deps
    output: {
        file: './dist/mage.js',
        format: 'esm',
        compact: true,
        name: 'M'
    },
    plugins: [
        resolve(),
        babel({
            exclude: ['node_modules/**'],
            //runtimeHelpers: true
        }),
        commonjs({
            namedExports: {
                'between.js': [],
                'vivus': []
            }
        }),
    ]
};
