import { loadFeature } from "../base";
import { cm } from "../common/codemirror/codemirror"


loadFeature("valueCodeEditor", false, function () {
    let cmObj;
    function sync() {
        if (cmObj) {
            cmObj.save()
            $(cmObj.getTextArea()).trigger('change') // 触发angular.js 
        }
    }
    $("#itemModal")
        .on("shown.bs.modal", function () {
            const $textarea = $('#itemModal textarea[name=value]')
            cm.detectModeAndLoad($textarea.val())
                .then(mode => {
                    console.log(mode)
                    cmObj = CodeMirror.fromTextArea($textarea[0], {
                        lineNumbers: true,
                        lineWrapping: true,
                        styleActiveLine: true,
                        mode: mode
                    })
                    cmObj.on('changes', function () {
                        sync()
                    })
                    cm.init(cmObj)
                })

            //$("html").css("overflow", "hidden");


            //htmlScroller.hide();
        })
        .on("hidden.bs.modal", function () {
            cm.destory(cmObj)
            
            console.log(cmObj)
        });
    var $btn = $("#itemModal div.modal-footer").find("button[type=submit]");
    $btn.click(function (e) {
        sync()
    })

})
