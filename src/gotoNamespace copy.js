import { loadFeature, appendNavBar, onNamesacpeLoaded } from "./base";

let namespaceLoaded = false;
loadFeature("gotoNamespace", true, () => {
  goToNamespace0();
  return false;
});

function goToNamespace0() {
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

  onNamesacpeLoaded().then(buildGotoNamespace);
}

function buildGotoNamespace() {
  $("#goToNamespace").remove();
  var $namespaces = $(".namespace-name");
  $namespaces.attr("data-namespace", function () {
    return this.innerHTML.replace(".", "-");
  });
  var list = "";
  var namespaceOffsets = [];
  var lastNamespaceId = "application";
  for (const namespace of $namespaces) {
    var $namespace = $(namespace);
    var namespaceVal = $namespace.text();
    var namespaceId = namespaceVal; //$namespace.text().replaceAll(".", "-");
    namespaceOffsets.push({
      top: $namespace.offset().top,
      id: lastNamespaceId,
    });
    lastNamespaceId = namespaceId;
    var changed =
      $(namespace).parent().parent().find(".modify-tip.ng-hide").length === 0;
    //$namespace.parents('header.panel-heading').after(`<a href="#${namespaceId}" id="${namespaceId}"></a>`);
    list += `<option value="${namespaceId}" ${
      changed ? 'data-change="1"' : ""
    }>${namespaceVal}</option>`;
  }

  appendNavBar(`
          <li id="goToNamespace" style="margin-top: 10px;">
          <select id="namespaceSelecter">${list}</select>
          </li>
          `);
  var $select = $("#namespaceSelecter");
  // init changed

  $select.select2({
    placeholder: "跳转到 Namespace",
    templateResult: function (state) {
      var changed = $(state.element).attr("data-change");
      if (changed) {
        return $(
          `<label>${state.text} <span class="label label-warning ">改</span></label>`
        );
      }
      return `${state.text}`;
    },
  });
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
    var offsetY = e.end.y;
    var curNamespace = namespaceOffsets.find((val) => val.top > offsetY);
    if (curNamespace && selectedVal != curNamespace.id) {
      //TODO
      selectedVal = curNamespace.id;
      $select.val(selectedVal).trigger("change");
    }
  });
  $select.on("select2:select", function (e) {
    var namespaceId = $select.val();

    var namespaceEl = $(".namespace-name")
      .toArray()
      .find((el) => el.innerHTML == namespaceId);
    triggerBySelect = true;
    htmlScroll.doScrollTop($(namespaceEl).offset().top - 100, 1000);
  });
}
