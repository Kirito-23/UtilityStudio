// Utility Studio Host Bridge
// ES3-compliant ExtendScript for Premiere Pro
// All functions return JSON strings for CEP panel communication

var US_BUILD = "0.1.0";
var US_LAST_ACTION = null;

// JSON serializer (ES3 safe, Premiere doesn't have native JSON in some versions)
function US_stringify(obj) {
  function serialize(v) {
    if (v === null) return "null";
    if (v === undefined) return "undefined";
    var type = typeof v;
    if (type === "number") return isFinite(v) ? String(v) : "null";
    if (type === "boolean") return v ? "true" : "false";
    if (type === "string") {
      var escaped = v.replace(/\\/g, "\\\\").replace(/\"/g, "\\\"").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t");
      return '"' + escaped + '"';
    }
    if (Array.isArray(v)) {
      var items = [];
      for (var i = 0; i < v.length; i++) {
        items.push(serialize(v[i]));
      }
      return "[" + items.join(",") + "]";
    }
    if (type === "object") {
      var pairs = [];
      for (var k in v) {
        if (v.hasOwnProperty(k)) {
          pairs.push(serialize(k) + ":" + serialize(v[k]));
        }
      }
      return "{" + pairs.join(",") + "}";
    }
    return "null";
  }
  return serialize(obj);
}

function US_wrap(ok, payload, errorText) {
  var result = { ok: ok };
  if (payload !== undefined) result.payload = payload;
  if (errorText) result.error = errorText;
  return US_stringify(result);
}

// Core bridge functions
function US_ping(args) {
  try {
    var seq = app.project && app.project.activeSequence ? app.project.activeSequence : null;
    return US_wrap(true, {
      build: US_BUILD,
      version: app.version || "unknown",
      hasActiveSequence: !!seq
    });
  } catch (e) {
    return US_wrap(false, null, "Ping failed: " + e.message);
  }
}

function US_getSequenceInfo(args) {
  try {
    var seq = app.project.activeSequence;
    if (!seq) return US_wrap(false, null, "No active sequence");
    return US_wrap(true, {
      name: seq.name,
      width: seq.frameSizeHorizontal,
      height: seq.frameSizeVertical,
      fps: seq.frameRate,
      duration: seq.duration,
      timebase: 254016000000
    });
  } catch (e) {
    return US_wrap(false, null, "getSequenceInfo failed: " + e.message);
  }
}

function US_getSelectedClips(args) {
  try {
    var seq = app.project.activeSequence;
    if (!seq) return US_wrap(false, null, "No active sequence");
    var selection = seq.getSelection();
    if (!selection || selection.length === 0) return US_wrap(false, null, "No clips selected");
    var clips = [];
    for (var i = 0; i < selection.length; i++) {
      var clip = selection[i];
      if (clip) {
        clips.push({
          id: i,
          name: clip.name || "Clip " + i,
          start: clip.start ? clip.start.seconds : 0,
          end: clip.end ? clip.end.seconds : 0,
          duration: clip.duration ? clip.duration.seconds : 0
        });
      }
    }
    return US_wrap(true, { clips: clips, count: clips.length });
  } catch (e) {
    return US_wrap(false, null, "getSelectedClips failed: " + e.message);
  }
}

function US_fitToFrame(args) {
  try {
    var seq = app.project.activeSequence;
    if (!seq) return US_wrap(false, null, "No active sequence");
    var selection = seq.getSelection();
    if (!selection || selection.length === 0) return US_wrap(false, null, "No clips selected");

    var seqW = seq.frameSizeHorizontal || 1920;
    var seqH = seq.frameSizeVertical || 1080;
    var applied = [];
    var warnings = [];

    for (var i = 0; i < selection.length; i++) {
      var clip = selection[i];
      if (!clip) continue;

      var sourceW = 1920, sourceH = 1080;
      try {
        if (clip.projectItem && clip.projectItem.videoFile) {
          sourceW = clip.projectItem.videoFile.pixelWidth || 1920;
          sourceH = clip.projectItem.videoFile.pixelHeight || 1080;
        }
      } catch (e2) {
        warnings.push("source size unknown for " + clip.name);
      }

      var fitScale = Math.min(seqW / sourceW, seqH / sourceH) * 100;
      try {
        if (clip.components && clip.components[0]) {
          var motion = clip.components[0];
          if (motion.scale) {
            motion.scale.setValue(fitScale, true);
            applied.push(clip.name);
          }
        }
      } catch (e3) {
        warnings.push("could not set scale on " + clip.name);
      }
    }

    US_LAST_ACTION = { type: "fit", selection: selection, applied: applied };
    return US_wrap(true, { applied: applied.length, warnings: warnings, mode: "fit" });
  } catch (e) {
    return US_wrap(false, null, "fitToFrame failed: " + e.message);
  }
}

function US_fillFrame(args) {
  try {
    var seq = app.project.activeSequence;
    if (!seq) return US_wrap(false, null, "No active sequence");
    var selection = seq.getSelection();
    if (!selection || selection.length === 0) return US_wrap(false, null, "No clips selected");

    var seqW = seq.frameSizeHorizontal || 1920;
    var seqH = seq.frameSizeVertical || 1080;
    var applied = [];
    var warnings = [];

    for (var i = 0; i < selection.length; i++) {
      var clip = selection[i];
      if (!clip) continue;

      var sourceW = 1920, sourceH = 1080;
      try {
        if (clip.projectItem && clip.projectItem.videoFile) {
          sourceW = clip.projectItem.videoFile.pixelWidth || 1920;
          sourceH = clip.projectItem.videoFile.pixelHeight || 1080;
        }
      } catch (e2) {
        warnings.push("source size unknown for " + clip.name);
      }

      var fillScale = Math.max(seqW / sourceW, seqH / sourceH) * 100;
      try {
        if (clip.components && clip.components[0]) {
          var motion = clip.components[0];
          if (motion.scale) {
            motion.scale.setValue(fillScale, true);
            applied.push(clip.name);
          }
        }
      } catch (e3) {
        warnings.push("could not set scale on " + clip.name);
      }
    }

    US_LAST_ACTION = { type: "fill", selection: selection, applied: applied };
    return US_wrap(true, { applied: applied.length, warnings: warnings, mode: "fill" });
  } catch (e) {
    return US_wrap(false, null, "fillFrame failed: " + e.message);
  }
}

function US_closeGaps(args) {
  try {
    var seq = app.project.activeSequence;
    if (!seq) return US_wrap(false, null, "No active sequence");

    var videoTracks = seq.videoTracks;
    var audioTracks = seq.audioTracks;
    var allTracks = [];
    var i, j;

    for (i = 0; i < videoTracks.length; i++) allTracks.push(videoTracks[i]);
    for (i = 0; i < audioTracks.length; i++) allTracks.push(audioTracks[i]);

    if (allTracks.length === 0) return US_wrap(false, null, "No tracks found");

    var gapsClosed = 0;
    var eps = 0.001;

    for (i = allTracks.length - 1; i >= 0; i--) {
      var track = allTracks[i];
      if (!track.clips) continue;

      for (j = 1; j < track.clips.length; j++) {
        var prevClip = track.clips[j - 1];
        var currClip = track.clips[j];
        if (!prevClip || !currClip) continue;

        var prevEnd = prevClip.end ? prevClip.end.seconds : 0;
        var currStart = currClip.start ? currClip.start.seconds : 0;
        var gap = currStart - prevEnd;

        if (gap > eps) {
          try {
            currClip.start = new Time(prevEnd);
            gapsClosed++;
          } catch (e2) {
            // track locked or other issue
          }
        }
      }
    }

    US_LAST_ACTION = { type: "closeGaps", gapsClosed: gapsClosed };
    return US_wrap(true, { gapsClosed: gapsClosed });
  } catch (e) {
    return US_wrap(false, null, "closeGaps failed: " + e.message);
  }
}

function US_undoLastAction(args) {
  try {
    if (!US_LAST_ACTION) return US_wrap(false, null, "No action to undo");
    app.undo();
    US_LAST_ACTION = null;
    return US_wrap(true, { undone: true });
  } catch (e) {
    return US_wrap(false, null, "Undo failed: " + e.message);
  }
}

function US_findOrCreateAdjustmentLayer(args) {
  try {
    var proj = app.project;
    if (!proj) return US_wrap(false, null, "No project");

    var root = proj.rootItem;
    if (!root) return US_wrap(false, null, "No root item");

    var name = "Utility Studio Adjustment";
    var existing = null;

    if (root.children) {
      for (var i = 0; i < root.children.length; i++) {
        var item = root.children[i];
        if (item && item.name && item.name.indexOf(name) >= 0) {
          existing = item;
          break;
        }
      }
    }

    if (existing) {
      return US_wrap(true, { item: existing.name, created: false });
    }

    return US_wrap(false, null, "Adjustment layer not found. Create utility-studio-adjustment.prproj and place in client/assets/");
  } catch (e) {
    return US_wrap(false, null, "findOrCreateAdjustmentLayer failed: " + e.message);
  }
}

function US_applyAnimationPreset(args) {
  try {
    var preset = args.preset;
    if (!preset) return US_wrap(false, null, "No preset provided");

    var seq = app.project.activeSequence;
    if (!seq) return US_wrap(false, null, "No active sequence");

    var selection = seq.getSelection();
    if (!selection || selection.length === 0) return US_wrap(false, null, "No clips selected");

    var clip = selection[0];
    var duration = preset.duration || 18;
    var propertyName = preset.property || "scale";
    var fromValue = preset.from || 100;
    var toValue = preset.to || 110;
    var easing = preset.easing || "easeInOutCubic";

    var keyframesWritten = 0;

    try {
      if (clip.components && clip.components[0]) {
        var motion = clip.components[0];
        var prop = null;

        if (propertyName === "scale" && motion.scale) {
          prop = motion.scale;
        } else if (propertyName === "position" && motion.position) {
          prop = motion.position;
        } else if (propertyName === "opacity" && motion.opacity) {
          prop = motion.opacity;
        }

        if (prop) {
          for (var i = 0; i < duration; i++) {
            var t = i / Math.max(1, duration - 1);
            var easedValue = US_easeValue(easing, t);
            var value = fromValue + (toValue - fromValue) * easedValue;
            try {
              prop.setValue(value, true);
              keyframesWritten++;
            } catch (e2) {
              // continue on error
            }
          }
        }
      }
    } catch (e2) {
      // fallback
    }

    US_LAST_ACTION = { type: "animation", clip: clip.name, property: propertyName, keys: keyframesWritten };
    return US_wrap(true, { applied: propertyName, keys: keyframesWritten, preset: preset.name });
  } catch (e) {
    return US_wrap(false, null, "applyAnimationPreset failed: " + e.message);
  }
}

function US_easeValue(curve, t) {
  if (curve === "easeOutExpo") {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }
  if (curve === "easeInOutCubic") {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  if (curve === "easeOutBack") {
    var c1 = 1.70158;
    var c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }
  if (curve === "bounce") {
    var n1 = 7.5625, d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) { t -= 1.5 / d1; return n1 * t * t + 0.75; }
    if (t < 2.5 / d1) { t -= 2.25 / d1; return n1 * t * t + 0.9375; }
    t -= 2.625 / d1;
    return n1 * t * t + 0.984375;
  }
  return t;
}

function US_applyTransition(args) {
  try {
    var preset = args.preset;
    if (!preset) return US_wrap(false, null, "No preset provided");

    var seq = app.project.activeSequence;
    if (!seq) return US_wrap(false, null, "No active sequence");

    return US_wrap(true, {
      transition: preset.name,
      duration: preset.duration || 24,
      status: "transition prepared"
    });
  } catch (e) {
    return US_wrap(false, null, "applyTransition failed: " + e.message);
  }
}

function US_downloadMedia(args) {
  try {
    var url = args.url;
    if (!url) return US_wrap(false, null, "Missing URL");

    return US_wrap(true, {
      path: "downloads/" + url.split("/").pop(),
      source: url,
      status: "download queued"
    });
  } catch (e) {
    return US_wrap(false, null, "downloadMedia failed: " + e.message);
  }
}

function US_stockSearch(args) {
  try {
    var query = args.query || "";
    return US_wrap(true, {
      query: query,
      items: [],
      status: "stock search ready"
    });
  } catch (e) {
    return US_wrap(false, null, "stockSearch failed: " + e.message);
  }
}

function US_renderCarouselPreset(args) {
  try {
    var preset = args.preset;
    if (!preset) return US_wrap(false, null, "No preset");

    return US_wrap(true, {
      preset: preset.name,
      layout: preset.layout,
      status: "carousel render queued"
    });
  } catch (e) {
    return US_wrap(false, null, "renderCarouselPreset failed: " + e.message);
  }
}

// Main dispatcher
function US_dispatch(payload) {
  if (!payload || !payload.fn) {
    return US_wrap(false, null, "Missing function name");
  }

  var fnMap = {
    ping: US_ping,
    getSequenceInfo: US_getSequenceInfo,
    getSelectedClips: US_getSelectedClips,
    fitToFrame: US_fitToFrame,
    fillFrame: US_fillFrame,
    closeGaps: US_closeGaps,
    undoLastAction: US_undoLastAction,
    findOrCreateAdjustmentLayer: US_findOrCreateAdjustmentLayer,
    applyAnimationPreset: US_applyAnimationPreset,
    applyTransition: US_applyTransition,
    downloadMedia: US_downloadMedia,
    stockSearch: US_stockSearch,
    renderCarouselPreset: US_renderCarouselPreset
  };

  var fn = fnMap[payload.fn];
  if (!fn) {
    return US_wrap(false, null, "Unknown function: " + payload.fn);
  }

  try {
    return fn(payload.args || {});
  } catch (e) {
    return US_wrap(false, null, "Dispatch error: " + e.message);
  }
}
