(function () {
  function setStatus(text, kind) {
    var node = document.getElementById("statusText");
    if (!node) return;
    node.textContent = text;
    if (kind === "error") node.style.color = "#d65a5a";
    else if (kind === "warning") node.style.color = "#d7a63c";
    else node.style.color = "#b8b8b8";
  }

  window.USMedia = {
    downloadMedia: function (url) {
      var result = call("downloadMedia", { url: url, mode: "video" });
      if (!result || !result.ok) {
        setStatus(result && result.error ? result.error : "Download failed", "error");
        return;
      }
      setStatus("Downloaded: " + (result.payload && result.payload.path ? result.payload.path : "media"), "success");
    },

    stockSearch: function (query) {
      var result = call("stockSearch", { query: query, type: "video" });
      if (!result || !result.ok) {
        setStatus(result && result.error ? result.error : "Search failed", "error");
        return;
      }
      setStatus("Found " + result.payload.items.length + " result(s)", "success");
    }
  };
}());
