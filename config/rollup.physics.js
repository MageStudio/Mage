import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';

export default {
    input: './src/physics.index.js',
    output: {
        file: './dist/mage.physics.js',
        format: 'umd',
        compact: true,
        minifyInternalExports: false,
        name: 'OIMO'
    },
    cache: true,
    perf: true,
    plugins: [
        resolve(),
        babel({ exclude: ['node_modules/**'] }),
        commonjs(),
        terser(),
        json()
    ]
}