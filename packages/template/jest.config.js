/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
    verbose: true,
    testEnvironment: 'jsdom',
    roots: ['<rootDir>/dist/cjs']
};
module.exports = config;
