(function () {
  function setStatus(text, kind) {
    var node = document.getElementById("statusText");
    if (!node) return;
    node.textContent = text;
    if (kind === "error") node.style.color = "#d65a5a";
    else if (kind === "warning") node.style.color = "#d7a63c";
    else node.style.color = "#b8b8b8";
  }

  function wireButtons() {
    var tools = document.querySelectorAll(".tool");
    for (var i = 0; i < tools.length; i += 1) {
      tools[i].addEventListener("click", function () {
        var tool = this.getAttribute("data-tool");
        setStatus("Selected: " + tool, "info");
      });
    }

    var pins = document.querySelectorAll(".pin-btn");
    for (var i = 0; i < pins.length; i += 1) {
      pins[i].addEventListener("click", function () {
        var tool = this.getAttribute("data-tool");
        setStatus("Pinned: " + tool, "info");
      });
    }

    document.getElementById("flyoutBtn").addEventListener("click", function () {
      setStatus("Flyout opened", "info");
    });

    document.getElementById("searchInput").addEventListener("input", function () {
      var q = this.value.toLowerCase();
      var buttons = document.querySelectorAll(".tool");
      for (var i = 0; i < buttons.length; i += 1) {
        var text = buttons[i].textContent.toLowerCase();
        buttons[i].style.display = text.indexOf(q) >= 0 || q === "" ? "" : "none";
      }
    });
  }

  function start() {
    checkBuild();
    wireButtons();
  }

  window.addEventListener("DOMContentLoaded", start);
}());
