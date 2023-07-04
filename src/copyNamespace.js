import { loadFeature, onNamesacpeLoaded } from "./base";

loadFeature("copyNamespace", false, function () {
  onNamesacpeLoaded(function () {
    $("header.panel-heading .header-namespace>span:first-child")
      .toArray()
      .forEach(function (el) {
        var name = el.innerText.trim();
        $(el).next("span").after(`
        <span data-tooltip="tooltip" title="点击复制namespace" data-copy="copy"
         data-copy-value="${name}" class="label label-success">复制
        <label class="glyphicon glyphicon-duplicate"></label>
        </span>
        `);
      });
  });

  return true;
});
