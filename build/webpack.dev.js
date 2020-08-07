/**
 * @author:  lanshuai
 * @Date: 2020-08-03
 * @description
 */
const path = require("path")
const commonConfig = require("./webpack.common")
const {merge} = require("webpack-merge")

const devConfig = {
    mode: "development",
    devtool: "cheap-module-eval-source-map",
    devServer: {
        port: 5000,
        contentBase: path.join(__dirname,"..",  "dist")
    },
}

module.exports = merge(commonConfig, devConfig)
