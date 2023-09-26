import { loadFeature } from "./base";

loadFeature("releaseModal", true, function () {
  if ($("#goReleaseMoadlBottom").length == 0) {
    $('#releaseModal div.modal-header .modal-title:not(".ng-hide")').append(
      `<span id="goReleaseMoadlBottom" class="glyphicon glyphicon-circle-arrow-down" data-tooltip="tooltip" data-placement="top" title="定位到发布按钮"></span>`
    );
    $("#goReleaseMoadlBottom").affix({
      offset: {
        top: 10,
      },
    });
  }
  if ($("#goReleaseMoadlTop").length == 0) {
    $("#releaseModal div.modal-footer").prepend(`
    <span id="goReleaseMoadlTop" class="pull-left glyphicon glyphicon-circle-arrow-up" data-tooltip="tooltip" data-placement="top" title="回到顶部"></span>`);
    $("#goReleaseMoadlTop").affix({
      offset: {
        bottom: 10,
      },
    });
  }
  // for scroll
  if ($().niceScroll) {
    var nicesocre = $("#releaseModal").niceScroll({ cursoropacitymax: 0 });
    $("#goReleaseMoadlBottom").on("click", function () {
      nicesocre.doScrollTop($("#goReleaseMoadlTop").offset().top, 1000);
    });

    $("#goReleaseMoadlTop").on("click", function () {
      nicesocre.doScrollTop($("#goReleaseMoadlBottom").offset().top, 1000);
    });
  }
  return true;
});
