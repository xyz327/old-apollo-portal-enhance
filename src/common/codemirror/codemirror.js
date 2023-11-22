
import { loadCss, loadJs } from "../../base";

import { DateType } from "../datatype";
const modules = {
    core: {
        js: "https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/codemirror/5.65.2/codemirror.min.js",
        css: "https://lf9-cdn-tos.bytecdntp.com/cdn/expire-1-M/codemirror/5.65.2/codemirror.min.css"
    },
    json: {
        alias: "javascript",
        mode: "application/json"
    },
    javascript: {
        js: "https://lf6-cdn-tos.bytecdntp.com/cdn/expire-1-M/codemirror/5.65.2/mode/javascript/javascript.min.js",
        mode: "application/javascript"
    }
}
loadJs(modules.core.js)
loadCss(modules.core.css)
export const cm = {
    detectMode(val) {
        let mode
        if (DateType.isJson(val)) {
            mode = 'json'
        }
        const modeO = this.getModeO(mode)
        if (!modeO) {
            return Promise.resolve()
        }
        const alias = modeO.alias
        let needLoadMode = modeO
        if (alias) {
            needLoadMode = modules[alias]
        }
        return this.loadMode(needLoadMode).then(() => modeO?.mode)

    },
    getModeO(mode) {
        if (!mode) {
            return
        }
        let modeO = modules[mode]
        if (!modeO) {
            console.error(`不支持的mode:${mode}`)
            return;
        }
        return modeO;
    },
    loadMode(modeO) {
        if (modeO.loaded) {
            return Promise.resolve(modeO);
        }
        modeO.css && loadCss(modeO.css)
        modeO.loaded = true
        return loadJs(modeO.js).then(() => modeO)
    }
}