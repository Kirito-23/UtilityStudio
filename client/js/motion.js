(function () {
  function setStatus(text, kind) {
    var node = document.getElementById("statusText");
    if (!node) return;
    node.textContent = text;
    if (kind === "error") node.style.color = "#d65a5a";
    else if (kind === "warning") node.style.color = "#d7a63c";
    else node.style.color = "#b8b8b8";
  }

  function renderPresetList() {
    var root = document.getElementById("presetList");
    if (!root) return;

    root.innerHTML = "";

    var presets = window.US_PRESETS && window.US_PRESETS.motion ? window.US_PRESETS.motion : [];
    for (var i = 0; i < presets.length; i += 1) {
      var preset = presets[i];
      var button = document.createElement("button");
      button.type = "button";
      button.className = "tool";
      button.textContent = preset.name;

      button.addEventListener("click", function (p) {
        return function () {
          var result = call("applyAnimationPreset", {
            preset: p,
            target: p.target || "clip",
            duration: p.duration || 18
          });

          if (!result || !result.ok) {
            setStatus(result && result.error ? result.error : "Preset failed", "error");
            return;
          }

          setStatus("Applied: " + p.name, "success");
        };
      }(preset));

      root.appendChild(button);
    }
  }

  window.addEventListener("DOMContentLoaded", function () {
    renderPresetList();
  });
}());
