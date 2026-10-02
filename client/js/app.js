(function() {
  var UI = {
    fit: function() {
      var res = call_host("fitToFrame", {});
      if (!res.ok) {
        status_text(res.error, "error");
        return;
      }
      status_text("Fit to Frame: " + res.payload.applied + " clip(s)", "success");
    },

    fill: function() {
      var res = call_host("fillFrame", {});
      if (!res.ok) {
        status_text(res.error, "error");
        return;
      }
      status_text("Fill Frame: " + res.payload.applied + " clip(s)", "success");
    },

    gaps: function() {
      var res = call_host("closeGaps", {});
      if (!res.ok) {
        status_text(res.error, "error");
        return;
      }
      status_text("Closed " + res.payload.closed + " gap(s)", "success");
    },

    undo: function() {
      var res = call_host("undo", {});
      if (!res.ok) {
        status_text(res.error, "error");
        return;
      }
      status_text("Action undone", "success");
    },

    showLog: function() {
      var log = get_log();
      var win = window.open();
      win.document.write("<pre style='font-size:11px;font-family:monospace;'>" + log.replace(/</g, "&lt;").replace(/>/g, "&gt;") + "</pre>");
      win.document.close();
    }
  };

  window.addEventListener("DOMContentLoaded", function() {
    init_panel();

    var buttons = document.querySelectorAll("[data-action]");
    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      var action = btn.getAttribute("data-action");
      if (UI[action]) {
        btn.addEventListener("click", UI[action]);
      }
    }

    var search = document.getElementById("searchInput");
    if (search) {
      search.addEventListener("input", function() {
        var q = this.value.toLowerCase();
        var tools = document.querySelectorAll(".tool");
        for (var i = 0; i < tools.length; i++) {
          var show = tools[i].textContent.toLowerCase().indexOf(q) >= 0 || q === "";
          tools[i].style.display = show ? "" : "none";
        }
      });
    }

    status_text("Ready", "success");
  });
}());
