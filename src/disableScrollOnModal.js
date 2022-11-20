import { loadFeature } from "./base";

loadFeature("disableScrollOnModal", false, function () {
    $("body")
      .on("show.bs.modal", function () {
        $("html").css("overflow", "hidden");
      })
      .on("hide.bs.modal", function () {
        $("html").css("overflow", "");
      });
    return true;
  });