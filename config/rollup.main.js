import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';

import { terser } from 'rollup-plugin-terser';
import webWorkerLoader from 'rollup-plugin-web-worker-loader';

export default {
    input: './src/index.js',
    output: {
        file: './dist/mage.js',
        format: 'esm',
        compact: true,
        minifyInternalExports: false,
        name: 'M',
        globals: {
            process: {
                env: {
                    NODE_ENV: 'development'
                }
            }
        }
    },
    cache: true,
    perf: true,
    plugins: [
        replace({
            'process.env.NODE_ENV': JSON.stringify('production')
        }),
        resolve(),
        babel({
            exclude: ['node_modules/**']
        }),
        commonjs(), 
        webWorkerLoader({
            pattern: /worker:(.+)/,
            targetPlatform: 'browser'
        }),
        // terser(),
        json()
    ]
}