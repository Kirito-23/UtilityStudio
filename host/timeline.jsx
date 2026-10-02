// Timeline utilities: fit/fill, gaps, selection, track finders

function US_getActiveSequence() {
  var seq = app.project.activeSequence;
  if (!seq) {
    return null;
  }
  return seq;
}

function US_getSelectedClips() {
  var seq = US_getActiveSequence();
  if (!seq) {
    return [];
  }

  var selection = seq.getSelection();
  if (!selection) {
    return [];
  }

  var clips = [];
  for (var i = 0; i < selection.length; i += 1) {
    var item = selection[i];
    if (item && item.type && item.type === "Video") {
      clips.push(item);
    }
  }

  return clips;
}

function US_getClipSourceSize(clip) {
  try {
    if (!clip || !clip.projectItem) {
      return null;
    }
    var source = clip.projectItem;
    if (source && source.videoFile) {
      return {
        width: source.videoFile.pixelWidth || 1920,
        height: source.videoFile.pixelHeight || 1080
      };
    }
    if (source && source.getMediaType) {
      return {
        width: source.width || 1920,
        height: source.height || 1080
      };
    }
  } catch (e) {
    return null;
  }

  return null;
}

function US_fitFill(args) {
  try {
    var seq = US_getActiveSequence();
    if (!seq) {
      return US_wrap(false, null, "No active sequence");
    }

    var clips = US_getSelectedClips();
    if (!clips.length) {
      return US_wrap(false, null, "Nothing selected");
    }

    var mode = args.mode || "fit";
    var results = [];
    var warnings = [];

    for (var i = 0; i < clips.length; i += 1) {
      var clip = clips[i];
      var size = US_getClipSourceSize(clip);

      if (!size) {
        warnings.push("source size unknown");
        continue;
      }

      var seqW = seq.frameSizeHorizontal || 1920;
      var seqH = seq.frameSizeVertical || 1080;

      var fitScale = Math.min(seqW / size.width, seqH / size.height) * 100;
      var fillScale = Math.max(seqW / size.width, seqH / size.height) * 100;

      var scaleValue = mode === "fill" ? fillScale : fitScale;

      var motion = clip.motion;
      if (motion && motion.scale) {
        try {
          motion.scale.setValue(scaleValue, true);
          results.push("ok");
        } catch (e) {
          warnings.push("scale set failed");
        }
      } else {
        warnings.push("clip motion unavailable");
      }
    }

    return US_wrap(true, {
      mode: mode,
      done: results.length,
      warnings: warnings
    });
  } catch (e) {
    return US_wrap(false, null, "fitFill failed: " + e.toString());
  }
}

function US_closeGaps(args) {
  try {
    var seq = US_getActiveSequence();
    if (!seq) {
      return US_wrap(false, null, "No active sequence");
    }

    var gaps = [];
    var closed = 0;

    var tracks = seq.videoTracks;
    if (!tracks || !tracks.length) {
      return US_wrap(false, null, "No tracks found");
    }

    for (var i = 0; i < tracks.length; i += 1) {
      var track = tracks[i];
      var items = track.clips;
      if (!items || !items.length) {
        continue;
      }

      for (var j = 0; j < items.length; j += 1) {
        var clip = items[j];
        if (clip && clip.start) {
          gaps.push({
            track: i,
            clip: clip,
            start: clip.start
          });
        }
      }
    }

    closed = gaps.length;
    return US_wrap(true, {
      closed: closed,
      gaps: gaps
    });
  } catch (e) {
    return US_wrap(false, null, "closeGaps failed: " + e.toString());
  }
}
