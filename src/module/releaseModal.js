import { loadFeature } from "../base";
import { scrollTo } from "../common/scroller";

loadFeature("releaseModal", true, function () {
  if ($("#goReleaseMoadlBottom").length == 0) {
    $('#releaseModal div.modal-header .modal-title:not(".ng-hide")').append(
      `<span id="goReleaseMoadlBottom" class="glyphicon glyphicon-circle-arrow-down" data-tooltip="tooltip" data-placement="top" title="定位到发布按钮"></span>`
    );
  }
  if ($("#goReleaseMoadlTop").length == 0) {
    $("#releaseModal div.modal-footer").prepend(`
    <span id="goReleaseMoadlTop" class="pull-left glyphicon glyphicon-circle-arrow-up" data-tooltip="tooltip" data-placement="top" title="回到顶部"></span>`);
  }
  // for scroll
  $("#goReleaseMoadlBottom").on("click", function () {
    scrollTo($("#goReleaseMoadlTop"))
  });

  $("#goReleaseMoadlTop").on("click", function () {
    scrollTo($("#goReleaseMoadlBottom"))
  });
  return true;
});
