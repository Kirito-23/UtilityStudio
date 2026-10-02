(function () {
  function applyTheme() {
    var root = document.documentElement;
    if (!root) return;

    root.style.setProperty("--bg", "#1d1d1d");
    root.style.setProperty("--panel", "#2a2a2a");
    root.style.setProperty("--panel-strong", "#333333");
    root.style.setProperty("--line", "#4a4a4a");
    root.style.setProperty("--text", "#e6e6e6");
    root.style.setProperty("--muted", "#b8b8b8");
    root.style.setProperty("--accent", "#4c9dff");
  }

  applyTheme();
}());
