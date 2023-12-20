import _ from "lodash";
import { loadFeature, appendNavBar, onNamesacpeLoaded } from "../base";
import { scrollTo } from "../common/scroller";

let inited = false;
loadFeature("gotoNamespace", false, () => {
  if ($("#affixPlaceholder").length == 0) {
    $("body>nav.navbar").after(
      '<div id="affixPlaceholder" style="height:60px"></div>'
    );
    $("body>nav.navbar")
      .width("100%")
      .css({ "z-index": 999, position: "fixed" });
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
  if (state.disabled) {
    return state.text;
  }
  var namespaceScope = $(
    'div[ng-controller="ConfigNamespaceController"]'
  ).scope();
  var namespace = namespaceScope.namespaces.find((namespace) => {
    return namespace.viewName === state.id;
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
  var $select = $("#namespaceSelecter");
  if ($select.length > 0) {
    return;
  }
  var namespaceScope = $(
    'div[ng-controller="ConfigNamespaceController"]'
  ).scope();
  var optionsTpl = compiled({ namespaces: namespaceScope.namespaces });
  appendNavBar(`
  <li id="goToNamespace" style="margin-top: 10px;">
  <select id="namespaceSelecter">${optionsTpl}</select>
  </li>
  `);
  $select = $("#namespaceSelecter");
  $select.on("select2:open", function (e) {
    $("#select2-namespaceSelecter-results").css({ "max-height": "600px" });
  });

  //var htmlScroll = $("html").getNiceScroll && $("html").getNiceScroll(0);
  // 修改选项时 滚动页面到对应位置
  $select.on("select2:select", function (e) {
    var namespaceId = $select.val();
    var namespaceEl = $(".namespace-name")
      .toArray()
      .find((el) => el.innerHTML == namespaceId);
    scrollTo(namespaceEl)
    //      htmlScroll && htmlScroll.doScrollTop($(namespaceEl).offset().top - 100, 1000);
  });

  // 滚动页面时同步改变 当前选择的 namespace 选项
  changeSelectedOnScroll($select);
}

function changeSelectedOnScroll($select) {
  var selectedVal;
  // 防抖
  var listener = _.debounce(function (entries) {
    if (entries.length == 0) {
      return;
    }
    var entry = entries[0];
    if (!entry.isIntersecting) {
      // 从可视区移出
      return;
    }
    var el = entry.target;
    var curNamespace = $(el).text();
    if (selectedVal != curNamespace) {
      selectedVal = curNamespace;
      $select.val(selectedVal).trigger("change");
    }
  }, 200);
  const io = new IntersectionObserver(listener, { threshold: 1.0 });

  $(".namespace-name").each((i, el) => {
    io.observe(el);
  });
}
