// ==UserScript==
// @name         apollo-enhance
// @namespace    apollo-enhance
// @version      0.4
// @description  make old apollo better
// @homepage     https://github.com/xyz327/old-apollo-portal-enhance
// @website      https://github.com/xyz327/old-apollo-portal-enhance
// @source       https://github.com/xyz327/old-apollo-portal-enhance
// @downloadURL  https://raw.githubusercontent.com/xyz327/old-apollo-portal-enhance/main/tampermonkey-script.js
// @updateURL    https://raw.githubusercontent.com/xyz327/old-apollo-portal-enhance/main/tampermonkey-script.js
// @author       xizhouxi
// @match        *://*/config.html*
// @resource     highlight_xcode_css https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/highlight.js/9.18.5/styles/xcode.min.css
// @require      https://lf9-cdn-tos.bytecdntp.com/cdn/expire-1-M/diff_match_patch/20121119/diff_match_patch_uncompressed.js
// @require      https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/highlight.js/9.18.5/highlight.min.js
// @require      https://lf6-cdn-tos.bytecdntp.com/cdn/expire-1-M/highlight.js/9.18.5/languages/json.min.js
// @resource     text_different_css https://cdn.xyz327.cn/lib/text-different/text-different.css
// @require      https://cdn.xyz327.cn/lib/text-different/text-different.min.js
// @require      https://cdn.xyz327.cn/lib/text-different/text-different-for-html.min.js
// @noframes
// @grant      GM_getResourceText
// @grant      GM_addStyle

// ==/UserScript==

(function () {
  "use strict";
  console.log("===start");
  //var jq = $.noConflict();
  var DiffMatch = new diff_match_patch();

  $ = unsafeWindow.$;

  function getAppId() {
    let hash = location.hash;
    if (hash) {
      hash = hash.substring(2);
      const url = new URL("http://localhost?" + hash);
      return url.searchParams.get("appid");
    }
  }

  loadFeature("diff", false, function () {
    var releaseModalNode = document.querySelector("#releaseModal");
    if (releaseModalNode == null) {
      return false;
    }
    bindDiffInfo(releaseModalNode);
    return true;
  });
  loadFeature("fixNiceScroll", false, function () {
    $(document).ready(function () {
      // 放在初始化之后执行
      setTimeout(function () {
        $("html").css("overflow", "");
      }, 200);
    });
  });

  loadFeature("gotoNamespace", true, function () {
    var $namespaces = $(".namespace-name");
    if ($namespaces.length == 0) {
      return false;
    }
    goToNamespace($namespaces);
    return true;
  });

  loadFeature("fixEnvTab", false, function () {
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
    return true;
  });

  function loadFeature(name, reloadOnHashChange, feature) {
    loadFeature0(name, feature);
    if (reloadOnHashChange) {
      $(window).on("hashchange", function (e) {
        loadFeature0(name, feature);
      });
    }
  }

  function loadFeature0(name, feature) {
    try {
      var clear = setInterval(function () {
        if (feature()) {
          console.log(`loadFeature: ${name} finished`);
          clearInterval(clear);
        }
      }, 1000);
    } catch (e) {
      console.error(`load feature failed :${name}`, e.message);
    }
  }

  // ===== goToNamespace ...

  function goToNamespace($namespaces) {
    if ($("#affixPlaceholder").length == 0) {
      $("body>nav.navbar").width("100%").css({ "z-index": 999 }).affix({
        top: 0,
      });
      $("body>nav.navbar").after('<div id="affixPlaceholder"></div>');
      var $affixPlaceholder = $("#affixPlaceholder");
      $("body>nav.navbar").on("affix.bs.affix", function (event) {
        $affixPlaceholder.css("height", "50px");
      });
      $("body>nav.navbar").on("affix-top.bs.affix", function (event) {
        $affixPlaceholder.css("height", "0px");
      });
    }

    $("#goToNamespace").remove();
    var list = "";
    for (const namespace of $namespaces) {
      var $namespace = $(namespace);
      var namespaceVal = $namespace.text();
      var namespaceId = $namespace.text();
      list += `<li><a href="javascript:void(0)" class="goToNamespace" offset="${
        namespaceVal == "application" ? 100 : 100
      }" name="${namespaceId}">${namespaceVal}</a></li>`;
    }

    var $navBar = $("#bs-example-navbar-collapse-1");
    $navBar.append(`
        <ul id="goToNamespace" class="nav navbar-nav navbar-right">
        <li class="dropdown" >
        <a id="dLabel" type="button" id="namespace-jump" data-toggle="dropdown" aria-haspopup="true" role="button"  aria-expanded="false">
          跳转到 Namespace
          <span class="caret"></span>
        </a>
        <ul class="dropdown-menu" aria-labelledby="dLabel">
          ${list}
        </ul>
        </li>
        </ul>
        `);

    // $("#namespace-jump").dropdown();
    $(".goToNamespace").click(function (event) {
      var target = event.target;
      // 可能有多个
      var $namespaceNode = $(`.namespace-name:contains("${target.name}")`);
      if ($namespaceNode.length > 1) {
        for (var i = 0; i < $namespaceNode.length; i++) {
          if ($($namespaceNode[i]).html() == target.name) {
            $namespaceNode = $($namespaceNode[i]);
            break;
          }
        }
      }
      $("html,body").animate(
        {
          scrollTop: $namespaceNode.offset().top - $(target).attr("offset"),
        },
        1000
      );
    });
  }

  // =========== diff code

  function bindDiffInfo(node) {
    initDiifLib();
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

  function initDiifLib() {
    const highlight_xcode_css = GM_getResourceText("highlight_xcode_css");
    const text_different_css = GM_getResourceText("text_different_css");
    GM_addStyle(highlight_xcode_css);
    GM_addStyle(text_different_css);
    initDiffModal();
  }
  function buildDiffHtml($node, key, oldVal, newVal) {
    // 新增或删除

    var diff = DiffMatch.diff_main(oldVal, newVal);

    DiffMatch.diff_cleanupSemantic(diff);

    var html = DiffMatch.diff_prettyHtml(diff);
    $node.html(html);

    $node.on("click", function () {
      const tdfh = new TextDifferentForHtml(
        $("#diff-container")[0], // The dom used to render the display code
        "json" // Type of code
      );
      $("#diff-detail-title").html(`${key}`);
      tdfh.render({
        oldCode: toPerttyJson(oldVal), // Old code
        newCode: toPerttyJson(newVal), // New code
        hasLineNumber: false, // Whether to display the line number
      });
      $("#diffModal").modal();
    });
  }

  function toPerttyJson(val) {
    try {
      return JSON.stringify(JSON.parse(val), null, 2);
    } catch (e) {
      return val;
    }
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
                <div class="col-xs-6 text-center"><span class="label label-default">旧值</span></div>
                <div class="col-xs-6 text-center"><span class="label label-success">新值</span></div>
              </div>
              <div id="diff-container" style="display:flex"></div>
          </div>
        </div>
      </div>
    </div>
    `);
  }
  // libs
})();
