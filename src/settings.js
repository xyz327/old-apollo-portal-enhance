import {
  loadFeature,
  appendNavBar,
  isFeatureDisabled,
  switchFeature,
  getAllFeaturenMap,
  featureState,
  featureTypeState,
} from "./base";
import allFeature from "./allFeature.json";

loadFeature("settings", { switch: false }, function () {
  buildSettings();
});
function buildSettings() {
  initSettingsModal();
  $('[data-toggle=switch]')
    .bootstrapSwitch({
      onText: "开启",
      offText: "关闭",
      onSwitchChange: function (event, state) {
        console.log(arguments);
        if (!state) {
          return;
        }
        var $el = $(this);
        var featureName = $el.val();
        var feature = getAllFeaturenMap()[featureName];
        if (
          feature &&
          !featureTypeState(featureName, "enabledWarn") &&
          feature.enabledWarn
        ) {
          layer.confirm(
            feature.enabledWarn,
            {
              btn: ["确定", "取消"],
            },
            function (index) {
              featureTypeState(featureName, "enabledWarn", true);
              $el.bootstrapSwitch("state", true);
              layer.close(index);
            },
            function () {}
          );
          return false;
        }
      },
    })
    .on("switchChange.bootstrapSwitch", function (event, state) {
      var featureName = $(this).val();
      switchFeature(featureName, state);
      console.log(state)
      if(!state){
        featureTypeState(featureName, "enabledWarn", false);
      }
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
            <label class="col-sm-3 control-label" for="feature-switch-${key}">${feature.name}
            <span class="glyphicon glyphicon-question-sign" data-tooltip="tooltip" title="${feature.desc}"></span>
            </label>
            <div class="col-sm-9">
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
