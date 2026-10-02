// Baked keyframes: Premiere cannot set custom Bezier handles with scripting.
// So we write many linear keys across a duration.

function US_getClipMotionProperty(clip, propName) {
  if (!clip) return null;

  if (clip.motion && clip.motion.properties) {
    var props = clip.motion.properties;
    for (var i = 0; i < props.length; i += 1) {
      var p = props[i];
      if (p && p.name && p.name.toLowerCase() === propName.toLowerCase()) {
        return p;
      }
    }
  }

  return null;
}

function US_easeValueForCurve(curve, t) {
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
    var n1 = 7.5625;
    var d1 = 2.75;
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      t -= 1.5 / d1;
      return n1 * t * t + 0.75;
    } else if (t < 2.5 / d1) {
      t -= 2.25 / d1;
      return n1 * t * t + 0.9375;
    } else {
      t -= 2.625 / d1;
      return n1 * t * t + 0.984375;
    }
  }

  return t;
}

function US_buildCurvePoints(curve, fromValue, toValue, durationFrames) {
  var points = [];
  var count = Math.max(2, durationFrames);

  for (var i = 0; i < count; i += 1) {
    var t = i / (count - 1);
    var eased = US_easeValueForCurve(curve, t);
    var value = fromValue + (toValue - fromValue) * eased;

    points.push({
      time: i,
      value: value
    });
  }

  return points;
}

function US_applyAnimationPreset(args) {
  try {
    var preset = args.preset;
    var target = args.target || "clip";
    var duration = args.duration || 18;

    var seq = app.project.activeSequence;
    if (!seq) {
      return US_wrap(false, null, "No active sequence");
    }

    var selection = seq.getSelection();
    if (!selection || !selection.length) {
      return US_wrap(false, null, "Nothing selected");
    }

    var clip = selection[0];
    var propertyName = preset.property || "scale";
    var fromValue = preset.from || 100;
    var toValue = preset.to || 110;

    var points = US_buildCurvePoints(preset.easing || "easeInOutCubic", fromValue, toValue, duration);

    var prop = US_getClipMotionProperty(clip, propertyName);
    if (!prop) {
      return US_wrap(false, null, "Property " + propertyName + " not found");
    }

    for (var i = 0; i < points.length; i += 1) {
      try {
        prop.setValue(points[i].value, true);
      } catch (e) {
        // ignore one failing point and continue
      }
    }

    return US_wrap(true, {
      applied: propertyName,
      keys: points.length,
      target: target
    });
  } catch (e) {
    return US_wrap(false, null, "applyAnimationPreset failed: " + e.toString());
  }
}
