import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

import * as fs from "fs";
import pkg from "./package.json";
import _ from "lodash";
export default {
  input: "./src/main.js", //入口文件
  output: {
    banner: getBanner,
    file: "./dist/bundle.js", //打包后的存放文件
    format: "iife", //输出格式 amd es6 iife umd cjs
    name: "bundleName", //如果iife,umd需要指定一个全局变量
    globals: {
      // 全局 变量
    },
  },
  external: [],// 外部依赖 不会写入打包文件
  plugins: [
    resolve(), // so Rollup can find `ms`
    commonjs(), // so Rollup can convert `ms` to an ES module
  ],
};

function getBanner() {
  const hedaer = fs.readFileSync("./tampermonkey.header.js", {
    encoding: "utf8",
  });
  return _.template(hedaer, {
    // mustache style
    interpolate: /{{([\s\S]+?)}}/g,
  })(pkg);
}
