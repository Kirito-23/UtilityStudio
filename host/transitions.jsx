function US_applyTransition(args) {
  try {
    var preset = args.preset || {};
    var target = args.target || "adjustment";
    var duration = args.duration || 24;

    var seq = app.project.activeSequence;
    if (!seq) {
      return US_wrap(false, null, "No active sequence");
    }

    var transition = {
      name: preset.name || "Transition",
      duration: duration
    };

    var layerResult = US_findOrCreateAdjustmentLayer();
    if (!layerResult.ok) {
      return US_wrap(false, null, layerResult.error);
    }

    return US_wrap(true, {
      target: target,
      duration: duration,
      transition: transition
    });
  } catch (e) {
    return US_wrap(false, null, "US_applyTransition failed: " + e.toString());
  }
}
