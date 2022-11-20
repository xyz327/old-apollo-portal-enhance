import { loadFeature,showDiffModal } from "./base";

var DiffMatch = new diff_match_patch();

loadFeature("releaseDiff", false, function () {
  var releaseModalNode = document.querySelector("#releaseModal");
  if (releaseModalNode == null) {
    return false;
  }
  bindDiffInfo(releaseModalNode);
  return true;
});

function bindDiffInfo(node) {
  initDiifLib();
  var observer = new MutationObserver(function () {
    initChangeInfoHeader();
    // 每次都需要隐藏
    initChangeInfoDetail();
    var $cols = $("#releaseModal table tr.ng-scope");

    var kvInfo = {};
    for (const col of $cols) {
      var $col = $(col);
      var tds = $(col).find("td");
      kvInfo = {
        key: tds[0].title,
        oldVal: tds[1].title,
        newVal: tds[2].title,
      };

      buildDiffHtml(
        $col.find("td.diff-text"),
        kvInfo.key,
        kvInfo.oldVal,
        kvInfo.newVal
      );
    }
  });
  observer.observe(node, {
    attributeFilter: ["style"],
  });
}

function toggleDiff() {
  $(".change-diff").toggle();
  var needShow = $(".change-diff").is(":hidden");
  if (needShow) {
    $(".change-detail").show();
  } else {
    $(".change-detail").hide();
  }
}
function initChangeInfoDetail() {
  $(".change-detail").hide();
  var $cols = $("#releaseModal table tr.ng-scope");
  for (var col of $cols) {
    var $col = $(col);
    if ($col.hasClass("diff-info-inited")) {
      return;
    }
    initChageCol();
    $col.addClass("diff-info-inited");
  }
}
function initChageCol() {
  var bodyRows = $("#releaseModal table tr.ng-scope");
  for (var row of bodyRows) {
    var $row = $(row);
    if ($row.find("td.change-diff").length == 0) {
      $row.find("td:gt(0)").addClass("change-detail x-detail").hide();
      $row.append(
        '<td class="change-diff diff-text" data-toggle="tooltip" data-placement="top" title="点击查看详细差异对比"></td>'
      );
    }
  }
  $(".change-diff.diff-text").tooltip();
}
function initChangeInfoHeader() {
  if ($("#releaseModal table thead tr>th").length == 0) {
    return;
  }
  if ($("#toggleDiff").length != 0) {
    return;
  }
  // 隐藏原有信息
  $("#releaseModal table thead tr>th:gt(0)").addClass("change-detail").hide();
  // 增加差异信息展示
  var headCol = $("#releaseModal table thead tr");
  headCol.append('<th class="change-diff">差异(点击查看新旧值对比)</th>');
  $("#releaseModal table thead tr>th:eq(0)").append(
    '<button id="toggleDiff">切换显示</button>'
  );
  $("#toggleDiff").click(function () {
    toggleDiff();
    return false;
  });
}

function initDiifLib() {
  const highlight_xcode_css = GM_getResourceText("highlight_xcode_css");
  const text_different_css = GM_getResourceText("text_different_css");
  GM_addStyle(highlight_xcode_css);
  GM_addStyle(text_different_css);
}
function buildDiffHtml($node, key, oldVal, newVal) {
  // 新增或删除

  var diff = DiffMatch.diff_main(oldVal, newVal);

  DiffMatch.diff_cleanupSemantic(diff);

  var html = DiffMatch.diff_prettyHtml(diff);
  $node.html(html);
  var errorJson = isErrorJson(newVal);
  if (errorJson) {
    var $td = $node.parent().find("td:first");
    var errorJsonLabelId = `${key}-errorJson`;
    if ($(`#${errorJsonLabelId}`).length == 0) {
      $td.append(
        `<span id="${errorJsonLabelId}" class="label label-danger">错误的json</span>`
      );
      $td.addClass("alert alert-danger");
    }
  }
  $node.on("click", function () {
    showDiffModal(key, newVal, oldVal)
  });
}

function isErrorJson(val) {
  val = val.trim();
  if (val.startsWith("{") || val.startsWith("[")) {
    try {
      JSON.parse(val);
      return false;
    } catch (e) {
      return true;
    }
  }
  return false;
}
