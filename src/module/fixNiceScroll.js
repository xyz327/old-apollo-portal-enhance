import { loadFeature } from "../base";

loadFeature("fixNiceScroll", false, function () {
    $(document).ready(function () {
      // 放在初始化之后执行
      setTimeout(function () {
        $("html").css("overflow", "");
      }, 200);
    });
    return true;
  });