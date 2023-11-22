import { loadFeature } from "./base";
{{allModuleImport}}
loadFeature("main", { switch: false }, function () {
  $("body").trigger("featureLoaded");
  console.log("trigger featureLoaded");
});
