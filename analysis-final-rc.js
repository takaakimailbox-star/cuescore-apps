(() => {
  const metricDefinitions = {
    "9ball": [
      { key: "shotRate", label: window.cueT("p3.274e5e0c"), suffix: "%", digits: 0, higher: true, improve: window.cueT("p3.a0a50cc7"), worsen: window.cueT("p3.ff7ff718"), goal: window.cueT("p3.b8ab11e3") },
      { key: "masuwari", label: window.cueT("p3.d3bde92d"), suffix: "", digits: 0, higher: true, improve: window.cueT("p3.8202d5d0"), worsen: window.cueT("p3.0dcca128"), goal: window.cueT("p3.543500c9") },
      { key: "avgFouls", label: window.cueT("p3.d97f2fbf"), suffix: "", digits: 1, higher: false, improve: window.cueT("p3.163e29c1"), worsen: window.cueT("p3.7f5ccec1"), goal: window.cueT("p3.88cb8abf") }
    ],
    "10ball": null,
    rotation: [
      { key: "highRun", label: window.cueT("p3.761345d1"), suffix: "", digits: 0, higher: true, improve: window.cueT("p3.cef76294"), worsen: window.cueT("p3.c1b141ac"), goal: window.cueT("p3.588d7092") },
      { key: "shotRate", label: window.cueT("p3.274e5e0c"), suffix: "%", digits: 0, higher: true, improve: window.cueT("p3.a0a50cc7"), worsen: window.cueT("p3.ff7ff718"), goal: window.cueT("p3.b8ab11e3") },
      { key: "avgFouls", label: window.cueT("p3.d97f2fbf"), suffix: "", digits: 1, higher: false, improve: window.cueT("p3.163e29c1"), worsen: window.cueT("p3.7f5ccec1"), goal: window.cueT("p3.88cb8abf") }
    ],
    jpa9: null,
    straightPool: null,
    threeCushion: null
  };
  metricDefinitions["10ball"] = metricDefinitions["9ball"];
  const averageMetrics = discipline => [
    { key: "average", label: window.cueT("p3.d247b2e7"), suffix: "", digits: discipline === "threeCushion" ? 3 : 2, higher: true, improve: window.cueT("p3.35fa8472"), worsen: window.cueT("p3.dd6dc48f"), goal: window.cueT("p3.b467f3cb") },
    { key: "highRun", label: window.cueT("p3.761345d1"), suffix: "", digits: 0, higher: true, improve: window.cueT("p3.cef76294"), worsen: window.cueT("p3.c1b141ac"), goal: window.cueT("p3.588d7092") },
    { key: "avgFouls", label: window.cueT("p3.d97f2fbf"), suffix: "", digits: 1, higher: false, improve: window.cueT("p3.163e29c1"), worsen: window.cueT("p3.7f5ccec1"), goal: window.cueT("p3.88cb8abf") }
  ];
  metricDefinitions.jpa9 = averageMetrics("jpa9");
  metricDefinitions.straightPool = averageMetrics("straightPool");
  metricDefinitions.threeCushion = averageMetrics("threeCushion");

  // Which conclusion sentences carry the "attention" highlight (current behavior, now keyed by metric id instead of sentence text).
  const IMPROVE_HIGHLIGHT_KEYS = new Set(["masuwari"]);
  const WORSEN_HIGHLIGHT_KEYS = new Set(["shotRate", "highRun", "average", "avgFouls"]);
  const STATUS_TEXT = { improving: window.cueT("p3.6f24b9c6"), attention: window.cueT("p3.df94c8f6"), stable: window.cueT("p3.a5c2a649"), accumulating: window.cueT("p3.9c356c5d") };

  const definitionsFor = discipline => metricDefinitions[discipline] || metricDefinitions.rotation;
  const finite = value => value !== null && value !== undefined && value !== "" && typeof value !== "boolean" && Number.isFinite(Number(value));
  const formatValue = (value, definition) => finite(value)
    ? `${Number(value).toFixed(definition.digits).replace(/\.0+$/, "")}${definition.suffix}`
    : "—";
  const metricDirection = (current, previous, definition) => {
    if (!finite(current) || !finite(previous)) return "na";
    const delta = Number(current) - Number(previous);
    if (Math.abs(delta) < 1e-9) return "flat";
    const improved = definition.higher ? delta > 0 : delta < 0;
    return improved ? "improved" : "worsened";
  };
  const evaluate = (current, previous, discipline, options = {}) => {
    const sufficient = options.sufficient !== false;
    const metrics = definitionsFor(discipline).map(definition => ({
      ...definition,
      current: current?.[definition.key],
      previous: previous?.[definition.key],
      direction: sufficient ? metricDirection(current?.[definition.key], previous?.[definition.key], definition) : "na"
    }));
    const winDirection = sufficient
      ? metricDirection(current?.winRate, previous?.winRate, { higher: true })
      : "na";
    const directions = [...metrics.map(metric => metric.direction), winDirection];
    const improved = directions.filter(direction => direction === "improved").length;
    const worsened = directions.filter(direction => direction === "worsened").length;
    let statusCode = "stable";
    if (!sufficient) statusCode = "accumulating";
    else if (improved >= 2 && worsened === 0) statusCode = "improving";
    else if (worsened >= 2 && improved === 0) statusCode = "attention";
    const status = STATUS_TEXT[statusCode];
    const mixed = improved > 0 && worsened > 0;
    const changed = sufficient ? metrics.filter(metric => metric.direction === "improved" || metric.direction === "worsened") : [];
    const conclusions = sufficient
      ? changed.map(metric => metric.direction === "improved" ? metric.improve : metric.worsen)
      : [window.cueT("p3.64b0b94a")];
    const conclusionAttention = sufficient
      ? changed.map(metric => metric.direction === "improved" ? IMPROVE_HIGHLIGHT_KEYS.has(metric.key) : WORSEN_HIGHLIGHT_KEYS.has(metric.key))
      : [false];
    if (sufficient && !conclusions.length) { conclusions.push(window.cueT("p3.42cddce6")); conclusionAttention.push(false); }
    if (mixed) { conclusions.push(window.cueT("p3.796bd592")); conclusionAttention.push(false); }
    return { metrics, winDirection, improved, worsened, mixed, status, statusCode, conclusions, conclusionAttention };
  };

  const api = { definitionsFor, formatValue, metricDirection, evaluate };
  if (typeof window !== "undefined") window.CueScoreAnalyticsFinalRC = api;
  if (typeof document === "undefined") return;

  const root = document.querySelector(".analysis-v2");
  const context = window.CueScoreAnalysisV2Context;
  if (!root || !context) return;
  let applying = false;

  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
  const conclusionClass = direction => direction === "worsened" ? "attention" : direction === "improved" ? "improved" : "flat";
  const matchLabel = definition => definition.key === "avgFouls" ? window.cueT("p3.4923e874") : definition.label;
  const matchGoal = definition => definition.key === "avgFouls" ? window.cueT("p3.551c1fea") : definition.goal;

  function applyPlayer() {
    const view = root.querySelector('[data-analysis-view="player"]');
    if (!view || view.hidden) return;
    const player = context.selectedPlayer();
    const discipline = context.selectedDiscipline();
    if (!player || !discipline) return;
    const records = context.recordsFor(player).filter(record => context.discipline(record) === discipline);
    const currentRecords = records.slice(0, 10);
    const previousRecords = records.slice(10, 20);
    const current = context.aggregate(currentRecords, player);
    const previous = context.aggregate(previousRecords, player);
    const sufficient = currentRecords.length >= 3 && previousRecords.length >= 3;
    const result = evaluate(current, previous, discipline, { sufficient });
    const signature = `${player.id}|${discipline}|${currentRecords.length}|${previousRecords.length}|${JSON.stringify(current)}|${JSON.stringify(previous)}`;
    if (view.dataset.analyticsFinalSignature === signature && view.querySelector("[data-analytics-final-evidence]")) return;
    view.dataset.analyticsFinalSignature = signature;

    const status = view.querySelector(".analysis-v2-status");
    if (status) {
      status.textContent = result.status;
      status.classList.toggle("attention", result.statusCode === "attention");
      status.classList.toggle("neutral", result.statusCode === "stable" || result.mixed);
    }
    const change = view.querySelector(".analysis-v2-change");
    if (change) change.innerHTML = result.conclusions.map((text, index) => `<span class="${result.conclusionAttention[index] ? "attention" : ""}">${escapeHtml(text)}</span>`).join("<br>");
    const deltas = view.querySelector(".analysis-v2-deltas");
    if (deltas) deltas.hidden = true;

    const evidence = view.querySelector(".analysis-v2-metrics");
    if (evidence) {
      evidence.dataset.analyticsFinalEvidence = "1";
      evidence.classList.add("analysis-final-rc-evidence");
      const winCurrent = finite(current.winRate) ? `${Math.round(current.winRate)}%` : "—";
      const winPrevious = finite(previous.winRate) && sufficient ? `${Math.round(previous.winRate)}%` : "—";
      const winClass = sufficient ? conclusionClass(result.winDirection) : "flat";
      const winCard = `<div class="analysis-v2-metric"><span>${window.cueT("p3.bab1876f")}</span><strong>${winPrevious} → ${winCurrent}</strong><em class="${winClass}">${window.cueT("p3.f3a01e79",{wins:current.wins,losses:current.losses})}</em></div>`;
      const metricCards = result.metrics.map(metric => {
        const before = sufficient ? formatValue(metric.previous, metric) : "—";
        const now = formatValue(metric.current, metric);
        return `<div class="analysis-v2-metric"><span>${metric.label}</span><strong>${before} → ${now}</strong><em class="${conclusionClass(metric.direction)}">${metric.direction === "improved" ? window.cueT("p3.f59bd9e4") : metric.direction === "worsened" ? window.cueT("p3.3b680aaa") : metric.direction === "flat" ? window.cueT("p3.cfefd88f") : window.cueT("p3.5ecd5a46")}</em></div>`;
      }).join("");
      evidence.innerHTML = winCard + metricCards;
    }

    const adviceRows = view.querySelectorAll(".analysis-v2-advice-row");
    const improvedMetric = result.metrics.find(metric => metric.direction === "improved");
    const worsenedMetric = result.metrics.find(metric => metric.direction === "worsened");
    const strength = adviceRows[0]?.querySelector("span");
    const goal = adviceRows[1]?.querySelector("span");
    if (strength) strength.textContent = !sufficient ? window.cueT("p3.f9ee2b42") : improvedMetric ? improvedMetric.improve : window.cueT("p3.ed9836a7");
    if (goal) goal.textContent = !sufficient ? window.cueT("p3.ef0bf3e3") : worsenedMetric ? worsenedMetric.goal : window.cueT("p3.f2b58325");
  }

  const singleMatchValues = (record, side, discipline) => {
    const metric = context.metric(record, side);
    const player = context.recordPlayer(record, side);
    const innings = context.completedTurns(record, side);
    const hasOwn = key => Object.prototype.hasOwnProperty.call(player, key);
    const score = hasOwn("score") ? Number(player.score) : null;
    const analysisEvents = Array.isArray(record?.analysis?.events) ? record.analysis.events : [];
    const hasMasuwariEvidence = analysisEvents.some(event => ["break_result", "break_run_out"].includes(event?.type));
    return {
      shotRate: finite(metric.shotRate) ? Number(metric.shotRate) : null,
      masuwari: hasMasuwariEvidence ? context.masuwariCount(record, side) : null,
      highRun: hasOwn("maxRun") && finite(player.maxRun) ? Number(player.maxRun) : null,
      average: innings > 0 && Number.isFinite(score) ? score / innings : null,
      avgFouls: hasOwn("fouls") && finite(player.fouls) ? Number(player.fouls) : null
    };
  };

  function applyMatch() {
    const view = root.querySelector('[data-analysis-view="match"]');
    if (!view || view.hidden) return;
    const record = context.selectedRecord();
    if (!record) return;
    const discipline = context.discipline(record);
    const winner = Number(record.winner) === 2 ? 2 : 1;
    const opponent = winner === 1 ? 2 : 1;
    const winnerValues = singleMatchValues(record, winner, discipline);
    const opponentValues = singleMatchValues(record, opponent, discipline);
    const comparisons = definitionsFor(discipline).map(definition => ({
      definition,
      winner: winnerValues[definition.key],
      opponent: opponentValues[definition.key],
      direction: metricDirection(winnerValues[definition.key], opponentValues[definition.key], definition)
    }));
    const signature = `${record.id}|${discipline}|${JSON.stringify(winnerValues)}|${JSON.stringify(opponentValues)}`;
    if (view.dataset.analyticsFinalSignature === signature && view.querySelector("[data-analytics-final-points]")) return;
    view.dataset.analyticsFinalSignature = signature;

    const points = view.querySelector(".analysis-v2-points");
    if (points) {
      points.dataset.analyticsFinalPoints = "1";
      const available = comparisons.filter(item => item.direction !== "na");
      points.innerHTML = `<h2>${window.cueT("p3.42293ad5")}</h2>${available.length ? available.map((item, index) => {
        const relation = item.direction === "improved" ? window.cueT("p3.4148e0cf") : item.direction === "worsened" ? window.cueT("p3.1f3e0388") : window.cueT("p3.f5203d0b");
        const saferRelation = item.definition.higher ? relation : item.direction === "improved" ? window.cueT("p3.1d23a940") : item.direction === "worsened" ? window.cueT("p3.58870d66") : window.cueT("p3.f5203d0b");
        return `<div class="analysis-v2-point"><i>${index + 1}</i><span>${window.cueT("p3.50d5833b",{p:matchLabel(item.definition),p2:formatValue(item.winner, item.definition),p3:formatValue(item.opponent, item.definition),saferRelation:saferRelation})}</span></div>`;
      }).join("") : '<div class="analysis-v2-empty-inline">' + window.cueT("p3.0c07de3f") + '</div>'}`;
    }

    const comparison = view.querySelector(".analysis-v2-comparison");
    if (comparison) {
      const names = comparison.querySelectorAll(".analysis-v2-compare-head span");
      const winnerName = names[1]?.textContent || "Winner";
      const opponentName = names[2]?.textContent || "Opponent";
      comparison.innerHTML = `<h2>${window.cueT("p3.88e29fe9")}</h2><div class="analysis-v2-compare-head"><span></span><span>${escapeHtml(winnerName)}</span><span>${escapeHtml(opponentName)}</span></div>${comparisons.map(item => `<div class="analysis-v2-compare-row"><span>${matchLabel(item.definition)}</span><b class="${item.direction === "improved" ? "better" : ""}">${formatValue(item.winner, item.definition)}</b><b class="${item.direction === "worsened" ? "better" : ""}">${formatValue(item.opponent, item.definition)}</b></div>`).join("")}`;
    }

    view.querySelector(".analysis-v2-flow")?.remove();
    const adviceRows = view.querySelectorAll(".analysis-v2-advice-row");
    const better = comparisons.find(item => item.direction === "improved");
    const worse = comparisons.find(item => item.direction === "worsened");
    const good = adviceRows[0]?.querySelector("span");
    const next = adviceRows[1]?.querySelector("span");
    if (good) good.textContent = better ? (better.definition.higher ? window.cueT(`p3.615a4586`,{p:matchLabel(better.definition)}) : window.cueT(`p3.c879245d`,{p:matchLabel(better.definition)})) : window.cueT("p3.b3e02253");
    if (next) next.textContent = worse ? matchGoal(worse.definition) : window.cueT("p3.ea89c74a");
  }

  function apply() {
    if (applying) return;
    applying = true;
    try {
      applyPlayer();
      applyMatch();
      root.querySelectorAll(".analysis-v2-advice-row > b").forEach(chevron => chevron.remove());
      root.querySelectorAll(".analysis-v2-advice-row").forEach(row => row.classList.add("no-chevron-final-rc"));
    } finally {
      applying = false;
    }
  }
  // P2 Phase E / OBS-02: apply() is an explicit post-render step now (published as CueScoreAnalyticsFinalRC.apply and called by the analysis-v2
  // screen after each player / match render). It used to run from a DOM observer on the whole analysis root.
  api.apply = apply;
  root.addEventListener("click", () => setTimeout(apply, 0));
  root.addEventListener("change", () => setTimeout(apply, 0));
  apply();
})();
