import { loadFeature } from "../base";
import { cm } from "../common/codemirror/codemirror"


loadFeature("valueCodeEditor", false, function () {
    let cmObj;
    $("#itemModal")
        .on("shown.bs.modal", function () {
            const $textarea = $('#itemModal textarea[name=value]')
            cm.detectMode($textarea.val())
                .then(mode => {
                    console.log(mode)
                    cmObj = CodeMirror.fromTextArea($textarea[0], {
                        lineNumbers: true,
                        mode: mode
                    })
                })
            //$("html").css("overflow", "hidden");


            //htmlScroller.hide();
        })
        .on("hidden.bs.modal", function () {
            cmObj && cmObj.toTextArea()
            console.log(cmObj)
        });
    var $btn = $("#itemModal div.modal-footer").find("button[type=submit]");
    $btn.click(function (e) {
        if (cmObj) {
            cmObj.save()
            $(cmObj.getTextArea()).trigger('change') // 触发angular.js 
        }
    })

})
