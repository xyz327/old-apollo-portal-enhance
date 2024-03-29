import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { string } from "rollup-plugin-string";
import json from "@rollup/plugin-json";

import * as fs from "fs";
import path from "path";
import pkg from "./package.json";
import _ from "lodash";

const allModuleImport = fs.readdirSync('./src/module')
  .filter(file => path.extname(file) === '.js') // 只包含 .js 文件
  .map(file => `import './module/${file}'`)
  .join("\n");

fs.writeFileSync("./src/main.js", _.template(fs.readFileSync("./src/main.template.js.hbs", { "encoding": "utf-8" }), {
  // mustache style
  interpolate: /{{([\s\S]+?)}}/g,
})(_.extend(pkg, { allModuleImport })))


export default {
  input: "./src/main.js", //入口文件
  output: [
    {
      banner: getBanner({ destFile: "tampermonkey-script.js" }),
      file: "./tampermonkey-script.js", //打包后的存放文件
      format: "iife", //输出格式 amd es6 iife umd cjs
      name: "bundleName", //如果iife,umd需要指定一个全局变量
      globals: {
        // 全局
        jquery: "$",
        lodash: "_",
      },
    },
  ],
  external: ["jquery", "lodash"], // 外部依赖 不会写入打包文件
  plugins: [
    commonjs(), // so Rollup can convert `ms` to an ES module
    resolve(), // so Rollup can find `ms`
    string({
      // Required to be specified
      include: "**/*.html",
    }),
    json(),
    // typescript(),
  ],
};

function getBanner(config) {
  const hedaer = fs.readFileSync("./tampermonkey.header.js", {
    encoding: "utf8",
  });
  return _.template(hedaer, {
    // mustache style
    interpolate: /{{([\s\S]+?)}}/g,
  })(_.extend(pkg, config || {}));
}
