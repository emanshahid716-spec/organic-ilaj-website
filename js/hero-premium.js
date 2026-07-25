/* =====================================================
   ORGANIC ILAJ — PREMIUM HERO INTERACTIONS
   Entrance reveal + subtle cursor parallax on the
   product showcase. Fully respects prefers-reduced-motion.
===================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var content = document.querySelector(".hero-premium-content");
  var showcase = document.querySelector(".hero-premium-showcase");

  // ----- Entrance reveal -----
  function reveal() {
    if (content) content.classList.add("is-visible");
    if (showcase) showcase.classList.add("is-visible");
  }

  if ("requestAnimationFrame" in window) {
    requestAnimationFrame(function () {
      setTimeout(reveal, 60);
    });
  } else {
    reveal();
  }

  // ----- Subtle whole-stage tilt on the showcase (desktop/pointer only) -----
  // Applied to the showcase container itself (not individual cards), so it
  // never fights with each card's own infinite float animation.
  if (!reduceMotion && showcase && window.matchMedia("(pointer: fine)").matches) {
    var bounds = null;
    var raf = null;
    var maxTilt = 6; // degrees

    function updateBounds() {
      bounds = showcase.getBoundingClientRect();
    }

    function onMove(e) {
      if (!bounds) updateBounds();
      var relX = (e.clientX - bounds.left) / bounds.width - 0.5;
      var relY = (e.clientY - bounds.top) / bounds.height - 0.5;

      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        var rotateY = (relX * maxTilt).toFixed(2);
        var rotateX = (relY * -maxTilt).toFixed(2);
        showcase.style.transform =
          "rotateX(" + rotateX + "deg) rotateY(" + rotateY + "deg)";
      });
    }

    function onLeave() {
      if (raf) cancelAnimationFrame(raf);
      showcase.style.transform = "";
    }

    showcase.style.transformStyle = "preserve-3d";
    showcase.style.willChange = "transform";
    window.addEventListener("resize", updateBounds);
    showcase.addEventListener("mousemove", onMove);
    showcase.addEventListener("mouseleave", onLeave);
  }
})();
