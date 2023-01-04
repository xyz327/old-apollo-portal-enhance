import { loadFeature } from "./base";

loadFeature("disableScrollOnModal", false, function () {
  var openModalCnt = 0;
  var htmlScroller = $("html").getNiceScroll(0);
  $("body")
    .on("shown.bs.modal", function () {
      openModalCnt++;
      //$("html").css("overflow", "hidden");
      $("body").css("overflow", "hidden");
      htmlScroller.hide();
    })
    .on("hidden.bs.modal", function () {
      openModalCnt--;
      if (openModalCnt <= 0) {
        //$("html").css("overflow", "");
        $("body").css("overflow", "");
        htmlScroller.show();
      }
    });
  return true;
});
