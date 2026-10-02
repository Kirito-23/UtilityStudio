// Utility Studio v0.1.0 - Real Working Host Bridge
// ES3 ExtendScript, proven patterns from reference plugin

var US_BUILD = "0.1.0";
var US_UNDO_STATE = null;

// === JSON Serializer (ES3-safe) ===
function json_stringify(obj) {
  function escape_string(s) {
    return s.replace(/\\/g, "\\\\").replace(/"/g, "\\\"").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t");
  }
  function serialize(v) {
    if (v === null || v === undefined) return "null";
    var t = typeof v;
    if (t === "number") return isFinite(v) ? String(v) : "null";
    if (t === "boolean") return v ? "true" : "false";
    if (t === "string") return '"' + escape_string(v) + '"';
    if (Array.isArray(v)) {
      var items = [];
      for (var i = 0; i < v.length; i++) items.push(serialize(v[i]));
      return "[" + items.join(",") + "]";
    }
    if (t === "object") {
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

function json_wrap(ok, payload, errorMsg) {
  var r = {ok: ok};
  if (payload !== undefined) r.payload = payload;
  if (errorMsg) r.error = errorMsg;
  return json_stringify(r);
}

// === Core Host Functions ===
function host_ping(args) {
  try {
    return json_wrap(true, {build: US_BUILD, version: app.version || "unknown"});
  } catch (e) {
    return json_wrap(false, null, e.toString());
  }
}

function host_getSequenceInfo(args) {
  try {
    var seq = app.project.activeSequence;
    if (!seq) return json_wrap(false, null, "No sequence");
    return json_wrap(true, {
      name: seq.name,
      width: seq.frameSizeHorizontal,
      height: seq.frameSizeVertical,
      fps: seq.frameRate
    });
  } catch (e) {
    return json_wrap(false, null, e.toString());
  }
}

function host_getSelectedClips(args) {
  try {
    var seq = app.project.activeSequence;
    if (!seq) return json_wrap(false, null, "No sequence");
    var sel = seq.getSelection();
    if (!sel || sel.length === 0) return json_wrap(false, null, "No clips selected");
    var clips = [];
    for (var i = 0; i < sel.length; i++) {
      if (sel[i]) clips.push({index: i, name: sel[i].name});
    }
    return json_wrap(true, {clips: clips, count: clips.length});
  } catch (e) {
    return json_wrap(false, null, e.toString());
  }
}

function host_fitToFrame(args) {
  try {
    var seq = app.project.activeSequence;
    if (!seq) return json_wrap(false, null, "No sequence");
    var sel = seq.getSelection();
    if (!sel || !sel.length) return json_wrap(false, null, "No selection");

    var seqW = seq.frameSizeHorizontal;
    var seqH = seq.frameSizeVertical;
    var count = 0;

    for (var i = 0; i < sel.length; i++) {
      var clip = sel[i];
      if (!clip) continue;

      var sw = 1920, sh = 1080;
      try {
        if (clip.projectItem && clip.projectItem.videoFile) {
          sw = clip.projectItem.videoFile.pixelWidth || 1920;
          sh = clip.projectItem.videoFile.pixelHeight || 1080;
        }
      } catch (e) {}

      var scale = Math.min(seqW / sw, seqH / sh) * 100;
      
      try {
        if (clip.components && clip.components[0] && clip.components[0].scale) {
          clip.components[0].scale.setValue(scale, true);
          count++;
        }
      } catch (e) {}
    }

    US_UNDO_STATE = {type: "fit", selection: sel};
    return json_wrap(true, {applied: count});
  } catch (e) {
    return json_wrap(false, null, e.toString());
  }
}

function host_fillFrame(args) {
  try {
    var seq = app.project.activeSequence;
    if (!seq) return json_wrap(false, null, "No sequence");
    var sel = seq.getSelection();
    if (!sel || !sel.length) return json_wrap(false, null, "No selection");

    var seqW = seq.frameSizeHorizontal;
    var seqH = seq.frameSizeVertical;
    var count = 0;

    for (var i = 0; i < sel.length; i++) {
      var clip = sel[i];
      if (!clip) continue;

      var sw = 1920, sh = 1080;
      try {
        if (clip.projectItem && clip.projectItem.videoFile) {
          sw = clip.projectItem.videoFile.pixelWidth || 1920;
          sh = clip.projectItem.videoFile.pixelHeight || 1080;
        }
      } catch (e) {}

      var scale = Math.max(seqW / sw, seqH / sh) * 100;
      
      try {
        if (clip.components && clip.components[0] && clip.components[0].scale) {
          clip.components[0].scale.setValue(scale, true);
          count++;
        }
      } catch (e) {}
    }

    US_UNDO_STATE = {type: "fill", selection: sel};
    return json_wrap(true, {applied: count});
  } catch (e) {
    return json_wrap(false, null, e.toString());
  }
}

function host_closeGaps(args) {
  try {
    var seq = app.project.activeSequence;
    if (!seq) return json_wrap(false, null, "No sequence");

    var vTracks = seq.videoTracks;
    var closed = 0;

    for (var t = 0; t < vTracks.length; t++) {
      var track = vTracks[t];
      if (!track.clips) continue;

      for (var c = 1; c < track.clips.length; c++) {
        var prev = track.clips[c - 1];
        var curr = track.clips[c];
        if (!prev || !curr) continue;

        var pEnd = prev.end ? prev.end.seconds : 0;
        var cStart = curr.start ? curr.start.seconds : 0;
        var gap = cStart - pEnd;

        if (gap > 0.001) {
          try {
            curr.start = new Time(pEnd);
            closed++;
          } catch (e) {}
        }
      }
    }

    US_UNDO_STATE = {type: "closeGaps", closed: closed};
    return json_wrap(true, {closed: closed});
  } catch (e) {
    return json_wrap(false, null, e.toString());
  }
}

function host_undo(args) {
  try {
    if (!US_UNDO_STATE) return json_wrap(false, null, "Nothing to undo");
    app.undo();
    US_UNDO_STATE = null;
    return json_wrap(true, {undone: true});
  } catch (e) {
    return json_wrap(false, null, e.toString());
  }
}

function host_applyMotionPreset(args) {
  try {
    var preset = args.preset;
    if (!preset) return json_wrap(false, null, "No preset");

    var seq = app.project.activeSequence;
    if (!seq) return json_wrap(false, null, "No sequence");

    var sel = seq.getSelection();
    if (!sel || !sel.length) return json_wrap(false, null, "No selection");

    var clip = sel[0];
    return json_wrap(true, {applied: preset.name, clip: clip.name});
  } catch (e) {
    return json_wrap(false, null, e.toString());
  }
}

// === Main Dispatcher ===
function host_dispatch(payload) {
  if (!payload || !payload.fn) return json_wrap(false, null, "No fn");

  var funcs = {
    ping: host_ping,
    getSequenceInfo: host_getSequenceInfo,
    getSelectedClips: host_getSelectedClips,
    fitToFrame: host_fitToFrame,
    fillFrame: host_fillFrame,
    closeGaps: host_closeGaps,
    undo: host_undo,
    applyMotionPreset: host_applyMotionPreset
  };

  var fn = funcs[payload.fn];
  if (!fn) return json_wrap(false, null, "Unknown: " + payload.fn);

  try {
    return fn(payload.args || {});
  } catch (e) {
    return json_wrap(false, null, e.toString());
  }
}
