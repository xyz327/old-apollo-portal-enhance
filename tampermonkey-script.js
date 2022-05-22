// ==UserScript==
// @name         apollo-enhance
// @namespace    apollo-enhance
// @version      0.1
// @description  make old apollo better 
// @homepage     http://git.kugou.net/xizhouxi/apollo-enhance
// @downloadURL  http://git.kugou.net/xizhouxi/apollo-enhance/raw/master/tampermonkey-script.js
// @author       xizhouxi
// @include      *://fxapollo.kugou.net/*
// @include      *://apollo.fxsandbox.kugou.net/*
// @include      *://apollo.kw.kugou.net/*
// @require      https://lf9-cdn-tos.bytecdntp.com/cdn/expire-1-M/diff_match_patch/20121119/diff_match_patch_uncompressed.js
// @noframes

// ==/UserScript==

(function () {
    "use strict";
    console.log("===start");
    //var jq = jQuery.noConflict();
    var DiffMatch = new diff_match_patch();
    var $, jQuery;
    var clear = setInterval(function () {
      if (!window.unsafeWindow || window.unsafeWindow.appUtil === undefined) {
        console.log("========= page load unfinshed");
        return;
      }
      var releaseModalNode = document.querySelector("#releaseModal");
      if (releaseModalNode == null) {
        return;
      }
      $ = jQuery = unsafeWindow.$;
      console.log("========= page load finshed");
      loadFeature("diff", function () {
        bindDiffInfo(releaseModalNode);
      });
      loadFeature("gotoNamespace", function () {
        enabledGotoNamespace();
      });
  
      clearInterval(clear);
    }, 1000);
  
    function loadFeature(name, feature) {
      try {
        feature();
      } catch (e) {
        console.error(`load feature failed :${name}`, e.message);
      }
    }
    function enabledGotoNamespace() {
      var clear = setInterval(function () {
        var $namespaces = jQuery(".namespace-name");
        if ($namespaces.length == 0) {
          return;
        }
        goToNamespace($namespaces);
        clearInterval(clear);
      }, 1000);
    }
  
    function bindDiffInfo(node) {
  
      var observer = new MutationObserver(function () {
        initChangeInfoHeader();
        // 每次都需要隐藏
        initChangeInfoDetail();
        var $cols = jQuery("#releaseModal table tr.ng-scope");
  
        var kvInfo = {};
        for (const col of $cols) {
          var $col = jQuery(col);
          var tds = jQuery(col).find("td");
          kvInfo = {
            key: tds[0].title,
            oldVal: tds[1].title,
            newVal: tds[2].title,
          };
          $col
            .find("td.diff-text")
            .html(getDiffHtml(kvInfo.oldVal, kvInfo.newVal));
        }
      });
      observer.observe(node, {
        attributeFilter: ["style"],
      });
      console.log("========= diff info bind finished");
    }
  
    function toggleDiff() {
      jQuery(".change-diff").toggle();
      jQuery(".change-detail").toggle();
    }
    function initChangeInfoDetail() {
      jQuery(".change-detail").hide();
      var $cols = jQuery("#releaseModal table tr.ng-scope");
      for (var col of $cols) {
        var $col = jQuery(col);
        if ($col.hasClass("diff-info-inited")) {
          return;
        }
        initChageCol();
        $col.addClass("diff-info-inited");
      }
    }
    function initChageCol() {
      var bodyRows = jQuery("#releaseModal table tr.ng-scope");
      for (var row of bodyRows) {
        var $row = jQuery(row);
        if ($row.find("td.change-diff").length == 0) {
          $row.find("td:gt(0)").addClass("change-detail x-detail").hide();
          $row.append('<td class="change-diff diff-text"></td>');
        }
      }
    }
    function initChangeInfoHeader() {
      if (jQuery("#releaseModal table thead tr>th").length == 0) {
        return;
      }
      if (jQuery("#toggleDiff").length != 0) {
        return;
      }
      // 隐藏原有信息
      jQuery("#releaseModal table thead tr>th:gt(0)")
        .addClass("change-detail")
        .hide();
      // 增加差异信息展示
      var headCol = jQuery("#releaseModal table thead tr");
      headCol.append('<th class="change-diff">差异</th>');
      jQuery("#releaseModal table thead tr>th:eq(0)").append(
        '<button id="toggleDiff">切换显示</button>'
      );
      jQuery("#toggleDiff").click(function () {
        toggleDiff();
        return false;
      });
      console.log("========= init diff info finished");
    }
  
    function getDiffHtml(oldVal, newVal) {
      var diff = DiffMatch.diff_main(oldVal, newVal);
  
      DiffMatch.diff_cleanupSemantic(diff);
  
      var html = DiffMatch.diff_prettyHtml(diff);
      return html;
    }
    //=============
  
    function goToNamespace($namespaces) {
      if (jQuery("#namespace-jump").length > 0) {
        return;
      }
      $("body>nav.navbar")
      .width("100%")
      .css({ "z-index": 999 }).affix({
        top: 0,
      });
      $("body>nav.navbar").after('<div id="affixPlaceholder"></div>')
      var $affixPlaceholder = $('#affixPlaceholder')
      $("body>nav.navbar").on('affix.bs.affix', function(event){
        $affixPlaceholder.css('height', '50px')
      })
      $("body>nav.navbar").on('affix-top.bs.affix', function(event){
        $affixPlaceholder.css('height', '0px')
      })

      var list = "";
      for (const namespace of $namespaces) {
        var $namespace = jQuery(namespace);
        var namespaceVal = $namespace.text();
        var namespaceId = $namespace.text().replaceAll(".", "-");
        $namespace.append(`<span id="${namespaceId}"></span>`);
        list += `<li><a href="javascript:void(0)" class="goToNamespace" offset="${
          namespaceVal == "application" ? 100 : 10
        }" name="${namespaceId}">${namespaceVal}</a></li>`;
      }
      var $navBar = jQuery("#bs-example-navbar-collapse-1");
      $navBar.append(`
        <ul class="nav navbar-nav navbar-right">
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
      console.log("goto namespace init finished");
      // jQuery("#namespace-jump").dropdown();
      jQuery(".goToNamespace").click(function (event) {
        var target = event.target;
        $("html,body").animate(
          {
            scrollTop:
              jQuery("#" + target.name).offset().top - $(target).attr("offset"),
          },
          1000
        );
      });
    }
  
    // Your code here...
  
    // libs
  })();
  