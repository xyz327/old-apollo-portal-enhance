import { loadFeature } from "../base";

loadFeature("fixNiceScroll", false, function () {
    $(document).ready(function () {
      let _niceScroll = $().niceScroll
      $.prototype.niceScroll = function(){
        
      }
      // 放在初始化之后执行
      setTimeout(function () {
        $("html").css("overflow", "");
        var htmlScroll = $("html").getNiceScroll && $("html").getNiceScroll(0);
        htmlScroll && htmlScroll.remove()
      }, 200);
    });
    return true;
  });