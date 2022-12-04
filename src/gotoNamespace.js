import _ from "lodash";
import { loadFeature, appendNavBar, onNamesacpeLoaded } from "./base";

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

  var selectedVal;
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
