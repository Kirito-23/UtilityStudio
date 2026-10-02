// Adjustment layer engine
// User must create utility-studio-adjustment.prproj in the panel asset folder and install it.

function US_findAdjustmentLayerByName(name) {
  var proj = app.project;
  if (!proj) {
    return null;
  }

  var root = proj.rootItem;
  if (!root) {
    return null;
  }

  if (!root.children) {
    return null;
  }

  for (var i = 0; i < root.children.length; i += 1) {
    var item = root.children[i];
    if (!item) continue;

    if (item.name && item.name.toLowerCase().indexOf(name.toLowerCase()) >= 0) {
      return item;
    }
  }

  return null;
}

function US_findOrCreateAdjustmentLayer() {
  var name = "Utility Studio Adjustment";
  var existing = US_findAdjustmentLayerByName(name);

  if (existing) {
    return { ok: true, item: existing };
  }

  var templatePath = Folder.userData.fsName + "/UtilityStudio/utility-studio-adjustment.prproj";
  var file = new File(templatePath);

  if (!file.exists) {
    return { ok: false, error: "Adjustment template missing: create utility-studio-adjustment.prproj and re-install." };
  }

  try {
    var root = app.project.rootItem;
    app.project.importFiles([file.fsName], true, root, false);

    var found = US_findAdjustmentLayerByName("Adjustment");
    if (found) {
      found.name = name;
      return { ok: true, item: found };
    }

    var fallback = US_findAdjustmentLayerByName("utility");
    if (fallback) {
      fallback.name = name;
      return { ok: true, item: fallback };
    }

    return { ok: false, error: "Adjustment layer import succeeded but item not found" };
  } catch (e) {
    return { ok: false, error: "Adjustment layer failed: " + e.toString() };
  }
}

function US_placeAdjustmentAboveSelection() {
  var seq = app.project.activeSequence;
  if (!seq) {
    return US_wrap(false, null, "No active sequence");
  }

  var selection = seq.getSelection();
  if (!selection || !selection.length) {
    return US_wrap(false, null, "Nothing selected");
  }

  var layerResult = US_findOrCreateAdjustmentLayer();
  if (!layerResult.ok) {
    return US_wrap(false, null, layerResult.error);
  }

  var adj = layerResult.item;
  var track = seq.videoTracks[0];
  if (!track) {
    return US_wrap(false, null, "No video tracks");
  }

  try {
    var start = seq.getPlayerPosition();
    track.overwriteClip(adj, start);
    return US_wrap(true, {
      item: adj.name,
      start: start
    });
  } catch (e) {
    return US_wrap(false, null, "Failed to place adjustment layer: " + e.toString());
  }
}
