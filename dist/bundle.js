// ==UserScript==
// @name         apollo-enhance-v2
// @namespace    apollo-enhance
// @version      0.8.5
// @description  make old apollo better
// @homepage     https://github.com/xyz327/old-apollo-portal-enhance
// @website      https://github.com/xyz327/old-apollo-portal-enhance
// @source       https://github.com/xyz327/old-apollo-portal-enhance
// @downloadURL  https://raw.githubusercontent.com/xyz327/old-apollo-portal-enhance/main/tampermonkey-script.js
// @updateURL    https://raw.githubusercontent.com/xyz327/old-apollo-portal-enhance/main/tampermonkey-script.js
// @author       xizhou
// @match        *://*/config.html*
// @resource     highlight_xcode_css https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/highlight.js/9.18.5/styles/xcode.min.css
// @require      https://lf9-cdn-tos.bytecdntp.com/cdn/expire-1-M/diff_match_patch/20121119/diff_match_patch_uncompressed.js
// @require      https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/highlight.js/9.18.5/highlight.min.js
// @require      https://lf6-cdn-tos.bytecdntp.com/cdn/expire-1-M/highlight.js/9.18.5/languages/json.min.js
// @resource     text_different_css https://cdn.jsdelivr.net/npm/text-different@1.2.1/build/style/text-different.min.css
// @require      https://cdn.jsdelivr.net/combine/npm/text-different@1.2.1/build/text-different.min.js,npm/text-different@1.2.1/build/text-different-for-html.min.js
// @noframes
// @grant      GM_getResourceText
// @grant      GM_addStyle
// @grant      GM_addElement
// ==/UserScript==

(function (_) {
  'use strict';

  var enhanceNavId = "apollo-enhance-nav";
  var featureId = "apollo-enhance-feature";
  function appendNavBar(child) {
    $(`#${enhanceNavId}`).append(child);
  }
  loadFeature("nav", false, function () {
    var $navBar = $("#bs-example-navbar-collapse-1");
    $navBar.append(`
        <ul id="${enhanceNavId}" class="nav navbar-nav navbar-right">
          
        </ul>
        `);
    return true;
  });
  (function () {
    initFeatureId();
    initDiffModal();
    $("[data-copy]").on("click", function (e) {
      copy($(e.currentTarget).attr("data-copy-value")).then(function () {
        var $icon = $(e.target).parent().find(".glyphicon");
        $icon.removeClass("glyphicon-duplicate").addClass("glyphicon-ok");
        setTimeout(function () {
          $icon.addClass("glyphicon-duplicate").removeClass("glyphicon-ok");
        }, 2000);
      });
    });
    // 加载 layer  依赖 $
    GM_addElement("script", {
      src: "https://cdn.jsdelivr.net/npm/layer-src@3.5.1/src/layer.js",
      type: "text/javascript",
    });
    GM_addElement("link", {
      href: "https://cdn.jsdelivr.net/npm/bootstrap-switch@3.3.4/dist/css/bootstrap3/bootstrap-switch.min.css",
      rel: "stylesheet",
    });
    GM_addElement("script", {
      src: "https://cdn.jsdelivr.net/npm/bootstrap-switch@3.3.4/dist/js/bootstrap-switch.min.js",
      type: "text/javascript",
    });
    const highlight_xcode_css = GM_getResourceText("highlight_xcode_css");
    const text_different_css = GM_getResourceText("text_different_css");
    GM_addStyle(highlight_xcode_css);
    GM_addStyle(text_different_css);
  })();
  var onNamesacpeLoadedCbs = [];
  function onNamesacpeLoaded(cb) {
    if (typeof cb === "function") {
      onNamesacpeLoadedCbs.push(cb);
    }
    return {
      then: function (cb) {
        onNamesacpeLoadedCbs.push(cb);
      },
    };
  }
  loadFeature("onNamesacpeLoaded", true, function () {
    var $namespaces = $(".namespace-name");
    if ($namespaces.length == 0) {
      return false;
    }
    console.log("trigger namespaceLoaded");
    $("body").on("namespaceLoaded", () => {
      onNamesacpeLoadedCbs.forEach((cb) => cb());
    });
    $("body").trigger("namespaceLoaded");
    const observer = new MutationObserver(function () {
      console.log("rebuild", arguments);
      $("body").trigger("namespaceLoaded");
    });

    $.each($(".config-item-container"), (index, el) => {
      observer.observe(el, { childList: true });
    });
  });
  function getAppId() {
    let hash = location.hash;
    if (hash) {
      hash = hash.substring(2);
      const url = new URL("http://localhost?" + hash);
      return url.searchParams.get("appid");
    }
  }

  function loadFeature(name, options, feature) {
    options =
      typeof options === "object"
        ? options
        : {
            switch: true,
            reloadOnHashChange: options,
          };
    if (options.switch) {
      //  allFeature.push(name);
      if (isFeatureDisabled(name)) {
        console.log(`loadFeature: ${name} has disabled`);
        return;
      }
    }
    var reloadOnHashChange = !!options.reloadOnHashChange;
    loadFeature0(name, feature, false);
    if (reloadOnHashChange) {
      $(window).on("hashchange", function (e) {
        console.log("hashchange");
        loadFeature0(name, feature, true);
      });
    }
  }

  function isFeatureDisabled(name) {
    return !!localStorage.getItem("featureDisbaled:" + name);
  }
  function switchFeature(name, enabled) {
    if (enabled) {
      localStorage.removeItem("featureDisbaled:" + name);
    } else {
      localStorage.setItem("featureDisbaled:" + name, true);
    }
  }
  function showDiffModal(key, newVal, oldVal) {
    const tdfh = new TextDifferentForHtml(
      $("#diff-container")[0], // The dom used to render the display code
      "json" // Type of code
    );
    $("#diff-detail-title").html(`${key}`);
    $("#copyOld").attr("data-copy-value", oldVal);
    $("#copyNew").attr("data-copy-value", newVal);
    tdfh.render({
      oldCode: toPerttyJson(oldVal), // Old code
      newCode: toPerttyJson(newVal), // New code
      hasLineNumber: false, // Whether to display the line number
    });
    $("#diffModal").modal();
  }

  function copy(content) {
    return new Promise(function (res, rej) {
      let copy = function (e) {
        try {
          e.preventDefault();
          e.clipboardData.setData("text/plain", content);
          document.removeEventListener("copy", copy);
          console.log("copy value:", content);
          res();
        } catch (e) {
          rej();
        }
      };
      document.addEventListener("copy", copy);
      document.execCommand("Copy");
    });
  }
  function toPerttyJson(val) {
    try {
      return JSON.stringify(JSON.parse(val), null, 2);
    } catch (e) {
      return val;
    }
  }

  function loadFeature0(name, feature, isReloadByHash) {
    try {
      if ($("#feature-" + name).length !== 0) {
        // 已经加载过了
        console.log(`loadFeature: ${name} has loaded`);
        return;
      }
      var clear = setInterval(function () {
        if (feature(isReloadByHash) !== false) {
          console.log(`loadFeature: ${name} finished`);
          $(`${"#" + featureId}`).append(`<div id="feature-${name}"></div>`);
          clearInterval(clear);
        }
      }, 1000);
    } catch (e) {
      console.error(`load feature failed :${name}`, e.message);
    }
  }

  function initFeatureId() {
    $("body").prepend(`<div id="${featureId}" class="hidden"></div>`);
  }

  function initDiffModal() {
    $("body").append(`
      <!-- Modal -->
      <div class="modal fade" id="diffModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
        <div class="modal-dialog modal-lg" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
              <h4 class="modal-title"><span class="text-danger" id="diff-detail-title"></span> 差异对比</h4>
            </div>
            <div class="modal-body" >
                <div class="row">
                  <div class="col-xs-6 text-center">
                    <span data-tooltip="tooltip" title="点击复制" id="copyOld" data-copy="copy" data-copy-value=""  class="label label-default">旧值 
                    <label class="glyphicon glyphicon-duplicate"></label>
                    </span>
                  </div>
                  <div class="col-xs-6 text-center">
                    <span data-tooltip="tooltip" title="点击复制" id="copyNew" data-copy="copy" data-copy-value="" class="label label-success">新值
                    <label class="glyphicon glyphicon-duplicate"></label>
                    </span>
                  </div>
                </div>
                <div id="diff-container" style="display:flex"></div>
            </div>
          </div>
        </div>
      </div>
      `);
  }

  loadFeature("fixNiceScroll", false, function () {
      $(document).ready(function () {
        // 放在初始化之后执行
        setTimeout(function () {
          $("html").css("overflow", "");
        }, 200);
      });
      return true;
    });

  loadFeature("fixEnvTab", true, function (isReloadByHash) {
      var $tab = $(".J_appFound");
      if ($tab.length == 0) {
        return false;
      }
      const infoVal = sessionStorage[getAppId()];
      const infoObj = JSON.parse(infoVal);
      const cluster = infoObj.cluster;
      const env = infoObj.env;
      var $panelHeader = $tab.find(".panel-heading:first");
      var $curEnvInfo = $panelHeader.find("#curEnvInfo");
      if ($curEnvInfo.length == 0) {
        $tab.find(".panel-heading>span").after(`
          <button type="button" class="slideBtn btn btn-primary btn-xs">(点击展开/收缩)</button>
      `);
        $panelHeader.append(`<div id="curEnvInfo"></div>`);
        $curEnvInfo = $panelHeader.find("#curEnvInfo");
      }
      $curEnvInfo.html(`
    <span class="label label-success">${env}</span> - <span class="label label-info">${cluster}</span>
    `);
      if (!isReloadByHash) {
        // 不是通过 hash change reload 的才需要绑定事件
        $tab.find(".panel-heading .slideBtn").on("click", function (e) {
          const $header = $(e.target).parent(".panel-heading");
          $header.next("div").slideToggle("normal", function () {});
        });

        $tab = $tab.parent();
        $tab.on("affixed.bs.affix", function (e) {
          $tab.css({ position: "fixed" });
          $tab
            .find(".panel-heading")
            .next("div")
            .slideUp("normal", function () {});
        });
        $tab.on("affixed-top.bs.affix	", function (e) {
          $tab.css({ position: "" });
          $tab
            .find(".panel-heading")
            .next("div")
            .slideDown("normal", function () {});
        });
        $tab.affix({
          offset: {
            top: 50,
          },
        });
      }
      return true;
    });

  loadFeature("disableScrollOnModal", false, function () {
    var openModalCnt = 0;
    var htmlScroller = $("html").getNiceScroll(0);
    $("body")
      .on("shown.bs.modal", function () {
        openModalCnt++;
        $("html").css("overflow", "hidden");
        htmlScroller.hide();
      })
      .on("hidden.bs.modal", function () {
        openModalCnt--;
        if (openModalCnt <= 0) {
          $("html").css("overflow", "");
          htmlScroller.show();
        }
      });
    $("body").on("scroll", ".modal.in", function () {
      return false;
    });
    return true;
  });

  let inited = false;
  loadFeature("gotoNamespace", false, () => {
    if ($("#affixPlaceholder").length == 0) {
      $("body>nav.navbar").after('<div id="affixPlaceholder"></div>');
      $("body>nav.navbar").width("100%").css({ "z-index": 999 }).affix({
        top: 0,
      });
      var $affixPlaceholder = $("#affixPlaceholder");
      $("body>nav.navbar").on("affix.bs.affix", function (event) {
        $affixPlaceholder.css("height", "50px");
      });
      $("body>nav.navbar").on("affix-top.bs.affix", function (event) {
        $affixPlaceholder.css("height", "0px");
      });
    }
    goToNamespace0();
    return true;
  });

  function goToNamespace0() {
    onNamesacpeLoaded().then(() => {
      if (!inited) {
        buildGotoNamespace();
        inited = true;
      }
      refreshGogoNamespace();
    });
  }

  function refreshGogoNamespace() {
    var $select = $("#namespaceSelecter");
    if ($select.hasClass("select2-hidden-accessible")) {
      // Select2 has been initialized
      $select.select2("destroy");
    }

    // init
    $select.select2({
      placeholder: "跳转到 Namespace",
      templateResult: formatOptions,
      templateSelection: formatOptions,
    });
  }
  function formatOptions(state) {
    if(state.disabled){
      return state.text;
    }
    var namespaceScope = $(
      'div[ng-controller="ConfigNamespaceController"]'
    ).scope();
    var namespace = namespaceScope.namespaces.find((namespace) => {
      return namespace.viewName === state.id
    });
    if (namespace.itemModifiedCnt > 0) {
      return $(
        `<label>${state.text} <span class="label label-warning ">改</span></label>`
      );
    }
    return state.text;
  }

  var compiled = _.template(`<% _.forEach(namespaces, function(namespace) { %>
  <option value="<%- namespace.viewName%>"><%- namespace.viewName %></option><% 
   }); 
  %>`);
  function buildGotoNamespace() {
    var namespaceScope = $(
      'div[ng-controller="ConfigNamespaceController"]'
    ).scope();
    var optionsTpl = compiled({ namespaces:namespaceScope.namespaces });
    appendNavBar(`
  <li id="goToNamespace" style="margin-top: 10px;">
  <select id="namespaceSelecter">${optionsTpl}</select>
  </li>
  `);
    var $select = $("#namespaceSelecter");
    $select.on("select2:open", function (e) {
      $("#select2-namespaceSelecter-results").css({ "max-height": "600px" });
    });
    var triggerBySelect = false;
    var htmlScroll = $("html").getNiceScroll(0);
    htmlScroll.scrollend(function (e) {
      if (triggerBySelect) {
        triggerBySelect = false;
        return;
      }
      //TODO 滚动页面时 自动定位 select 的选项
      // var offsetY = e.end.y;
      // var curNamespace = namespaceOffsets.find((val) => val.top > offsetY);
      // if (curNamespace && selectedVal != curNamespace.id) {
      //   //TODO
      //   selectedVal = curNamespace.id;
      //   $select.val(selectedVal).trigger("change");
      // }
    });
    $select.on("select2:select", function (e) {
      var namespaceId = $select.val();
      console.log("select2:select", e, namespaceId);
      var namespaceEl = $(".namespace-name")
        .toArray()
        .find((el) => el.innerHTML == namespaceId);
      triggerBySelect = true;
      htmlScroll.doScrollTop($(namespaceEl).offset().top - 100, 1000);
    });
  }

  var DiffMatch = new diff_match_patch();

  loadFeature("releaseDiff", false, function () {
    var releaseModalNode = document.querySelector("#releaseModal");
    if (releaseModalNode == null) {
      return false;
    }
    bindDiffInfo(releaseModalNode);
    return true;
  });

  function bindDiffInfo(node) {
    var observer = new MutationObserver(function () {
      initChangeInfoHeader();
      // 每次都需要隐藏
      initChangeInfoDetail();
      var $cols = $("#releaseModal table tr.ng-scope");

      var kvInfo = {};
      for (const col of $cols) {
        var $col = $(col);
        var tds = $(col).find("td");
        kvInfo = {
          key: tds[0].title,
          oldVal: tds[1].title,
          newVal: tds[2].title,
        };

        buildDiffHtml(
          $col.find("td.diff-text"),
          kvInfo.key,
          kvInfo.oldVal,
          kvInfo.newVal
        );
      }
    });
    observer.observe(node, {
      attributeFilter: ["style"],
    });
  }

  function toggleDiff() {
    $(".change-diff").toggle();
    var needShow = $(".change-diff").is(":hidden");
    if (needShow) {
      $(".change-detail").show();
    } else {
      $(".change-detail").hide();
    }
  }
  function initChangeInfoDetail() {
    $(".change-detail").hide();
    var $cols = $("#releaseModal table tr.ng-scope");
    for (var col of $cols) {
      var $col = $(col);
      if ($col.hasClass("diff-info-inited")) {
        return;
      }
      initChageCol();
      $col.addClass("diff-info-inited");
    }
  }
  function initChageCol() {
    var bodyRows = $("#releaseModal table tr.ng-scope");
    for (var row of bodyRows) {
      var $row = $(row);
      if ($row.find("td.change-diff").length == 0) {
        $row.find("td:gt(0)").addClass("change-detail x-detail").hide();
        $row.append(
          '<td class="change-diff diff-text" data-toggle="tooltip" data-placement="top" title="点击查看详细差异对比"></td>'
        );
      }
    }
    $(".change-diff.diff-text").tooltip();
  }
  function initChangeInfoHeader() {
    if ($("#releaseModal table thead tr>th").length == 0) {
      return;
    }
    if ($("#toggleDiff").length != 0) {
      return;
    }
    // 隐藏原有信息
    $("#releaseModal table thead tr>th:gt(0)").addClass("change-detail").hide();
    // 增加差异信息展示
    var headCol = $("#releaseModal table thead tr");
    headCol.append('<th class="change-diff">差异(点击查看新旧值对比)</th>');
    $("#releaseModal table thead tr>th:eq(0)").append(
      '<button id="toggleDiff">切换显示</button>'
    );
    $("#toggleDiff").click(function () {
      toggleDiff();
      return false;
    });
  }

  function buildDiffHtml($node, key, oldVal, newVal) {
    // 新增或删除

    var diff = DiffMatch.diff_main(oldVal, newVal);

    DiffMatch.diff_cleanupSemantic(diff);

    var html = DiffMatch.diff_prettyHtml(diff);
    $node.html(html);
    var errorJson = isErrorJson(newVal);
    if (errorJson) {
      var $td = $node.parent().find("td:first");
      var errorJsonLabelId = `${key}-errorJson`;
      if ($(`#${errorJsonLabelId}`).length == 0) {
        $td.append(
          `<span id="${errorJsonLabelId}" class="label label-danger">错误的json</span>`
        );
        $td.addClass("alert alert-danger");
      }
    }
    $node.on("click", function () {
      showDiffModal(key, newVal, oldVal);
    });
  }

  function isErrorJson(val) {
    val = val.trim();
    if (val.startsWith("{") || val.startsWith("[")) {
      try {
        JSON.parse(val);
        return false;
      } catch (e) {
        return true;
      }
    }
    return false;
  }

  loadFeature("releaseModal", true, function () {
      $('#releaseModal div.modal-header .modal-title:not(".ng-hide")')
      .append(`<span id="goReleaseMoadlBottom" class="glyphicon glyphicon-circle-arrow-down" data-tooltip="tooltip" data-placement="top" title="定位到发布按钮"></span>`);

      $('#releaseModal div.modal-footer')
      .prepend(`
    <span id="goReleaseMoadlTop" class="pull-left glyphicon glyphicon-circle-arrow-up" data-tooltip="tooltip" data-placement="top" title="回到顶部"></span>`);

      // for scroll
      var nicesocre = $('#releaseModal').niceScroll({cursoropacitymax: 0});
      $('#goReleaseMoadlBottom').on('click',function(){
          nicesocre.doScrollTop($('#goReleaseMoadlTop').offset().top, 1000);
      });
     
      $('#goReleaseMoadlTop').on('click',function(){
          nicesocre.doScrollTop($('#goReleaseMoadlBottom').offset().top, 1000);
      });
      return true;
  });

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
          showDiffModal(currItem.item.key, currItem.newValue, currItem.oldValue);
        }
      });
      // 点击查看时 选择当前的 item
      $('body').on('click', "td.cursor-pointer", function(e){
        var $tr = $(e.currentTarget).parent();
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
          console.log('show key:', namespace, key);
          currItem = namesapce.items.find((e) => e.item.key === key);
         
      });
    
  });

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
          $panel.append(`<label class="stashFeature hidden"/>`);
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

  var allFeature = [
  	{
  		name: "disableScrollOnModal",
  		desc: ""
  	},
  	{
  		name: "fixEnvTab",
  		desc: ""
  	},
  	{
  		name: "fixNiceScroll",
  		desc: ""
  	},
  	{
  		name: "gotoNamespace",
  		desc: ""
  	},
  	{
  		name: "releaseDiff",
  		desc: ""
  	},
  	{
  		name: "releaseModal",
  		desc: ""
  	},
  	{
  		name: "showText",
  		desc: ""
  	},
  	{
  		name: "stash",
  		desc: ""
  	},
  	{
  		name: "prodWarn",
  		desc: ""
  	}
  ];

  loadFeature("settings", { switch: false }, function () {
    buildSettings();
  });
  function buildSettings() {


    initSettingsModal();
    $('[data-toggle="switch"]')
    .bootstrapSwitch({
      onText: '开启',
      offText: '关闭'
    })
    .on('switchChange.bootstrapSwitch', function(event, state) {
      var feature = $(this).val();
      switchFeature(feature, state);
    });

    appendNavBar(`
  <li>
  <a href="javascript:void(0);" id="showSettings">
  <span class="glyphicon glyphicon-cog"></span>
  </a>
  </li>
  `);
    $("#showSettings").on("click", showSettings);
  }

  function showSettings() {
    $("#settingsModal").modal();
  }

  function initSettingsModal() {
    var tpl = "";
    allFeature.forEach((feature) => {
      var key = feature.name.replace(".", "-");
      var checked = isFeatureDisabled(feature.name) ? "" : "checked";
      tpl += `
        <div class="form-group">
            <label class="col-sm-2 control-label" for="feature-switch-${key}">${feature.name}</label>
            <div class="col-sm-10">
            <input type="checkbox" data-toggle="switch" value="${feature.name}" id="feature-switch-${key}" ${checked}/>
            </div>
        </div>    
        `;
    });
    $("body").append(`
        <!-- Modal -->
        <div class="modal fade" id="settingsModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
          <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                <h4 class="modal-title"><span class="text-danger" id="diff-detail-title"></span> 设置 (修改后刷新生效)</h4>
              </div>
              <div class="modal-body" >
              <form class="form-horizontal">
              ${tpl}
              </form>
              </div>
            </div>
          </div>
        </div>
        `);
  }

  loadFeature("main", { switch: false }, function () {
    $("body").trigger("featureLoaded");
    console.log("trigger featureLoaded");
  });

})(_);
