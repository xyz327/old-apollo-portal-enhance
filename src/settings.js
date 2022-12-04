import {
  loadFeature,
  appendNavBar,
  isFeatureDisabled,
  switchFeature,
} from "./base";
import allFeature from "./allFeature.json";

loadFeature("settings", { switch: false }, function () {
  buildSettings()
});
function buildSettings() {


  initSettingsModal();
  $('[data-toggle="switch"]')
  .bootstrapSwitch({
    onText: '开启',
    offText: '关闭'
  })
  .on('switchChange.bootstrapSwitch', function(event, state) {
    var feature = $(this).val()
    switchFeature(feature, state)
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
