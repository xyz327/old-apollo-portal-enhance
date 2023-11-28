import { loadFeature, onNamesacpeLoaded } from "../base";
loadFeature("stash", true, function () {
  onNamesacpeLoaded(function () {
    console.log("stash");

    $.each(
      $("section.master-panel-body.ng-scope>.panel-heading>"),
      function (idx, el) {
        var $panel = $(el);
        if ($panel.find(".stashFeature").length > 0) {
          return;
        }
        $panel.append(`<label class="stashFeature hidden"/>`)
        var namespaceName = $panel
          .find("b.namespace-name.ng-binding")
          .text()
          .trim();
        var namespaceScope = $(
          'div[ng-controller="ConfigNamespaceController"]'
        ).scope();
        var ConfigService = angular
          .injector(["application"])
          .get("ConfigService");
        var namespace = namespaceScope.namespaces.find(
          (e) => e.baseInfo.namespaceName === namespaceName
        );
        var $menu = $(el).find(".dropdown-menu");
        $menu.append('<li role="separator" class="divider"></li>');
        $(`
            <li><a href="javascript:void(0);" ><span class="glyphicon glyphicon-save"></span>暂存改动</a></li>
            `)
          .on("click", function () {
            layer.confirm("是否要暂存改动?", function (index) {
              console.log(namespaceName);
              console.log(namespace);
              console.log(ConfigService);
              var items = namespace.items.filter((item) => item.isModified);
              if (items.length === 0) {
                layer.close(index);
                layer.msg("没有改动");
                return;
              }
              localStorage.setItem(
                getStashKey(namespaceScope, namespace),
                JSON.stringify(items)
              );

              // recovery old value
              Promise.all(
                items.map((item) => {
                  var isNewValue = item.isModified && !item.oldValue;
                  var isDeleted = item.isDeleted;
                  if (isNewValue) {
                    // 新增的配置 删除
                    return ConfigService.delete_item(
                      namespace.baseInfo.appId,
                      namespaceScope.pageContext.env,
                      namespace.baseInfo.clusterName,
                      namespace.baseInfo.namespaceName,
                      item.item.id
                    );
                  }
                  if (isDeleted) {
                    // 被删除的数据 拿不到原来的 item 信息
                    // 那就 create
                    return ConfigService.create_item(
                      namespace.baseInfo.appId,
                      namespaceScope.pageContext.env,
                      namespace.baseInfo.clusterName,
                      namespace.baseInfo.namespaceName,
                      {
                        key: item.item.key,
                        value: item.oldValue,
                        tableViewOperType: "create",
                        addItemBtnDisabled: true,
                      }
                    );
                  }
                  // 更新的 key
                  return ConfigService.update_item(
                    namespace.baseInfo.appId,
                    namespaceScope.pageContext.env,
                    namespace.baseInfo.clusterName,
                    namespace.baseInfo.namespaceName,
                    $.extend(item.item, {
                      value: item.oldValue,
                      tableViewOperType: "update",
                    })
                  );
                })
              ).then(() => {
                layer.close(index);
                layer.msg("改动暂存成功!");
                // 直接 reload
                location.reload();
              });
            });
          })
          .appendTo($menu);

        $(`
            <li><a href="javascript:void(0);"><span class="glyphicon glyphicon-open"></span>恢复暂存改动</a></li>
            `)
          .on("click", function () {
            var items = JSON.parse(
              localStorage.getItem(getStashKey(namespaceScope, namespace))
            );
            if (!items || items.length === 0) {
              layer.msg("没有暂存数据");
              return;
            }
            layer.open({
              content: getUnstashTable(items),
              yes: function (index) {
                // recovery old value
                Promise.all(
                  items.map((item) => {
                    var isNewValue = item.isModified && !item.oldValue;
                    var isDeleted = item.isDeleted;
                    if (isDeleted) {
                      // 重新拿一次 itemid
                      item = namespace.items.filter(
                        (v) => v.item.key === item.item.key
                      )[0]; // 取第一个
                      // 新增的配置 删除
                      return ConfigService.delete_item(
                        namespace.baseInfo.appId,
                        namespaceScope.pageContext.env,
                        namespace.baseInfo.clusterName,
                        namespace.baseInfo.namespaceName,
                        item.item.id
                      );
                    }
                    if (isNewValue) {
                      // 被删除的数据 拿不到原来的 item 信息
                      // 那就 create
                      return ConfigService.create_item(
                        namespace.baseInfo.appId,
                        namespaceScope.pageContext.env,
                        namespace.baseInfo.clusterName,
                        namespace.baseInfo.namespaceName,
                        {
                          key: item.item.key,
                          value: item.newValue,
                          tableViewOperType: "create",
                          addItemBtnDisabled: true,
                        }
                      );
                    }
                    // 更新的 key
                    return ConfigService.update_item(
                      namespace.baseInfo.appId,
                      namespaceScope.pageContext.env,
                      namespace.baseInfo.clusterName,
                      namespace.baseInfo.namespaceName,
                      $.extend(item.item, {
                        value: item.newValue,
                        tableViewOperType: "update",
                      })
                    );
                  })
                ).then(() => {
                  layer.close(index);
                  layer.msg("恢复暂存成功!");
                  localStorage.removeItem(
                    getStashKey(namespaceScope, namespace)
                  );
                  // 直接 reload
                  location.reload();
                });
              },
            });
          })
          .appendTo($menu);
        console.log("add stash", namespaceName);
      }
    );
  });
});

function getStashKey(namespaceScope, namespace) {
  var baseInfo = namespace.baseInfo;
  return `stash_${namespaceScope.pageContext.env}_${baseInfo.appId}_${baseInfo.clusterName}_${baseInfo.namespaceName}`;
}
function getUnstashTable(changedItems) {
  var tab = "";
  for (var item of changedItems) {
    tab += `<tr>
          <td>${item.item.key}</td>
          <td data-value="${item.newValue}">
          ${
            item.newValue.length < 150
              ? item.newValue
              : item.newValue.substring(0, 150) + "..."
          }
          </td>
          <td>${item.item.comment ? item.item.comment : ""}</td>
          <td>${
            item.item.dataChangeLastModifiedTime
              ? item.item.dataChangeLastModifiedTime
              : ""
          }</td>
          </tr>`;
  }
  return `
    <table class="table table-bordered table-striped table-hover">
      <thead>
      <tr>
          <th>
              Key
          </th>
          <th>
              new Value
          </th>
          <th>
              备注
          </th>
          <th>
              最后修改时间
          </th>
          </tr>
          </thead>
          <tbody id="unstashTable">
              ${tab}
          </tbody>
          </table>`;
}
