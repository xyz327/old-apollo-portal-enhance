import { loadFeature } from "./base";

loadFeature("disableScrollOnModal", false, function () {
  var openModalCnt = 0;
  var htmlScroller = $("html").getNiceScroll(0);
  $("body")
    .on("shown.bs.modal", function () {
      openModalCnt++;
      $("html").css("overflow", "hidden");
      htmlScroller.hide();
    })
    .on("hidden.bs.modal", function () {
      openModalCnt--;
      if (openModalCnt <= 0) {
        $("html").css("overflow", "");
        htmlScroller.show();
      }
    });
  $("body").on("scroll", ".modal.in", function () {
    return false;
  });
  return true;
});
