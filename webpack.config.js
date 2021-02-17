var path = require('path')
var webpack = require('webpack')
const CopyPlugin = require('copy-webpack-plugin')
var BrowserSyncPlugin = require('browser-sync-webpack-plugin')

module.exports = {
    entry: {
        app: [path.resolve(__dirname, 'src/main.js')],
        vendor: ['phaser']
    },
    devtool: false,
    output: {
        chunkLoading: false,
        wasmLoading: false,
        pathinfo: true,
        path: path.resolve(__dirname, 'dist'),
        publicPath: './dist/',
        filename: '[name].bundle.js'
    },
    watch: true,
    plugins: [
        new webpack.DefinePlugin({
            CANVAS_RENDERER: JSON.stringify(true),
            WEBGL_RENDERER: JSON.stringify(true)
        }),
        new CopyPlugin({
            patterns: [
                { from: './assets', to: './assets' },
                { from: './manifest.json', to: './manifest.json' },
                { from: './index.html', to: './index.html' },
                { from: './init.html', to: './init.html' },
                { from: './init.js', to: './init.js' }
            ]
        }),
        new BrowserSyncPlugin({
            host: process.env.IP || 'localhost',
            port: process.env.PORT || 3000,
            index: 'debug.html',
            server: {
                baseDir: ['./', './build']
            }
        })
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                use: ['babel-loader'],
                include: path.join(__dirname, 'src')
            }
        ]
    }
}
