var US_BUILD = "0.1.0";
var US_LOG_BUFFER = [];
var US_MAX_LOG = 150;

function log_msg(text) {
  var now = new Date();
  var time = now.getHours() + ":" + (now.getMinutes() < 10 ? "0" : "") + now.getMinutes() + ":" + (now.getSeconds() < 10 ? "0" : "") + now.getSeconds();
  US_LOG_BUFFER.push(time + " | " + text);
  if (US_LOG_BUFFER.length > US_MAX_LOG) US_LOG_BUFFER.shift();
  if (typeof console !== "undefined") console.log(text);
}

function safe_json_parse(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    log_msg("JSON error: " + e.message);
    return null;
  }
}

function call_host(fn, args) {
  var payload = {fn: fn, args: args || {}};
  var result = "";

  try {
    result = window.__adobe_cep__.evalScript("host_dispatch(" + JSON.stringify(payload) + ")");
  } catch (e) {
    log_msg("Bridge error: " + e.message);
    return {ok: false, error: "Bridge failed"};
  }

  if (!result || result === "undefined") {
    log_msg("No response from host");
    return {ok: false, error: "No host response"};
  }

  var parsed = safe_json_parse(result);
  if (!parsed) {
    log_msg("Invalid JSON from host");
    return {ok: false, error: "Invalid response"};
  }

  return parsed;
}

function status_text(msg, kind) {
  var el = document.getElementById("statusText");
  if (!el) return;
  el.textContent = msg;
  el.className = "status-" + (kind || "info");
  log_msg(msg);
}

function get_log() {
  return US_LOG_BUFFER.join("\n");
}

function init_panel() {
  var res = call_host("ping", {}, false);
  if (res && res.ok && res.payload && res.payload.build) {
    var buildEl = document.getElementById("buildText");
    if (buildEl) buildEl.textContent = "build " + res.payload.build;
    if (res.payload.build !== US_BUILD) {
      var banner = document.getElementById("staleBanner");
      if (banner) banner.style.display = "block";
      log_msg("WARNING: Build mismatch - host: " + res.payload.build + ", panel: " + US_BUILD);
    }
  }
}
