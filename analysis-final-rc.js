(() => {
  const metricDefinitions = {
    "9ball": [
      { key: "shotRate", label: "シュート率", suffix: "%", digits: 0, higher: true, improve: "シュート精度は改善傾向", worsen: "シュート精度は低下傾向", goal: "シュート成功率を前期間以上へ戻しましょう" },
      { key: "masuwari", label: "マス割", suffix: "", digits: 0, higher: true, improve: "マス割は増加傾向", worsen: "マス割は減少傾向", goal: "取り切りまでの配置を振り返りましょう" },
      { key: "avgFouls", label: "平均ファール", suffix: "", digits: 1, higher: false, improve: "ファールは減少傾向", worsen: "ファールは増加傾向", goal: "平均ファールを前期間以下へ戻しましょう" }
    ],
    "10ball": null,
    rotation: [
      { key: "highRun", label: "ハイラン", suffix: "", digits: 0, higher: true, improve: "ハイランは改善傾向", worsen: "ハイランは低下傾向", goal: "連続得点につながった配置を振り返りましょう" },
      { key: "shotRate", label: "シュート率", suffix: "%", digits: 0, higher: true, improve: "シュート精度は改善傾向", worsen: "シュート精度は低下傾向", goal: "シュート成功率を前期間以上へ戻しましょう" },
      { key: "avgFouls", label: "平均ファール", suffix: "", digits: 1, higher: false, improve: "ファールは減少傾向", worsen: "ファールは増加傾向", goal: "平均ファールを前期間以下へ戻しましょう" }
    ],
    jpa9: null,
    straightPool: null,
    threeCushion: null
  };
  metricDefinitions["10ball"] = metricDefinitions["9ball"];
  const averageMetrics = discipline => [
    { key: "average", label: "アベレージ", suffix: "", digits: discipline === "threeCushion" ? 3 : 2, higher: true, improve: "アベレージは改善傾向", worsen: "アベレージは低下傾向", goal: "1イニングあたりの得点を前期間以上へ戻しましょう" },
    { key: "highRun", label: "ハイラン", suffix: "", digits: 0, higher: true, improve: "ハイランは改善傾向", worsen: "ハイランは低下傾向", goal: "連続得点につながった配置を振り返りましょう" },
    { key: "avgFouls", label: "平均ファール", suffix: "", digits: 1, higher: false, improve: "ファールは減少傾向", worsen: "ファールは増加傾向", goal: "平均ファールを前期間以下へ戻しましょう" }
  ];
  metricDefinitions.jpa9 = averageMetrics("jpa9");
  metricDefinitions.straightPool = averageMetrics("straightPool");
  metricDefinitions.threeCushion = averageMetrics("threeCushion");

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
    let status = "安定";
    if (!sufficient) status = "蓄積中";
    else if (improved >= 2 && worsened === 0) status = "改善傾向";
    else if (worsened >= 2 && improved === 0) status = "要調整";
    const mixed = improved > 0 && worsened > 0;
    const conclusions = sufficient
      ? metrics.filter(metric => metric.direction === "improved" || metric.direction === "worsened").map(metric => metric.direction === "improved" ? metric.improve : metric.worsen)
      : ["比較に必要な試合データを蓄積中"];
    if (sufficient && !conclusions.length) conclusions.push("競技別指標は前期間と同水準");
    if (mixed) conclusions.push("改善と悪化が混在しているため、全体として断定しません");
    return { metrics, winDirection, improved, worsened, mixed, status, conclusions };
  };

  const api = { definitionsFor, formatValue, metricDirection, evaluate };
  if (typeof window !== "undefined") window.CueScoreAnalyticsFinalRC = api;
  if (typeof document === "undefined") return;

  const root = document.querySelector(".analysis-v2");
  const context = window.CueScoreAnalysisV2Context;
  if (!root || !context) return;
  let applying = false;
  let queued = false;

  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
  const conclusionClass = direction => direction === "worsened" ? "attention" : direction === "improved" ? "improved" : "flat";
  const matchLabel = definition => definition.key === "avgFouls" ? "ファール" : definition.label;
  const matchGoal = definition => definition.key === "avgFouls" ? "ファール数を抑えましょう" : definition.goal;

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
      status.classList.toggle("attention", result.status === "要調整");
      status.classList.toggle("neutral", result.status === "安定" || result.mixed);
    }
    const change = view.querySelector(".analysis-v2-change");
    if (change) change.innerHTML = result.conclusions.map(text => `<span class="${text.includes("増加傾向") || text.includes("低下傾向") ? "attention" : ""}">${escapeHtml(text)}</span>`).join("<br>");
    const deltas = view.querySelector(".analysis-v2-deltas");
    if (deltas) deltas.hidden = true;

    const evidence = view.querySelector(".analysis-v2-metrics");
    if (evidence) {
      evidence.dataset.analyticsFinalEvidence = "1";
      evidence.classList.add("analysis-final-rc-evidence");
      const winCurrent = finite(current.winRate) ? `${Math.round(current.winRate)}%` : "—";
      const winPrevious = finite(previous.winRate) && sufficient ? `${Math.round(previous.winRate)}%` : "—";
      const winClass = sufficient ? conclusionClass(result.winDirection) : "flat";
      const winCard = `<div class="analysis-v2-metric"><span>勝率</span><strong>${winPrevious} → ${winCurrent}</strong><em class="${winClass}">${current.wins}勝${current.losses}敗</em></div>`;
      const metricCards = result.metrics.map(metric => {
        const before = sufficient ? formatValue(metric.previous, metric) : "—";
        const now = formatValue(metric.current, metric);
        return `<div class="analysis-v2-metric"><span>${metric.label}</span><strong>${before} → ${now}</strong><em class="${conclusionClass(metric.direction)}">${metric.direction === "improved" ? "改善" : metric.direction === "worsened" ? "悪化" : metric.direction === "flat" ? "変化なし" : "比較待ち"}</em></div>`;
      }).join("");
      evidence.innerHTML = winCard + metricCards;
    }

    const adviceRows = view.querySelectorAll(".analysis-v2-advice-row");
    const improvedMetric = result.metrics.find(metric => metric.direction === "improved");
    const worsenedMetric = result.metrics.find(metric => metric.direction === "worsened");
    const strength = adviceRows[0]?.querySelector("span");
    const goal = adviceRows[1]?.querySelector("span");
    if (strength) strength.textContent = !sufficient ? "比較に必要な試合データを蓄積中です" : improvedMetric ? improvedMetric.improve : "競技別指標に明確な改善はありません";
    if (goal) goal.textContent = !sufficient ? "比較に必要な試合データを蓄積しましょう" : worsenedMetric ? worsenedMetric.goal : "現在の競技別指標を維持しましょう";
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
      points.innerHTML = `<h2>競技別指標の比較</h2>${available.length ? available.map((item, index) => {
        const relation = item.direction === "improved" ? "上回りました" : item.direction === "worsened" ? "下回りました" : "同じでした";
        const saferRelation = item.definition.higher ? relation : item.direction === "improved" ? "少なく抑えました" : item.direction === "worsened" ? "多くなりました" : "同じでした";
        return `<div class="analysis-v2-point"><i>${index + 1}</i><span>${matchLabel(item.definition)}は${formatValue(item.winner, item.definition)}対${formatValue(item.opponent, item.definition)}で、${saferRelation}</span></div>`;
      }).join("") : '<div class="analysis-v2-empty-inline">比較できる保存値がありません</div>'}`;
    }

    const comparison = view.querySelector(".analysis-v2-comparison");
    if (comparison) {
      const names = comparison.querySelectorAll(".analysis-v2-compare-head span");
      const winnerName = names[1]?.textContent || "Winner";
      const opponentName = names[2]?.textContent || "Opponent";
      comparison.innerHTML = `<h2>サマリー比較</h2><div class="analysis-v2-compare-head"><span></span><span>${escapeHtml(winnerName)}</span><span>${escapeHtml(opponentName)}</span></div>${comparisons.map(item => `<div class="analysis-v2-compare-row"><span>${matchLabel(item.definition)}</span><b class="${item.direction === "improved" ? "better" : ""}">${formatValue(item.winner, item.definition)}</b><b class="${item.direction === "worsened" ? "better" : ""}">${formatValue(item.opponent, item.definition)}</b></div>`).join("")}`;
    }

    view.querySelector(".analysis-v2-flow")?.remove();
    const adviceRows = view.querySelectorAll(".analysis-v2-advice-row");
    const better = comparisons.find(item => item.direction === "improved");
    const worse = comparisons.find(item => item.direction === "worsened");
    const good = adviceRows[0]?.querySelector("span");
    const next = adviceRows[1]?.querySelector("span");
    if (good) good.textContent = better ? (better.definition.higher ? `${matchLabel(better.definition)}で相手を上回りました` : `${matchLabel(better.definition)}を相手より少なく抑えました`) : "保存値から明確な優位は確認できません";
    if (next) next.textContent = worse ? matchGoal(worse.definition) : "記録された競技別指標を維持しましょう";
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
  function schedule() {
    if (queued || applying) return;
    queued = true;
    queueMicrotask(() => {
      queued = false;
      apply();
    });
  }
  new MutationObserver(schedule).observe(root, { childList: true, subtree: true });
  root.addEventListener("click", () => setTimeout(apply, 0));
  root.addEventListener("change", () => setTimeout(apply, 0));
  apply();
})();
