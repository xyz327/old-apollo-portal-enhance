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
      if (currItem && currItem.isModified) {
        showDiffModal(currItem.item.key, currItem.newValue, currItem.oldValue);
      }
    });
    // 点击查看时 选择当前的 item
    $('body').on('click', "td.cursor-pointer", function(e){
      var $target = $(e.currentTarget)
      if($target.prev('td.cursor-pointer').length == 0){
        // 说明点击的是 key  忽略
        return;
      }
      var $tr = $target.parent();
      var key = $tr.find("td:eq(1)").find('span:eq(0)').text().trim();
        var namespace = $tr
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
        console.log('show key:', namespace, key)
        currItem = namesapce.items.find((e) => e.item.key === key);
       
    })
  
});
