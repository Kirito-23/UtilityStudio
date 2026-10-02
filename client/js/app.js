(function () {
  function setStatus(text, kind) {
    var node = document.getElementById("statusText");
    if (!node) return;
    node.textContent = text;
    if (kind === "error") node.style.color = "#d65a5a";
    else if (kind === "success") node.style.color = "#5dbd7e";
    else if (kind === "warning") node.style.color = "#d7a63c";
    else node.style.color = "#b8b8b8";
  }

  function fitToFrame() {
    var result = call("fitToFrame", {});
    if (!result || !result.ok) {
      setStatus(result && result.error ? result.error : "Fit to Frame failed", "error");
      return;
    }
    var applied = result.payload && result.payload.applied ? result.payload.applied : 0;
    setStatus("Fit to Frame: " + applied + " clip(s) applied", "success");
  }

  function fillFrame() {
    var result = call("fillFrame", {});
    if (!result || !result.ok) {
      setStatus(result && result.error ? result.error : "Fill Frame failed", "error");
      return;
    }
    var applied = result.payload && result.payload.applied ? result.payload.applied : 0;
    setStatus("Fill Frame: " + applied + " clip(s) applied", "success");
  }

  function closeGaps() {
    var result = call("closeGaps", {});
    if (!result || !result.ok) {
      setStatus(result && result.error ? result.error : "Close Gaps failed", "error");
      return;
    }
    var closed = result.payload && result.payload.gapsClosed ? result.payload.gapsClosed : 0;
    setStatus("Closed " + closed + " gap(s)", "success");
  }

  function undoLastAction() {
    var result = call("undoLastAction", {});
    if (!result || !result.ok) {
      setStatus(result && result.error ? result.error : "Undo failed", "error");
      return;
    }
    setStatus("Action undone", "success");
  }

  function showLog() {
    var log = getLog();
    alert("Utility Studio Log:\n\n" + log);
  }

  function wireToolButtons() {
    var fitBtn = document.querySelector('[data-action="fit"]');
    if (fitBtn) {
      fitBtn.addEventListener("click", fitToFrame);
    }

    var fillBtn = document.querySelector('[data-action="fill"]');
    if (fillBtn) {
      fillBtn.addEventListener("click", fillFrame);
    }

    var gapsBtn = document.querySelector('[data-action="gaps"]');
    if (gapsBtn) {
      gapsBtn.addEventListener("click", closeGaps);
    }

    var undoBtn = document.querySelector('[data-action="undo"]');
    if (undoBtn) {
      undoBtn.addEventListener("click", undoLastAction);
    }

    var logBtn = document.querySelector('[data-action="log"]');
    if (logBtn) {
      logBtn.addEventListener("click", showLog);
    }

    var searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.addEventListener("input", function () {
        var q = this.value.toLowerCase();
        var buttons = document.querySelectorAll(".tool");
        for (var i = 0; i < buttons.length; i += 1) {
          var text = buttons[i].textContent.toLowerCase();
          buttons[i].style.display = text.indexOf(q) >= 0 || q === "" ? "" : "none";
        }
      });
    }
  }

  function start() {
    checkBuild();
    wireToolButtons();
    setStatus("Ready", "success");
  }

  window.addEventListener("DOMContentLoaded", start);
}());
