import { loadFeature, isFeatureDisabled } from "./base";

loadFeature("prodWarnDisable", false, function () {
  prodWarnDisable();
});

function prodWarnDisable() {

  var $btn = $("#releaseModal div.modal-footer").find("button[type=submit]");
  $btn.click(function (e) {
    var namespaceScope = $(
      'div[ng-controller="ConfigNamespaceController"]'
    ).scope();
    var env = namespaceScope.pageContext.env;
    if (!isProd(env)){
        return;
    }
    if (!isProd(env)) {
      return;
    }
    if (!isFeatureDisabled("prodWarnDisable")) {
      if (confirm("已关闭生产环境发布校验，是否继续？")) {
        namespaceScope.$root.userName = "disabledProdWarn";
      }
    }
  });
}
function isProd(env) {
  return env && env === "PRO";
}
