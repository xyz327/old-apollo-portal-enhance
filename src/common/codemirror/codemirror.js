
import { loadCss, loadJs } from "../../base";

import { DateType } from "../datatype";
const cm_modules = {
    core: {
        name: 'core',
        js: "https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/codemirror/5.65.2/codemirror.min.js",
        css: "https://lf9-cdn-tos.bytecdntp.com/cdn/expire-1-M/codemirror/5.65.2/codemirror.min.css"
    },
    mode: {
        json: {
            alias: "javascript",
            mode: "application/json",
            addons: ['json-lint']
        },
        javascript: {
            js: "https://lf6-cdn-tos.bytecdntp.com/cdn/expire-1-M/codemirror/5.65.2/mode/javascript/javascript.min.js",
            mode: "application/javascript",
            addons: ['matchbrackets']
        }
    },
    addon: {
        dialog: {
            preload: true,
            css: "https://lf9-cdn-tos.bytecdntp.com/cdn/expire-1-M/codemirror/5.65.2/addon/dialog/dialog.min.css",
            js: "https://lf9-cdn-tos.bytecdntp.com/cdn/expire-1-M/codemirror/5.65.2/addon/dialog/dialog.min.js"
        },
        panel: {
            preload: true,
            js: "https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/codemirror/5.65.2/addon/display/panel.min.js"
        },
        matchbrackets: { preload: true, js: "https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/codemirror/5.65.2/addon/edit/matchbrackets.min.js" },
        foldcode: { js: "https://lf6-cdn-tos.bytecdntp.com/cdn/expire-1-M/codemirror/5.65.2/addon/fold/foldcode.min.js" },
        foldgutter: {
            preload: true,
            js: "https://lf6-cdn-tos.bytecdntp.com/cdn/expire-1-M/codemirror/5.65.2/addon/fold/foldgutter.min.js",
            css: "https://lf6-cdn-tos.bytecdntp.com/cdn/expire-1-M/codemirror/5.65.2/addon/fold/foldgutter.min.css"
        },
        "indent-fold": {
            preload: true,
            js: "https://lf6-cdn-tos.bytecdntp.com/cdn/expire-1-M/codemirror/5.65.2/addon/fold/indent-fold.min.js"
        },
        "json-lint": {
            js: "https://lf26-cdn-tos.bytecdntp.com/cdn/expire-1-M/codemirror/5.65.2/addon/lint/json-lint.min.js"
        },
        "active-line": {
            preload: true,
            js: "https://lf6-cdn-tos.bytecdntp.com/cdn/expire-1-M/codemirror/5.65.2/addon/selection/active-line.min.js"
        },
        "annotatescrollbar": {
            preload: true,
            js: "https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/codemirror/5.65.2/addon/scroll/annotatescrollbar.min.js"
        },
        "search": {
            preload: true,
            js: "https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/codemirror/5.65.2/addon/search/search.js"
        },
        "searchcursor": {
            preload: true,
            js: "https://lf9-cdn-tos.bytecdntp.com/cdn/expire-1-M/codemirror/5.65.2/addon/search/searchcursor.min.js"
        },
        "matchesonscrollbar": {
            preload: true,
            css: "https://lf9-cdn-tos.bytecdntp.com/cdn/expire-1-M/codemirror/5.65.2/addon/search/matchesonscrollbar.min.css",
            js: "https://lf26-cdn-tos.bytecdntp.com/cdn/expire-1-M/codemirror/5.65.2/addon/search/matchesonscrollbar.min.js"
        },
        "match-highlighter": {
            preload: true,
            js: "https://lf6-cdn-tos.bytecdntp.com/cdn/expire-1-M/codemirror/5.65.2/addon/search/match-highlighter.min.js"
        },
        "jump-to-line": {
            preload: true,
            js: "https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/codemirror/5.65.2/addon/search/jump-to-line.min.js"
        },
        "simplescrollbars": {
            preload: true,
            css: "https://lf6-cdn-tos.bytecdntp.com/cdn/expire-1-y/codemirror/5.65.2/addon/scroll/simplescrollbars.css",
            js: "https://lf9-cdn-tos.bytecdntp.com/cdn/expire-1-y/codemirror/5.65.2/addon/scroll/simplescrollbars.min.js"
        }
    }
};
const preLoadModule = [];
; (function () {
    ['mode', 'addon'].forEach(type => {
        for (let module of Object.keys(cm_modules[type])) {
            const modeO = cm_modules[type][module]
            modeO.name = module;
            if (modeO.preload) {
                preLoadModule.push(modeO)
            }
        }
    });
})();
const panels = []
export var cm = {
    detectMode(val) {
        let mode
        if (DateType.isJson(val)) {
            mode = 'json'
        }
        return mode;
    },
    detectModeAndLoad(val) {
        const mode = this.detectMode(val);
        if (!mode) {
            return Promise.resolve();
        }
        return this._getAndloadMode(mode).then((modeO) => modeO?.mode)
    },
    init(cmObj) {
        cmObj.setOption("scrollbarStyle", "overlay")
        const panel = cmObj.addPanel($(`
        <div style="min-height:20px" class="clearfix">
            <div class="pull-right">
                <button class="btn btn-xs" type="button" data-cm-edit-type="format">json格式化</button>
                <button class="btn btn-xs" type="button" data-cm-edit-type="zip">json压缩</button>
            </div>
        </div>
        `)[0], { position: 'top', stable: true });
        panels.push(panel)
        $(document).on('click', 'button[data-cm-edit-type]', function (event) {
            const type = $(this).attr('data-cm-edit-type')
            let value = cmObj.getValue()
            const isJson = DateType.isJson(value);
            if (!isJson) {
                return
            }
            switch (type) {
                case 'format':
                    value = JSON.stringify(JSON.parse(value), null, 2);
                    break
                case 'zip':
                    value = JSON.stringify(JSON.parse(value));
                    break
            }
            cmObj.setValue(value)
        })
    },
    destory(cmObj) {
        for (const panel of panels) {
            panel.clear()
        }
        cmObj && cmObj.toTextArea()
    },
    autoMode(cmObj) {
    },
    _getAndloadMode(mode) {
        let modeO = cm_modules.mode[mode]
        if (!modeO) {
            console.error(`不支持的mode:${mode}`)
            return Promise.resolve()
        }
        const alias = modeO.alias
        if (alias) {
            return this._loadModeAddon(modeO).then(() => this._getAndloadMode(alias))
        } else {
            return this._loadModeAddon(modeO).then(() => this._loadModule(modeO))
        }
    },
    _loadModule(moduleO) {
        if (moduleO.loaded) {
            return Promise.resolve(moduleO);
        }
        moduleO.css && loadCss(moduleO.css)
        return loadJs(moduleO.js)
            .then(() => {
                moduleO.loaded = true
                return moduleO;
            })
    },
    _loadAddon(addOn) {
        const addonO = cm_modules.addon[addOn]
        return this._loadModule(addonO)
    },
    _loadModeAddon(modeO) {
        if (modeO.addons) {
            return Promise.all(modeO.addons.map(addon => this._loadAddon(addon)))
        }
        return Promise.resolve()

    }
};

$(function () {
    cm._loadModule(cm_modules.core).then(() => {
        preLoadModule.forEach(moduleO => {
            cm._loadModule(moduleO)
        })
    })
})