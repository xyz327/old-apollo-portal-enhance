import { loadFeature, onNamesacpeLoaded } from "./base";

loadFeature("copyNamespace", false, function () {
  onNamesacpeLoaded(function () {
    $("header.panel-heading .header-namespace>span:first-child")
      .toArray()
      .forEach(function (el) {
        var name = el.innerText.trim();
        var $el = $(el);
        if ($el.nextAll(".copyNamespace").length != 0) {
          return;
        }
        $el.next("span").after(`
        <span data-tooltip="tooltip" title="点击复制namespace" data-copy="copy"
         data-copy-value="${name}" class="copyNamespace label label-success">复制
        <label class="glyphicon glyphicon-duplicate"></label>
        </span>
        `);
      });
  });

  return true;
});
