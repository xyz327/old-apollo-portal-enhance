

import { loadFeature, BASE_INFO } from "./base";
import './module/copyNamespace.js'
import './module/fixEnvTab.js'
import './module/fixNiceScroll.js'
import './module/gotoNamespace.js'
import './module/help.js'
import './module/prodWarnDisabled.js'
import './module/releaseDiff.js'
import './module/releaseModal.js'
import './module/settings.js'
import './module/showText.js'
import './module/stash.js'
import './module/valueCodeEditor.js'
BASE_INFO.version = "0.9.13";
loadFeature("main", { switch: false }, function () {
  $("body").trigger("featureLoaded");
  console.log("trigger featureLoaded  v:", BASE_INFO);
});
