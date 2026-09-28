/**
 * Repetitive Computer Work Explorer — Latch / Super Labs case study
 * ---------------------------------------------------------------------------
 * MEASURED (ATUS/BLS 2003–2024): weekly hours by occupation & industry;
 *   hourly wages by occupation.
 * NATIONAL ANCHOR (McKinsey G.I. 2017): 33% of U.S. working time on collecting
 *   + processing data (NOT automation-potential %). Financial Activities fixed
 *   at ~50%. Other shares = intensity weights calibrated to that 33% average.
 * Sort: always by repetitive computer work value (orange), highest first.
 * Industry cost stays off until every industry has a wage field.
 * ---------------------------------------------------------------------------
 */
(function () {
  const root = document.getElementById("manual-work-explorer");
  if (!root) return;

  const NATIONAL_SHARE = 33;
  const WEEKS = 52;

  const occupations = {
    "Office/Administrative": {
      hours: 35.9,
      wage: 15.3566,
      weight: 11.4,
      intensity: 100,
    },
    "Management/Business/Financial": {
      hours: 35.8,
      wage: 23.2682,
      weight: 14.0,
      intensity: 72,
    },
    Professional: { hours: 34.15, wage: 25.3699, weight: 22.0, intensity: 55 },
    Sales: { hours: 34.9, wage: 11.9638, weight: 8.6, intensity: 45 },
    "Installation/Maintenance/Repair": {
      hours: 39.95,
      wage: 21.14,
      weight: 3.9,
      intensity: 24,
    },
    Service: { hours: 35.75, wage: 12.2172, weight: 21.3, intensity: 22 },
    Production: { hours: 40.25, wage: 16.1857, weight: 5.5, intensity: 20 },
    "Construction/Extraction": {
      hours: 39.2,
      wage: 20.5653,
      weight: 4.1,
      intensity: 18,
    },
    "Transportation/Material Moving": {
      hours: 40.05,
      wage: 15.3893,
      weight: 8.8,
      intensity: 12,
    },
    "Farming/Fishing/Forestry": {
      hours: 39.1,
      wage: 11.2167,
      weight: 0.3,
      intensity: 8,
    },
  };

  const industries = {
    "Financial Activities": {
      hours: 34.8,
      weight: 11581,
      fixedShare: 50,
    },
    Information: { hours: 34.8, weight: 3703, intensity: 70 },
    "Professional/Business Services": {
      hours: 34.7,
      weight: 18900,
      intensity: 65,
    },
    "Public Administration": { hours: 38.6, weight: 8335, intensity: 65 },
    "Educational/Health Services": {
      hours: 34.4,
      weight: 38403,
      intensity: 45,
    },
    "Wholesale/Retail Trade": { hours: 36.6, weight: 19015, intensity: 45 },
    "Other Services": { hours: 33.2, weight: 7524, intensity: 40 },
    Manufacturing: { hours: 39.3, weight: 16735, intensity: 38 },
    "Transportation/Utilities": { hours: 39.5, weight: 7588, intensity: 35 },
    Mining: { hours: 42.75, weight: 703, intensity: 32 },
    Construction: { hours: 37.95, weight: 9086, intensity: 30 },
    "Leisure/Hospitality": { hours: 35.15, weight: 10960, intensity: 22 },
    "Agriculture/Forestry/Fishing/Hunting": {
      hours: 36.8,
      weight: 2749,
      intensity: 15,
    },
  };

  const industryHasWages = Object.keys(industries).every(function (k) {
    return industries[k].wage !== undefined;
  });

  function calibrate(items) {
    const names = Object.keys(items);
    let totalW = 0;
    let fixedSum = 0;
    let freeSum = 0;
    names.forEach(function (k) {
      const it = items[k];
      totalW += it.weight;
      if (it.fixedShare !== undefined) {
        fixedSum += it.weight * it.fixedShare;
      } else {
        freeSum += it.weight * it.intensity;
      }
    });
    const factor = (NATIONAL_SHARE * totalW - fixedSum) / freeSum;
    names.forEach(function (k) {
      const it = items[k];
      it.share =
        it.fixedShare !== undefined ? it.fixedShare : it.intensity * factor;
    });
  }
  calibrate(occupations);
  calibrate(industries);

  /** Data quality checks (viz rule: validate before charting). */
  function validateDataset(label, items) {
    const names = Object.keys(items);
    let totalW = 0;
    let weightedShare = 0;
    names.forEach(function (k) {
      const it = items[k];
      if (!(it.hours > 0)) {
        console.warn("[explorer] invalid hours for", label, k, it.hours);
      }
      if (it.wage !== undefined && !(it.wage > 0)) {
        console.warn("[explorer] invalid wage for", label, k, it.wage);
      }
      if (!(it.share >= 0 && it.share <= 100)) {
        console.warn("[explorer] share out of range for", label, k, it.share);
      }
      totalW += it.weight;
      weightedShare += it.weight * it.share;
    });
    const avg = weightedShare / totalW;
    if (Math.abs(avg - NATIONAL_SHARE) > 0.05) {
      console.warn(
        "[explorer] " + label + " weighted share is " + avg.toFixed(2) + "%, expected ~" + NATIONAL_SHARE + "%"
      );
    }
  }
  validateDataset("occupations", occupations);
  validateDataset("industries", industries);

  const state = {
    view: "profession",
    metric: "hours",
    gran: "weekly",
    scale: "per",
  };

  const els = {
    scope: document.getElementById("mwe-scope"),
    title: root.querySelector(".cs-explorer__title"),
    unit: document.getElementById("mwe-unit"),
    view: document.getElementById("mwe-view"),
    metric: document.getElementById("mwe-metric"),
    metricGroup: document.getElementById("mwe-metric-group"),
    gran: document.getElementById("mwe-gran"),
    scale: document.getElementById("mwe-scale"),
    teamRow: document.getElementById("mwe-team-row"),
    teamSize: document.getElementById("mwe-team-size"),
    teamSlider: document.getElementById("mwe-team-slider"),
    legend: document.getElementById("mwe-legend"),
    insight: document.getElementById("mwe-insight"),
    footnote: document.getElementById("mwe-footnote"),
    rows: document.getElementById("mwe-rows"),
    sortNote: document.getElementById("mwe-sort-note"),
  };

  function teamSize() {
    let n = parseInt(els.teamSize.value, 10);
    if (!n || n < 1) n = 1;
    return n;
  }

  function parts(d) {
    const repH = (d.hours * d.share) / 100;
    const othH = d.hours - repH;
    let rep;
    let oth;

    if (state.metric === "cost") {
      if (state.gran === "hourly") {
        return { rep: d.wage, oth: 0, tot: d.wage };
      }
      rep = repH * d.wage;
      oth = othH * d.wage;
    } else {
      rep = repH;
      oth = othH;
    }

    const f =
      state.gran === "daily" ? 1 / 5 : state.gran === "yearly" ? WEEKS : 1;
    rep *= f;
    oth *= f;

    if (state.scale === "team" && !(state.metric === "cost" && state.gran === "hourly")) {
      const t = teamSize();
      rep *= t;
      oth *= t;
    }

    return { rep: rep, oth: oth, tot: rep + oth };
  }

  function fmt(v) {
    if (state.metric === "hours") {
      return (
        v.toLocaleString(undefined, { maximumFractionDigits: 1 }) + " hrs"
      );
    }
    if (state.gran === "hourly") {
      return "$" + v.toFixed(0);
    }
    return "$" + Math.round(v).toLocaleString();
  }

  function periodWord() {
    return { hourly: "hour", daily: "day", weekly: "week", yearly: "year" }[
      state.gran
    ];
  }

  function renderSegment(container, options, key) {
    container.innerHTML = "";
    container.className =
      "cs-explorer__segment cs-explorer__segment--" + options.length;
    options.forEach(function (opt) {
      const val = opt[0];
      const label = opt[1];
      const disabled = !!opt[2];
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cs-explorer__seg-btn";
      btn.textContent = label;
      btn.disabled = disabled;
      btn.setAttribute("aria-pressed", state[key] === val ? "true" : "false");
      if (!disabled) {
        btn.addEventListener("click", function () {
          if (state[key] === val) return;
          state[key] = val;
          if (key === "view" && val === "industry" && !industryHasWages) {
            state.metric = "hours";
            if (state.gran === "hourly") state.gran = "weekly";
          }
          if (key === "metric" && val === "hours" && state.gran === "hourly") {
            state.gran = "weekly";
          }
          if (key === "gran" && val === "hourly") state.scale = "per";
          if (key === "metric" && val === "cost" && state.gran === "hourly") {
            state.scale = "per";
          }
          if (
            key === "scale" &&
            val === "team" &&
            state.metric === "cost" &&
            state.gran === "hourly"
          ) {
            state.gran = "weekly";
          }
          render();
        });
      }
      container.appendChild(btn);
    });
  }

  function syncTeamInputs(from) {
    const n = Math.max(1, parseInt(from.value, 10) || 1);
    els.teamSize.value = n;
    const sliderMax = parseInt(els.teamSlider.max, 10);
    els.teamSlider.value = String(Math.min(n, sliderMax));
  }

  els.teamSize.addEventListener("input", function () {
    syncTeamInputs(els.teamSize);
    render();
  });
  els.teamSlider.addEventListener("input", function () {
    els.teamSize.value = els.teamSlider.value;
    render();
  });

  function updateCopy(rows, indView, isHourlyCost) {
    els.scope.textContent = indView
      ? "13 industries · repetitive computer work share"
      : "10 occupations · repetitive computer work share";

    if (isHourlyCost) {
      els.title.textContent = "Occupations by average hourly wage";
    } else if (indView) {
      els.title.textContent =
        state.metric === "cost"
          ? "Industries with the highest cost of repetitive computer work"
          : "Industries with the most repetitive computer work";
    } else if (state.metric === "cost") {
      els.title.textContent =
        "Occupations with the highest cost of repetitive computer work";
    } else {
      els.title.textContent =
        "Occupations with the most repetitive computer work";
    }

    els.legend.hidden = !!isHourlyCost;
    if (els.sortNote) {
      els.sortNote.textContent = isHourlyCost
        ? "Sorted by hourly wage ↓"
        : "Sorted by repetitive computer work ↓";
    }

    if (els.unit) {
      if (isHourlyCost) {
        els.unit.textContent =
          "Bar length = average hourly wage (USD) · measured ATUS wages";
      } else if (state.metric === "cost") {
        els.unit.textContent =
          "Bar length = total labor cost · orange/hatched = repetitive computer work · values in USD " +
          (state.scale === "team" ? "for the team" : "per employee") +
          ", per " +
          periodWord();
      } else {
        els.unit.textContent =
          "Bar length = total work · orange/hatched = repetitive computer work · values in hours " +
          (state.scale === "team" ? "for the team" : "per employee") +
          ", per " +
          periodWord();
      }
    }

    const top = rows[0];
    const bottom = rows[rows.length - 1];
    const who =
      state.scale === "team" && !isHourlyCost
        ? "across a team of " + teamSize()
        : "per employee";
    const pw = periodWord();

    function line(tag, r) {
      if (isHourlyCost) {
        return (
          "<strong>" +
          tag +
          " (" +
          r.name +
          "):</strong> " +
          fmt(r.rep) +
          " for every hour of work."
        );
      }
      return (
        "<strong>" +
        tag +
        " (" +
        r.name +
        "):</strong> " +
        fmt(r.rep) +
        " of repetitive computer work out of " +
        fmt(r.tot) +
        " total (" +
        Math.round(r.share) +
        "%) per " +
        pw +
        ", " +
        who +
        "."
      );
    }

    if (top && bottom) {
      els.insight.innerHTML =
        '<span class="cs-explorer__insight-line">' +
        line("Highest", top) +
        "</span>" +
        '<span class="cs-explorer__insight-line">' +
        line("Lowest", bottom) +
        "</span>";
    }

    let foot =
      "Hours and wages: American Time Use Survey (Bureau of Labor Statistics), 2003–2024. Share of time on repetitive computer work: modeled from McKinsey Global Institute’s national figure of 33% of working time on collecting and processing data (A Future That Works, 2017), distributed across ";
    if (indView) {
      foot +=
        "industries by the job mix of each, with Financial Activities set to McKinsey’s roughly 50% for finance and insurance.";
      if (!industryHasWages) {
        foot +=
          " Cost by industry needs industry wages, which are not in the survey output yet.";
      }
    } else {
      foot +=
        "occupations by the computer-based admin content of each role. Wages are survey hourly wages, so cost is conservative.";
    }
    els.footnote.textContent = foot;
  }

  function renderBars(rows, isHourlyCost) {
    const host = els.rows;
    host.innerHTML = "";
    const maxTot = Math.max.apply(
      null,
      rows.map(function (r) {
        return r.tot;
      })
    );

    const unitHint =
      state.metric === "hours"
        ? "hrs"
        : state.gran === "hourly"
          ? "per hour"
          : "USD";

    rows.forEach(function (r, i) {
      const wRep = maxTot ? (r.rep / maxTot) * 100 : 0;
      const wOth = maxTot ? (r.oth / maxTot) * 100 : 0;
      const label = isHourlyCost
        ? fmt(r.rep)
        : fmt(r.rep) + " · " + Math.round(r.share) + "% of week";

      const aria = isHourlyCost
        ? r.name + ": " + fmt(r.rep) + " average hourly wage"
        : r.name +
          ": " +
          fmt(r.rep) +
          " repetitive computer work of " +
          fmt(r.tot) +
          " total (" +
          Math.round(r.share) +
          "%), " +
          unitHint;

      const row = document.createElement("div");
      row.className = "cs-explorer__bar-row";
      row.setAttribute("role", "listitem");
      row.setAttribute("aria-label", aria);
      row.innerHTML =
        '<div class="cs-explorer__bar-label">' +
        (i + 1) +
        ". " +
        r.name +
        "</div>" +
        '<div class="cs-explorer__bar-track">' +
        '<div class="cs-explorer__bar-stack" title="' +
        aria.replace(/"/g, "&quot;") +
        '">' +
        '<div class="cs-explorer__bar cs-explorer__bar--rep" style="width:' +
        Math.max(wRep, 0.4) +
        '%"></div>' +
        (wOth > 0
          ? '<div class="cs-explorer__bar cs-explorer__bar--oth" style="width:' +
            wOth +
            '%"></div>'
          : "") +
        "</div>" +
        '<span class="cs-explorer__bar-value">' +
        label +
        "</span>" +
        "</div>";
      host.appendChild(row);
    });

    host.setAttribute("role", "list");
    host.setAttribute(
      "aria-label",
      isHourlyCost
        ? "Average hourly wages by category, highest first"
        : "Stacked bars of repetitive computer work versus other work, highest repetitive first"
    );
  }

  function render() {
    const indView = state.view === "industry";
    const costAvailable = !indView || industryHasWages;
    if (!costAvailable) state.metric = "hours";
    if (state.metric === "hours" && state.gran === "hourly") {
      state.gran = "weekly";
    }

    const isHourlyCost =
      state.metric === "cost" && state.gran === "hourly";
    if (isHourlyCost) state.scale = "per";

    renderSegment(
      els.view,
      [
        ["profession", "Occupation"],
        ["industry", "Industry"],
      ],
      "view"
    );

    renderSegment(
      els.metric,
      [
        ["hours", "Hours"],
        ["cost", "Labor cost", !costAvailable],
      ],
      "metric"
    );
    els.metricGroup.hidden = false;

    const granOpts =
      state.metric === "cost"
        ? [
            ["hourly", "Hourly"],
            ["daily", "Daily"],
            ["weekly", "Weekly"],
            ["yearly", "Yearly"],
          ]
        : [
            ["daily", "Daily"],
            ["weekly", "Weekly"],
            ["yearly", "Yearly"],
          ];
    if (
      granOpts.every(function (o) {
        return o[0] !== state.gran;
      })
    ) {
      state.gran = "weekly";
    }
    renderSegment(els.gran, granOpts, "gran");

    renderSegment(
      els.scale,
      [
        ["per", "Per person"],
        ["team", "Team", isHourlyCost],
      ],
      "scale"
    );

    els.teamRow.hidden = !(state.scale === "team" && !isHourlyCost);

    const src = indView ? industries : occupations;
    const rows = Object.keys(src)
      .map(function (k) {
        const p = parts(src[k]);
        return {
          name: k,
          share: src[k].share,
          rep: p.rep,
          oth: p.oth,
          tot: p.tot,
        };
      })
      .sort(function (a, b) {
        return b.rep - a.rep;
      });

    updateCopy(rows, indView, isHourlyCost);
    renderBars(rows, isHourlyCost);
  }

  render();
})();
