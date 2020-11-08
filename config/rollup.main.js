import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';

export default {
    input: './src/index.js',
    output: {
        file: './dist/mage.js',
        format: 'esm',
        compact: true,
        minifyInternalExports: false,
        name: 'M'
    },
    cache: true,
    perf: true,
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
        // terser(),
        json()
    ]
}