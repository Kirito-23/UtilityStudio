function US_downloadMedia(args) {
  try {
    var url = args.url;
    if (!url) {
      return US_wrap(false, null, "Missing URL");
    }

    return US_wrap(true, {
      path: "downloads/" + url.split("/").pop(),
      source: url
    });
  } catch (e) {
    return US_wrap(false, null, "downloadMedia failed: " + e.toString());
  }
}

function US_stockSearch(args) {
  try {
    var query = args.query || "";
    var type = args.type || "video";
    var items = [
      { name: "sample-" + type, url: "https://example.com/" + type + ".mp4", type: type }
    ];

    return US_wrap(true, {
      type: type,
      query: query,
      items: items
    });
  } catch (e) {
    return US_wrap(false, null, "stockSearch failed: " + e.toString());
  }
}

function US_renderCarouselPreset(args) {
  try {
    var preset = args.preset || {};
    var duration = args.duration || 8;

    return US_wrap(true, {
      preset: preset.name || "Carousel",
      duration: duration,
      status: "render queued"
    });
  } catch (e) {
    return US_wrap(false, null, "renderCarouselPreset failed: " + e.toString());
  }
}
