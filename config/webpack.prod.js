/**
 * @author: tipe.io
 */
const helpers = require('./helpers');
const buildUtils = require('./build-utils');

/**
 * Used to merge webpack configs
 */
const webpackMerge = require('webpack-merge');

/**
 * The settings that are common to prod and dev
 */
const commonConfig = require('./webpack.common.js');

/**
 * Webpack Plugins
 */

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HashedModuleIdsPlugin = require('webpack/lib/HashedModuleIdsPlugin');
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const TerserPlugin = require('terser-webpack-plugin');

/***
 * Ref: https://github.com/mishoo/UglifyJS2/tree/harmony#minify-options
 * @param supportES2015
 * @param enableCompress disabling compress could improve the performance, see https://github.com/webpack/webpack/issues/4558#issuecomment-352255789
 * @returns {{ecma: number, warnings: boolean, ie8: boolean, mangle: boolean, compress: {pure_getters: boolean, passes: number}, output: {ascii_only: boolean, comments: boolean}}}
 */
function getUglifyOptions(supportES2015, enableCompress) {
    const uglifyCompressOptions = {
        pure_getters: true /* buildOptimizer */,
        // PURE comments work best with 3 passes.
        // See https://github.com/webpack/webpack/issues/2899#issuecomment-317425926.
        passes: 2 /* buildOptimizer */
    };

    return {
        ecma: supportES2015 ? 6 : 5,
        warnings: false, // TODO verbose based on option?
        ie8: false,
        mangle: true,
        compress: enableCompress ? uglifyCompressOptions : false,
        output: {
            ascii_only: true,
            comments: false
        }
    };
}

module.exports = function (env) {
    const ENV = (process.env.NODE_ENV = process.env.ENV = 'production');
    const supportES2015 = buildUtils.supportES2015(buildUtils.DEFAULT_METADATA.tsConfigPath);
    const sourceMapEnabled = process.env.SOURCE_MAP === '1';
    const METADATA = Object.assign({}, buildUtils.DEFAULT_METADATA, {
        host: process.env.HOST || 'localhost',
        port: process.env.PORT || 8080,
        ENV: ENV,
        HMR: false
    });

    // set environment suffix so these environments are loaded.
    METADATA.envFileSuffix = METADATA.E2E ? 'e2e.prod' : 'prod';

    return webpackMerge(commonConfig({
        env: ENV,
        version: env ? env.VERSION : 'prod_version',
        api_url: env ? (env.API_URL == "" ? "" : (env.API_URL ? 'http://' + env.API_URL : 'http://192.168.90.39')) : 'http://192.168.90.39'
    }), {
        mode: 'production',

        // devtool: 'source-map',

        /**
         * Options affecting the output of the compilation.
         *
         * See: https://webpack.js.org/configuration/output/
         */
        output: {
            /**
             * The output directory as absolute path (required).
             *
             * See: https://webpack.js.org/configuration/output/#output-path
             */
            path: helpers.root('dist'),

            /**
             * Specifies the name of each output file on disk.
             * IMPORTANT: You must not specify an absolute path here!
             *
             * See: https://webpack.js.org/configuration/output/#output-filename
             */
            filename: '[name].[chunkhash].bundle.js',

            /**
             * The filename of the SourceMaps for the JavaScript files.
             * They are inside the output.path directory.
             *
             * See: https://webpack.js.org/configuration/output/#output-sourcemapfilename
             */
            sourceMapFilename: '[file].map',

            /**
             * The filename of non-entry chunks as relative path
             * inside the output.path directory.
             *
             * See: https://webpack.js.org/configuration/output/#output-chunkfilename
             */
            chunkFilename: '[name].[chunkhash].chunk.js'
        },

        module: {
            rules: [
                /**
                 * Extract CSS files from .src/styles directory to external CSS file
                 */
                {
                    test: /\.css$/,
                    use: [MiniCssExtractPlugin.loader, 'css-loader', 'cache-loader'],
                    include: [helpers.root('src', 'styles')]
                },

                /**
                 * Extract and compile SCSS files from .src/styles directory to external CSS file
                 */
                {
                    test: /\.scss$/,
                    use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader', 'cache-loader'],
                    include: [helpers.root('src', 'styles')]
                }
            ]
        },

        optimization: {
            minimizer: [
                /**
                 * Plugin: UglifyJsPlugin
                 * Description: Minimize all JavaScript output of chunks.
                 * Loaders are switched into minimizing mode.
                 *
                 * See: https://webpack.js.org/plugins/uglifyjs-webpack-plugin/
                 *
                 * NOTE: To debug prod builds uncomment //debug lines and comment //prod lines
                 */
                // new UglifyJsPlugin({
                //     sourceMap: sourceMapEnabled,
                //     parallel: true,
                //     cache: helpers.root('webpack-cache/uglify-cache'),
                //     uglifyOptions: getUglifyOptions(supportES2015, true)
                // })

                // https://www.npmjs.com/package/terser-webpack-plugin
                new TerserPlugin({
                    // chunkFilter: (chunk) => {
                    //     // Exclude uglification for the `vendor` chunk
                    //     if (chunk.name === 'vendors') {
                    //         return false;
                    //     }
                    //
                    //     return true;
                    // },
                    cache: true,
                    parallel: true,
                    sourceMap: false,
                    terserOptions: {
                        output: {
                            comments: false,
                        },
                    }
                }),
            ],
            splitChunks: {
                chunks: 'all',
            },

            // splitChunks: {
            //     cacheGroups: {
            //         vendor: false,
            //         vendors: false
            //     }
            // }
        },

        /**
         * Add additional plugins to the compiler.
         *
         * See: https://webpack.js.org/configuration/plugins/
         */
        plugins: [
            new MiniCssExtractPlugin({filename: '[name]-[hash].css', chunkFilename: '[name]-[chunkhash].css'}),
            new HashedModuleIdsPlugin(),
            // new BundleAnalyzerPlugin({ //turn on for analyze
            //     analyzerMode: 'static'
            // }),
        ],

        /**
         * Include polyfills or mocks for various node stuff
         * Description: Node configuration
         *
         * See: https://webpack.js.org/configuration/node/
         */
        node: {
            global: true,
            crypto: 'empty',
            process: false,
            module: false,
            clearImmediate: false,
            setImmediate: false,
            fs: 'empty'
        }
    });
};
