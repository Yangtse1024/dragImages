/**
 * @author:  lanshuai
 * @Date: 2020-08-04
 * @description
 */
const path = require("path")
const HtmlWebpackPlugin = require('html-webpack-plugin')
const {CleanWebpackPlugin} = require("clean-webpack-plugin")

module.exports = {
    entry: {
        main: path.join(__dirname, "..", "src", "js", "index.js"),
    },
    output: {
        filename: "[name]_[hash].js",
        path: path.join(__dirname, "..", "dist")
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader', "postcss-loader"],
            },
            {
                test: /\.(jpg|gif|png)$/,
                loader: "url-loader",
                options: {
                    name: '[path]_[name].[ext]',
                    outputPath: "imgs/",
                    limit: 2048
                }
            },
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(__dirname, "..", "src", "index.html")
        }),
        new CleanWebpackPlugin({
            cleanAfterEveryBuildPattern: ["../dist"]
        })
    ],
}
