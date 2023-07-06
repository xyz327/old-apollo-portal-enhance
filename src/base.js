var enhanceNavId = "apollo-enhance-nav";
var featureId = "apollo-enhance-feature";
import allFeature from "./allFeature.json";
var allFeatureMap = {};
allFeature.forEach((feature) => {
  allFeatureMap[feature.name] = feature;
});
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
  // 绑定复制事件
  $(document).on("click", "[data-copy]", function (e) {
    copy($(e.currentTarget).attr("data-copy-value")).then(function () {
      var $icon = $(e.target).parent().find(".glyphicon");
      $icon.removeClass("glyphicon-duplicate").addClass("glyphicon-ok");
      setTimeout(function () {
        $icon.addClass("glyphicon-duplicate").removeClass("glyphicon-ok");
      }, 2000);
    });
  });
  // 加载 layer  因为依赖 $ 所以在代码里面进行加载
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

export function getAllFeaturenMap() {
  return allFeatureMap;
}
var onNamesacpeLoadedCbs = [];
var firsetNamespaceLoaded = false;
export function onNamesacpeLoaded(cb) {
  if (typeof cb === "function") {
    onNamesacpeLoadedCbs.push(cb);
  }
  return {
    then: function (cb) {
      if (firsetNamespaceLoaded) {
        cb();
      }
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
  firsetNamespaceLoaded = true;
});
export function getAppId() {
  let hash = location.hash;
  if (hash) {
    hash = hash.substring(2);
    const url = new URL("http://localhost?" + hash);
    return url.searchParams.get("appid");
  }
}

export function loadFeature(name, options, feature) {
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

export function isFeatureDisabled(name) {
  var state = featureState(name);
  if (state === true) {
    // 明确设置过为启用
    return false;
  }
  if (state === false) {
    // 明确设置过为不启用
    return true;
  }
  // 默认开关
  if (allFeatureMap[name] && !allFeatureMap[name].defaultEnabled) {
    console.log(`loadFeature: ${name} has disabled by deafult`);
    return true;
  }
  return false;
}
export function featureState(name, state) {
  return featureTypeState(name, null, state);
}
export function featureTypeState(name, subtype, state) {
  var feature = subtype ? name + "-" + subtype : name;
  var stateMap = JSON.parse(localStorage.getItem("featureState")) || {};
  if (state == undefined) {
    // get
    return stateMap[feature];
  }
  //set
  stateMap[feature] = state;
  localStorage.setItem("featureState", JSON.stringify(stateMap));
}
export function switchFeature(name, enabled) {
  featureState(name, enabled);
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
    if (!isReloadByHash && $("#feature-" + name).length !== 0) {
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
function initDiffModal() {
  $("body").append(`
      <!-- Modal -->
      <div class="modal" id="diffModal" tabindex="-1" role="dialog" aria-labelledby="diffModal">
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
