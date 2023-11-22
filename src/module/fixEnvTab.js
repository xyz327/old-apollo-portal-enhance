import { loadFeature,getAppId } from "../base";


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

    var $scope = $('div[ng-controller="ConfigBaseInfoController"]').scope();
    var pageContext = $scope.pageContext
    $curEnvInfo.html(`
    <span class="label label-success">${pageContext.env}</span> - <span class="label label-info">${pageContext.clusterName}</span>
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
          top: 60,
        },
      });
    }
    return true;
  });