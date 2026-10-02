var US_BUILD = "0.1.0";

function logPanel(message) {
  if (typeof console !== "undefined") {
    console.log(message);
  }
}

function safeParseJSON(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
}

function call(fn, args) {
  var payload = {
    fn: fn,
    args: args || {}
  };

  var out = "";
  var transportError = false;

  try {
    out = window.__adobe_cep__.evalScript("US_" + fn + "(" + JSON.stringify(payload) + ")");
  } catch (e) {
    transportError = true;
    logPanel("CS transport error: " + e.message);
  }

  if (transportError || !out || out === "undefined" || out === "null") {
    if (transportError) {
      return { ok: false, error: "Bridge transport failed" };
    }
    return { ok: false, error: "No host response" };
  }

  var parsed = safeParseJSON(out);
  if (!parsed) {
    return { ok: false, error: "Invalid JSON from host" };
  }

  if (parsed.ok === false) {
    logPanel("Host error: " + parsed.error);
  }

  return parsed;
}

function pingHost() {
  return call("ping", {});
}

function checkBuild() {
  var result = pingHost();
  var banner = document.getElementById("staleBanner");
  var buildText = document.getElementById("buildText");

  if (result && result.ok && result.payload && result.payload.build) {
    if (buildText) {
      buildText.textContent = "build " + result.payload.build;
    }

    if (result.payload.build !== US_BUILD) {
      if (banner) {
        banner.classList.remove("hidden");
      }
      return false;
    }
  }

  if (banner) {
    banner.classList.add("hidden");
  }

  return true;
}
