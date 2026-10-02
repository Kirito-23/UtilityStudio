function US_effectNameMatches(a, b) {
  if (!a || !b) return false;
  var x = a.toLowerCase();
  var y = b.toLowerCase();
  x = x.replace(/["']/g, "");
  y = y.replace(/["']/g, "");
  x = x.replace(/\s+/g, " ");
  y = y.replace(/\s+/g, " ");

  if (x === y) return true;
  if (x.indexOf(y) >= 0 || y.indexOf(x) >= 0) return true;
  return false;
}

function US_setEffectParam(effect, paramName, value) {
  if (!effect || !paramName) {
    return { ok: false, error: "Missing effect or param" };
  }

  var props = effect.properties;
  if (!props) {
    return { ok: false, error: "No properties on effect" };
  }

  for (var i = 0; i < props.length; i += 1) {
    var p = props[i];
    if (!p) continue;

    if (p.name && US_effectNameMatches(p.name, paramName)) {
      try {
        p.setValue(value, true);
        return { ok: true };
      } catch (e) {
        try {
          p.setValue(value);
          return { ok: true };
        } catch (e2) {
          return { ok: false, error: "Failed to set parameter " + paramName };
        }
      }
    }
  }

  return { ok: false, error: "Parameter " + paramName + " not found" };
}

function US_addOrGetEffectOnItem(item, effectName) {
  if (!item) return { ok: false, error: "No item" };

  var itemEffects = item.videoEffects;
  if (!itemEffects) {
    return { ok: false, error: "No videoEffects array" };
  }

  for (var i = 0; i < itemEffects.length; i += 1) {
    var e = itemEffects[i];
    if (e && e.name && US_effectNameMatches(e.name, effectName)) {
      return { ok: true, effect: e };
    }
  }

  try {
    var newEffect = item.applyVideoEffect(effectName);
    return { ok: true, effect: newEffect };
  } catch (e) {
    return { ok: false, error: "Could not add effect " + effectName + ": " + e.toString() };
  }
}

function US_applyEffects(args) {
  try {
    var seq = app.project.activeSequence;
    if (!seq) {
      return US_wrap(false, null, "No active sequence");
    }

    var target = args.target || "selected";
    var effects = args.effects || [];
    var items = [];

    if (target === "selected") {
      var selected = seq.getSelection();
      if (!selected || !selected.length) {
        return US_wrap(false, null, "Nothing selected");
      }
      items = selected;
    } else if (target === "adjustment") {
      var layerResult = US_findOrCreateAdjustmentLayer();
      if (!layerResult.ok) {
        return US_wrap(false, null, layerResult.error);
      }
      items = [layerResult.item];
    }

    var applied = [];
    for (var i = 0; i < items.length; i += 1) {
      var item = items[i];
      if (!item) continue;

      for (var j = 0; j < effects.length; j += 1) {
        var effectCfg = effects[j];
        var effectResult = US_addOrGetEffectOnItem(item, effectCfg.name);
        if (!effectResult.ok) {
          return US_wrap(false, null, effectResult.error);
        }

        var eff = effectResult.effect;
        for (var k = 0; k < effectCfg.params.length; k += 1) {
          var param = effectCfg.params[k];
          var setResult = US_setEffectParam(eff, param.name, param.value);
          if (!setResult.ok) {
            return US_wrap(false, null, setResult.error);
          }
        }

        applied.push(effectCfg.name);
      }
    }

    return US_wrap(true, {
      target: target,
      applied: applied
    });
  } catch (e) {
    return US_wrap(false, null, "US_applyEffects failed: " + e.toString());
  }
}
