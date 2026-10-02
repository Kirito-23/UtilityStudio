(function () {
  var motionPresets = [
    {
      id: "quickZoomIn",
      name: "Quick Zoom In",
      category: "Motion",
      target: "clip",
      duration: 12,
      property: "scale",
      easing: "easeOutExpo",
      from: 90,
      to: 100,
      builtIn: true
    },
    {
      id: "quickZoomOut",
      name: "Quick Zoom Out",
      category: "Motion",
      target: "clip",
      duration: 12,
      property: "scale",
      easing: "easeInOutCubic",
      from: 100,
      to: 110,
      builtIn: true
    },
    {
      id: "slideUp",
      name: "Slide Up",
      category: "Motion",
      target: "clip",
      duration: 18,
      property: "position",
      easing: "easeOutCubic",
      from: { x: 0, y: 30 },
      to: { x: 0, y: 0 },
      builtIn: true
    },
    {
      id: "slideDown",
      name: "Slide Down",
      category: "Motion",
      target: "clip",
      duration: 18,
      property: "position",
      easing: "easeOutCubic",
      from: { x: 0, y: -30 },
      to: { x: 0, y: 0 },
      builtIn: true
    },
    {
      id: "scalePunch",
      name: "Scale Punch",
      category: "Motion",
      target: "clip",
      duration: 14,
      property: "scale",
      easing: "easeOutBack",
      from: 95,
      to: 105,
      builtIn: true
    },
    {
      id: "bounce",
      name: "Bounce",
      category: "Motion",
      target: "clip",
      duration: 18,
      property: "position",
      easing: "bounce",
      from: { x: 0, y: 80 },
      to: { x: 0, y: 0 },
      builtIn: true
    },
    {
      id: "overshoot",
      name: "Overshoot",
      category: "Motion",
      target: "clip",
      duration: 18,
      property: "position",
      easing: "easeOutBack",
      from: { x: 0, y: 25 },
      to: { x: 0, y: 0 },
      builtIn: true
    }
  ];

  var transitionPresets = [
    {
      id: "softDissolve",
      name: "Soft Dissolve",
      category: "Transitions",
      duration: 24,
      easing: "easeInOutCubic",
      target: "adjustment",
      builtIn: true
    },
    {
      id: "zoomWhip",
      name: "Zoom Whip",
      category: "Transitions",
      duration: 20,
      easing: "easeOutExpo",
      target: "adjustment",
      builtIn: true
    },
    {
      id: "slideCross",
      name: "Slide Cross",
      category: "Transitions",
      duration: 22,
      easing: "easeInOutCubic",
      target: "adjustment",
      builtIn: true
    },
    {
      id: "spinBlur",
      name: "Spin Blur",
      category: "Transitions",
      duration: 26,
      easing: "easeInOutSine",
      target: "adjustment",
      builtIn: true
    },
    {
      id: "flashCut",
      name: "Flash Cut",
      category: "Transitions",
      duration: 12,
      easing: "easeOutExpo",
      target: "adjustment",
      builtIn: true
    },
    {
      id: "glitch",
      name: "Glitch",
      category: "Transitions",
      duration: 18,
      easing: "easeInOutQuad",
      target: "adjustment",
      builtIn: true
    }
  ];

  var carouselPresets = [
    {
      id: "ringStep",
      name: "Ring Step",
      kind: "carousel",
      layout: "ring",
      motion: "step",
      ease: "easeInOutCubic",
      duration: 6,
      builtIn: true
    },
    {
      id: "helixFlow",
      name: "Helix Flow",
      kind: "carousel",
      layout: "helix",
      motion: "continuous",
      ease: "easeOutExpo",
      duration: 8,
      builtIn: true
    },
    {
      id: "coverflow",
      name: "Coverflow",
      kind: "carousel",
      layout: "coverflow",
      motion: "step",
      ease: "easeOutCubic",
      duration: 7,
      builtIn: true
    },
    {
      id: "wallGrid",
      name: "Wall Grid",
      kind: "carousel",
      layout: "wall",
      motion: "step",
      ease: "easeInOutQuad",
      duration: 6,
      builtIn: true
    },
    {
      id: "prism",
      name: "Prism",
      kind: "carousel",
      layout: "prism",
      motion: "step",
      ease: "easeInOutSine",
      duration: 7,
      builtIn: true
    },
    {
      id: "ferris",
      name: "Ferris",
      kind: "carousel",
      layout: "ferris",
      motion: "continuous",
      ease: "easeInOutCubic",
      duration: 9,
      builtIn: true
    }
  ];

  window.US_PRESETS = {
    motion: motionPresets,
    transitions: transitionPresets,
    carousel: carouselPresets
  };
}());
