import { loadFeature, showDiffModal } from "./base";

loadFeature("showText", true, function () {
  var $namespaces = $(".namespace-view-table");
  if ($namespaces.length == 0) {
    return false;
  }
  var currItem;
  $("#showTextModal .modal-body")
    .tooltip({
      title: "点击查看差异对比",
    })
    .on("click", function () {
      if (!currItem) {
        return;
      }
      if (currItem.isModified) {
        console.log(currItem);
        showDiffModal(currItem.item.key, currItem.newValue, currItem.oldValue);
      }
    });
  $(".namespace-view-table div.ng-scope:not(.no-config-panel)")
    .filter(function (idx) {
      currItem = null;
      var $el = $(this);
      if ($el.hasClass("panel")) {
        // 关联 namespace 的覆盖配置
        return true;
      }
      var ngIf = $el.attr("ng-if");
      if (ngIf === "!namespace.isLinkedNamespace") {
        // 私有 namespace 的配置
        return true;
      }
      // 关联 namespace 的配置
      return false;
    })
    .find("tbody>tr")
    .find("td:eq(2)")
    .filter(".cursor-pointer")
    .on("click", function (e) {
      var $td = $(e.currentTarget);
      var key = $td.prev("td").find('span:eq(0)').text().trim();
      var namespace = $td
        .parents("section.master-panel-body.ng-scope")
        .find("b.namespace-name.ng-binding")
        .text()
        .trim();
      var namespaceScope = $(
        'div[ng-controller="ConfigNamespaceController"]'
      ).scope();
      var namesapce = namespaceScope.namespaces.find(
        (e) => e.baseInfo.namespaceName === namespace
      );
      currItem = namesapce.items.find((e) => e.item.key === key);
    });
});
