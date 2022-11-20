var enhanceNavId = "apollo-enhance-nav";
var featureId = "apollo-enhance-feature";
export function appendNavBar(child) {
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
})();
export function onNamesacpeLoaded(cb) {
  $("body").on("namespaceLoaded", cb);
}
loadFeature("onNamesacpeLoaded", true, function () {
  var $namespaces = $(".namespace-name");
  if ($namespaces.length == 0) {
    return false;
  }
  console.log("trigger namespaceLoaded");
  $("body").trigger("namespaceLoaded");
  const observer = new MutationObserver(function () {
    console.log("rebuild" );
    $("body").trigger("namespaceLoaded");
  });

  $.each($(".config-item-container"), (index, el) => {
    observer.observe(el, { childList: true });
  });
});
export function getAppId() {
  let hash = location.hash;
  if (hash) {
    hash = hash.substring(2);
    const url = new URL("http://localhost?" + hash);
    return url.searchParams.get("appid");
  }
}

export function loadFeature(name, reloadOnHashChange, feature) {
  loadFeature0(name, feature, false);
  if (reloadOnHashChange) {
    $(window).on("hashchange", function (e) {
      console.log("hashchange");
      loadFeature0(name, feature, true);
    });
  }
}
export function showDiffModal(key, newVal, oldVal) {
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

export function copy(content) {
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
