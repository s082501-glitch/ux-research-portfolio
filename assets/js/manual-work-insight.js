/**
 * Manual work total-cost insight — Latch / Super Labs case study
 * ---------------------------------------------------------------------------
 * Precomputed from the same ATUS occupation headcounts + calibrated
 * repetitive-computer-work shares as the explorer (see Downloads notes).
 *   TOTAL_WORKERS = 155,282
 *   TOTAL_HOURS   ≈ 104.2M / year
 *   TOTAL_COST    ≈ $2.068B / year
 * Count-up animates hours + cost tiles only; workers stay static.
 * Replays when the panel re-enters the viewport; resets on leave.
 * ---------------------------------------------------------------------------
 */
(function () {
  const root = document.getElementById("manual-work-insight");
  if (!root) return;

  const TOTAL_HOURS = 104235977;
  const TOTAL_COST = 2067528402;
  const DURATION_MS = 2800;

  const hoursEl = document.getElementById("mwi-hours");
  const costEl = document.getElementById("mwi-cost");
  if (!hoursEl || !costEl) return;

  let rafId = null;
  let animating = false;

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function formatHours(n) {
    if (n >= 100000000) {
      return (n / 1000000).toFixed(0) + "M";
    }
    if (n >= 1000000) {
      const m = n / 1000000;
      return (m >= 10 ? m.toFixed(0) : m.toFixed(1).replace(/\.0$/, "")) + "M";
    }
    return Math.round(n).toLocaleString();
  }

  function formatCost(n) {
    if (n >= 1000000000) {
      const b = n / 1000000000;
      return "$" + (b >= 10 ? b.toFixed(0) : b.toFixed(1).replace(/\.0$/, "")) + "B";
    }
    if (n >= 1000000) {
      return "$" + (n / 1000000).toFixed(0) + "M";
    }
    return "$" + Math.round(n).toLocaleString();
  }

  function setFinal() {
    hoursEl.textContent = formatHours(TOTAL_HOURS);
    costEl.textContent = formatCost(TOTAL_COST);
  }

  function setZero() {
    hoursEl.textContent = "0";
    costEl.textContent = "$0";
  }

  function cancelAnimation() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    animating = false;
  }

  function animate() {
    if (animating) return;
    animating = true;
    setZero();
    const start = performance.now();

    function frame(now) {
      const t = Math.min(1, (now - start) / DURATION_MS);
      const e = easeOutCubic(t);
      hoursEl.textContent = formatHours(TOTAL_HOURS * e);
      costEl.textContent = formatCost(TOTAL_COST * e);
      if (t < 1) {
        rafId = requestAnimationFrame(frame);
      } else {
        rafId = null;
        animating = false;
        setFinal();
      }
    }

    rafId = requestAnimationFrame(frame);
  }

  const reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion) {
    setFinal();
    return;
  }

  if (!("IntersectionObserver" in window)) {
    setFinal();
    return;
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          cancelAnimation();
          animate();
        } else {
          cancelAnimation();
          setZero();
        }
      });
    },
    { threshold: 0.4 }
  );

  observer.observe(root);
})();
