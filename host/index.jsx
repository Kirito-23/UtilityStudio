var US_BUILD = "0.1.0";

function US_wrap(ok, payload, errorText) {
  var out = { ok: ok };
  if (payload !== undefined) {
    out.payload = payload;
  }
  if (errorText) {
    out.error = errorText;
  }
  return JSON.stringify(out);
}

function US_safeSerialize(value) {
  if (value === null || value === undefined) {
    return "null";
  }
  if (typeof value === "number") {
    if (!isFinite(value)) {
      return "null";
    }
    return String(value);
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  if (typeof value === "string") {
    var escaped = value
      .replace(/\\/g, "\\\\")
      .replace(/"/g, "\\\"")
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/\t/g, "\\t");
    return "\"" + escaped + "\"";
  }
  if (Array.isArray(value)) {
    var arr = [];
    for (var i = 0; i < value.length; i += 1) {
      arr.push(US_safeSerialize(value[i]));
    }
    return "[" + arr.join(",") + "]";
  }
  if (typeof value === "object") {
    var keys = [];
    for (var k in value) {
      if (Object.prototype.hasOwnProperty.call(value, k)) {
        keys.push(US_safeSerialize(k) + ":" + US_safeSerialize(value[k]));
      }
    }
    return "{" + keys.join(",") + "}";
  }
  return "null";
}

function US_ping(args) {
  try {
    var seq = app.project ? app.project.activeSequence : null;
    var info = {
      build: US_BUILD,
      version: app.version || "unknown",
      hasActiveSequence: !!seq
    };
    return US_wrap(true, info);
  } catch (e) {
    return US_wrap(false, null, "Ping failed: " + e.toString());
  }
}

function US_getSequenceInfo(args) {
  try {
    var seq = app.project.activeSequence;
    if (!seq) {
      return US_wrap(false, null, "No active sequence");
    }

    var info = {
      name: seq.name,
      width: seq.frameSizeHorizontal,
      height: seq.frameSizeVertical,
      fps: seq.frameRate,
      duration: seq.duration
    };

    return US_wrap(true, info);
  } catch (e) {
    return US_wrap(false, null, "getSequenceInfo failed: " + e.toString());
  }
}

function US_dispatch(payload) {
  if (!payload || !payload.fn) {
    return US_wrap(false, null, "Missing function name");
  }

  var fnMap = {
    ping: US_ping,
    getSequenceInfo: US_getSequenceInfo,
    fitFill: US_fitFill,
    closeGaps: US_closeGaps,
    applyAnimationPreset: US_applyAnimationPreset,
    applyTransition: US_applyTransition,
    downloadMedia: US_downloadMedia,
    stockSearch: US_stockSearch,
    renderCarouselPreset: US_renderCarouselPreset,
    placeAdjustmentAboveSelection: US_placeAdjustmentAboveSelection,
    applyEffects: US_applyEffects
  };

  var fn = fnMap[payload.fn];
  if (!fn) {
    return US_wrap(false, null, "Unknown function: " + payload.fn);
  }

  try {
    return fn(payload.args || {});
  } catch (e) {
    return US_wrap(false, null, "Host dispatch failed: " + e.toString());
  }
}
