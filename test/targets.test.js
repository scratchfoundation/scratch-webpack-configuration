const path = require('path');

const webpack = require('webpack');

const ScratchWebpackConfigBuilder = require('../src/index.cjs');

const common = {
    libraryName: 'test-library',
    rootPath: path.resolve(__dirname)
};

describe('generating configurations for specific targets', () => {
    it('should should generate a valid configuration without a target', () => {
        const genericConfig = new ScratchWebpackConfigBuilder(common)
            .get();
        expect(genericConfig).not.toHaveProperty('target');
        expect(() => webpack.validate(genericConfig)).not.toThrow();
    });

    it('should should generate a valid `node` configuration', () => {
        const nodeConfig = new ScratchWebpackConfigBuilder(common)
            .setTarget('node')
            .get();
        expect(nodeConfig).toMatchObject({target: 'node'});
        expect(() => webpack.validate(nodeConfig)).not.toThrow();
    });

    it('should should generate a valid `browserslist` configuration', () => {
        const webConfig = new ScratchWebpackConfigBuilder(common)
            .setTarget('browserslist')
            .get();
        expect(webConfig).toMatchObject({target: 'browserslist'});
        expect(() => webpack.validate(webConfig)).not.toThrow();
    });
});
