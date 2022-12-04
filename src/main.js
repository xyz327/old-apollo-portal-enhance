import { loadFeature } from "./base";
import "./fixNiceScroll";
import "./fixEnvTab";
import "./disableScrollOnModal";
import "./gotoNamespace";
import "./releaseDiff";
import "./releaseModal";
import "./showText";

import "./stash";
import "./help";
import "./prodWarn";
import "./settings";

loadFeature("main", { switch: false }, function () {
  $("body").trigger("featureLoaded");
  console.log("trigger featureLoaded");
});
