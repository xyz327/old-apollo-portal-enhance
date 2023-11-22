import { loadFeature } from "../base";

loadFeature("prodWarn", false, function () {
  prodWarn();
});

function prodWarn() {
  var $releaseModal = $("#releaseModal");

  $releaseModal.on("show.bs.modal", function () {
    var namespaceScope = $(
      'div[ng-controller="ConfigNamespaceController"]'
    ).scope();
    var env = namespaceScope.pageContext.env;
    if (!isProd(env)){
        return;
    }
    layer.open({
        shadeClose: true,
        content: `你正在操作<font color="red">${env}</font>环境!<br/>正确则可以忽略本消息`,
        icon:0,
        btn: ['关闭']
    });
  });
}
function isProd(env){
    return env && env === 'PRO'
}
