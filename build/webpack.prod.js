/**
 * @author:  lanshuai
 * @Date: 2020-08-03
 * @description
 */
const commonConfig = require("./webpack.common")
const {merge} = require("webpack-merge")

const prodConfig = {
    mode: "production",
    devtool: 'cheap-module-source-map',
}


module.exports = merge(commonConfig, prodConfig)
