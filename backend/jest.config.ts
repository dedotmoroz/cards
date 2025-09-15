/** @jest-config-loader ts-node */
/** @jest-config-loader-options {"transpileOnly": true} */

import type {Config} from 'jest'

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
}

export default config
