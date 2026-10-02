var US_BUILD = "0.1.0";
var US_LOG = [];
var US_MAX_LOG = 100;

function logPanel(message) {
  if (typeof console !== "undefined") {
    console.log(message);
  }
  US_LOG.push({
    time: new Date().toLocaleTimeString(),
    msg: message
  });
  if (US_LOG.length > US_MAX_LOG) {
    US_LOG.shift();
  }
}

function safeParseJSON(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    logPanel("JSON parse error: " + e.message + " for: " + text.substring(0, 100));
    return null;
  }
}

function call(fn, args, showStatus) {
  if (typeof showStatus === "undefined") showStatus = true;
  
  var payload = {
    fn: fn,
    args: args || {}
  };

  var out = "";
  var transportError = false;

  try {
    out = window.__adobe_cep__.evalScript("US_dispatch(" + JSON.stringify(payload) + ")");
  } catch (e) {
    transportError = true;
    logPanel("CS transport error: " + e.message);
  }

  if (transportError || !out || out === "undefined" || out === "null") {
    var errorMsg = transportError ? "Bridge transport failed" : "No host response";
    logPanel("Host error: " + errorMsg);
    if (showStatus) setStatus(errorMsg, "error");
    return { ok: false, error: errorMsg };
  }

  var parsed = safeParseJSON(out);
  if (!parsed) {
    logPanel("Invalid JSON from host");
    if (showStatus) setStatus("Invalid response from host", "error");
    return { ok: false, error: "Invalid JSON from host" };
  }

  if (!parsed.ok && parsed.error) {
    logPanel("Host error: " + parsed.error);
    if (showStatus) setStatus(parsed.error, "error");
  }

  return parsed;
}

function pingHost() {
  return call("ping", {}, false);
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
      logPanel("WARNING: Build mismatch. Host: " + result.payload.build + " Panel: " + US_BUILD);
      return false;
    }
  }

  if (banner) {
    banner.classList.add("hidden");
  }

  return true;
}

function setStatus(text, kind) {
  var node = document.getElementById("statusText");
  if (!node) return;
  node.textContent = text;
  if (kind === "error") {
    node.style.color = "#d65a5a";
  } else if (kind === "success") {
    node.style.color = "#5dbd7e";
  } else if (kind === "warning") {
    node.style.color = "#d7a63c";
  } else {
    node.style.color = "#b8b8b8";
  }
}

function getLog() {
  return US_LOG.map(function(entry) {
    return entry.time + " | " + entry.msg;
  }).join("\n");
}
