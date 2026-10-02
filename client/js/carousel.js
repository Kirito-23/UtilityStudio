(function () {
  function setStatus(text, kind) {
    var node = document.getElementById("statusText");
    if (!node) return;
    node.textContent = text;
    if (kind === "error") node.style.color = "#d65a5a";
    else if (kind === "warning") node.style.color = "#d7a63c";
    else node.style.color = "#b8b8b8";
  }

  function applyCarouselPreset(name) {
    var presets = window.US_PRESETS && window.US_PRESETS.carousel ? window.US_PRESETS.carousel : [];
    var preset = null;

    for (var i = 0; i < presets.length; i += 1) {
      if (presets[i].name === name) {
        preset = presets[i];
        break;
      }
    }

    if (!preset) {
      setStatus("Carousel preset not found", "error");
      return;
    }

    var result = call("renderCarouselPreset", {
      preset: preset,
      duration: preset.duration || 8,
      sources: []
    });

    if (!result || !result.ok) {
      setStatus(result && result.error ? result.error : "Carousel failed", "error");
      return;
    }

    setStatus("Carousel rendered: " + preset.name, "success");
  }

  window.USCarousel = {
    applyPreset: applyCarouselPreset
  };
}());
