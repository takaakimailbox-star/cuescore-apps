/* CueScore Official Demo Data v1.2 — deterministic and isolated from normal data. */
(() => {
  "use strict";

  const VERSION = "1.2";
  const PREFIX = "cuescore-demo";
  const KEYS = Object.freeze({
    mode: `${PREFIX}.mode.v1`,
    players: `${PREFIX}.players.v1`,
    records: `${PREFIX}.matchRecords.v1`,
    categories: `${PREFIX}.matchCategories.v1`,
    seasons: `${PREFIX}.matchSeasons.v1`,
    metadata: `${PREFIX}.metadata.v1`
  });
  const NORMAL_TO_DEMO_KEY = Object.freeze({
    "rotationScoreboard.players.v1": KEYS.players,
    "rotationScoreboard.matchRecords.v1": KEYS.records,
    "rotationScoreboard.matchCategories.v1": KEYS.categories,
    "rotationScoreboard.matchSeasons.v1": KEYS.seasons
  });

  const playerDefinitions = [
    ["Haruto", "Rotationが得意", "male_01"],
    ["Misaki", "9-Ballが好き", "female_01"],
    ["Kaito", "セーフティ強化中", "male_02"],
    ["Hina", "楽しくプレー♪", "female_02"],
    ["Takumi", "ブレイク練習中", "male_03"],
    ["Aoi", "コツコツ練習中", "female_03"],
    ["Naoki", "ハイラン更新中", "male_04"],
    ["Sakura", "試合を楽しむ！", "female_04"],
    ["Sho", "14-1挑戦中", "male_05"],
    ["Yuna", "3C練習中", "female_05"]
  ];

  function buildPlayers() {
    return playerDefinitions.map(([name, memo, avatarId], index) => ({
      id: `demo-player-${String(index + 1).padStart(2, "0")}`,
      name,
      memo,
      avatar: { type: "preset", id: avatarId },
      ...(index === 0 ? { isPrimary: true } : {})
    }));
  }

  function matchPlayer(player, score, opponentScore, index) {
    const pockets = Math.max(3, score + 4 + index % 5);
    const misses = Math.max(1, opponentScore + index % 4);
    const completedTurns = Math.max(3, Math.ceil((pockets + misses) / 2));
    return {
      name: player.name,
      registeredPlayerId: player.id,
      goal: score > opponentScore ? score : opponentScore,
      score,
      safety: (index + score) % 4,
      fouls: (index + opponentScore) % 3,
      breaks: 1 + (index % 3),
      maxRun: Math.max(2, Math.round(pockets / 2) + index % 4),
      completedTurns,
      average: Number((score / completedTurns).toFixed(2)),
      share: 0,
      misses,
      pocketCount: pockets,
      shotRate: Math.round(pockets / (pockets + misses) * 100)
    };
  }

  function buildMatches() {
    const players = buildPlayers();
    const disciplines = ["rotation", "nineBall", "tenBall"];
    const baseTime = Date.parse("2026-05-21T10:00:00+09:00");
    const existingMatches = Array.from({ length: 24 }, (_, index) => {
      const p1Index = index % players.length;
      let p2Index = (index * 3 + 2) % players.length;
      if (p2Index === p1Index) p2Index = (p2Index + 1) % players.length;
      const winner = index % 3 === 1 ? 2 : 1;
      const gameType = disciplines[index % disciplines.length];
      const goal = gameType === "rotation" ? 120 : 5 + (index % 3);
      const winnerScore = goal;
      const loserScore = gameType === "rotation" ? 62 + (index * 7) % 52 : 1 + (index * 2) % Math.max(2, goal - 1);
      const p1Score = winner === 1 ? winnerScore : loserScore;
      const p2Score = winner === 2 ? winnerScore : loserScore;
      const startedAt = new Date(baseTime + index * 3 * 24 * 60 * 60 * 1000 + (index % 4) * 37 * 60 * 1000);
      const endedAt = new Date(startedAt.getTime() + (42 + index % 6 * 7) * 60 * 1000);
      const p1 = matchPlayer(players[p1Index], p1Score, p2Score, index);
      const p2 = matchPlayer(players[p2Index], p2Score, p1Score, index + 1);
      const total = Math.max(1, p1.score + p2.score);
      p1.share = Math.round(p1.score / total * 100);
      p2.share = 100 - p1.share;
      return {
        id: `demo-match-${String(index + 1).padStart(4, "0")}`,
        gameType,
        disciplineId: gameType === "nineBall" ? "9ball" : gameType === "tenBall" ? "10ball" : "rotation",
        recordSchemaVersion: 4,
        createdByAppVersion: "CueScore Official Demo Data v1.1",
        playedAt: endedAt.toISOString(),
        startedAt: startedAt.toISOString(),
        endedAt: endedAt.toISOString(),
        winner,
        result: "win",
        inning: 7 + index % 9,
        rack: gameType === "rotation" ? 1 : p1Score + p2Score,
        category: index % 6 === 0 ? "大会" : "Free",
        season: "2026 Demo",
        memo: "",
        matchMemo: "",
        tags: [],
        analysis: { schemaVersion: 1, events: [], summary: {} },
        progress: { p1: [0, p1Score], p2: [0, p2Score] },
        players: { 1: p1, 2: p2 }
      };
    });

    const additionalDisciplines = [
      { gameType:"nineBall", disciplineId:"9ball", goal:index=>5+(index%3) },
      { gameType:"tenBall", disciplineId:"10ball", goal:index=>5+(index%3) },
      { gameType:"rotation", disciplineId:"rotation", goal:()=>120 },
      { gameType:"straightPool", disciplineId:"straightPool", goal:index=>index%2?75:50 },
      { gameType:"jpa9", disciplineId:"jpa9", goal:index=>14+(index%3)*3 },
      { gameType:"threeCushion", disciplineId:"threeCushion", goal:index=>15+(index%2)*5 }
    ];
    const additionalBaseTime = Date.parse("2026-02-01T09:20:00+09:00");
    const additionalMatches = Array.from({ length: 108 }, (_, extraIndex) => {
      const index = existingMatches.length + extraIndex;
      const discipline = additionalDisciplines[extraIndex % additionalDisciplines.length];
      const round = Math.floor(extraIndex / additionalDisciplines.length);
      const p1Index = (round + extraIndex * 3) % players.length;
      let p2Index = (p1Index + 1 + (round * 2 + extraIndex) % (players.length - 1)) % players.length;
      if (p2Index === p1Index) p2Index = (p2Index + 1) % players.length;
      const winner = (extraIndex + round) % 4 === 0 ? 2 : 1;
      const goal = discipline.goal(extraIndex);
      const closeMatch = extraIndex % 3 === 0;
      const loserScore = discipline.disciplineId === "rotation"
        ? (closeMatch ? 112 - extraIndex % 8 : 58 + extraIndex % 43)
        : discipline.disciplineId === "straightPool"
          ? (closeMatch ? goal - 4 - extraIndex % 3 : Math.max(12, goal - 18 - extraIndex % 14))
          : discipline.disciplineId === "jpa9"
            ? (closeMatch ? goal - 2 : Math.max(2, goal - 7 - extraIndex % 5))
            : discipline.disciplineId === "threeCushion"
              ? (closeMatch ? goal - 1 : Math.max(5, goal - 6 - extraIndex % 5))
              : (closeMatch ? goal - 1 : 1 + extraIndex % Math.max(2, goal - 1));
      const p1Score = winner === 1 ? goal : loserScore;
      const p2Score = winner === 2 ? goal : loserScore;
      const startedAt = new Date(additionalBaseTime + extraIndex * 39 * 60 * 60 * 1000 + (extraIndex % 5) * 13 * 60 * 1000);
      const endedAt = new Date(startedAt.getTime() + (35 + extraIndex % 9 * 6) * 60 * 1000);
      const p1 = matchPlayer(players[p1Index], p1Score, p2Score, index);
      const p2 = matchPlayer(players[p2Index], p2Score, p1Score, index + 1);
      p1.goal = goal; p2.goal = goal;
      if (discipline.disciplineId === "threeCushion") {
        p1.completedTurns = 12 + extraIndex % 9;
        p2.completedTurns = 12 + (extraIndex + 3) % 9;
        p1.maxRun = 2 + extraIndex % 7;
        p2.maxRun = 2 + (extraIndex + 2) % 7;
      }
      const total = Math.max(1, p1.score + p2.score);
      p1.share = Math.round(p1.score / total * 100);
      p2.share = 100 - p1.share;
      const progressSteps = Math.max(2, Math.min(8, discipline.disciplineId === "rotation" || discipline.disciplineId === "straightPool" ? 6 : goal));
      const p1Progress = Array.from({length:progressSteps+1},(_,step)=>Math.round(p1Score*step/progressSteps));
      const p2Progress = Array.from({length:progressSteps+1},(_,step)=>Math.round(p2Score*step/progressSteps));
      return {
        id: `demo-match-${String(index + 1).padStart(4, "0")}`,
        gameType: discipline.gameType,
        disciplineId: discipline.disciplineId,
        recordSchemaVersion: 4,
        createdByAppVersion: "CueScore Official Demo Data v1.2",
        playedAt: endedAt.toISOString(),
        startedAt: startedAt.toISOString(),
        endedAt: endedAt.toISOString(),
        winner,
        result: "win",
        inning: 6 + extraIndex % 15,
        rack: ["9ball","10ball"].includes(discipline.disciplineId) ? p1Score + p2Score : 1,
        category: extraIndex % 8 === 0 ? "大会" : extraIndex % 11 === 0 ? "その他" : "Free",
        season: extraIndex < 54 ? "2026 Demo 前期" : "2026 Demo 後期",
        memo: "",
        matchMemo: extraIndex % 10 === 0 ? "接戦の振り返り用DEMO" : "",
        tags: closeMatch ? ["接戦"] : [],
        analysis: { schemaVersion: 1, events: [], summary: {} },
        progress: { p1: p1Progress, p2: p2Progress },
        scoreProgress: p1Progress.map((score,step)=>({p1:score,p2:p2Progress[step]})),
        players: { 1: p1, 2: p2 }
      };
    });
    return [...existingMatches, ...additionalMatches];
  }

  const data = () => ({
    players: buildPlayers(),
    records: buildMatches(),
    categories: [
      { id: "category_free", name: "Free", locked: true },
      { id: "category_tournament", name: "大会", locked: false },
      { id: "category_other", name: "その他", locked: false }
    ],
    seasons: [
      { id: "demo-season-2026", name: "2026 Demo" },
      { id: "demo-season-2026-first", name: "2026 Demo 前期" },
      { id: "demo-season-2026-second", name: "2026 Demo 後期" }
    ]
  });
  const storageOrDefault = storage => storage || globalThis.localStorage;
  const writeJson = (storage, key, value) => storage.setItem(key, JSON.stringify(value));
  const readJson = (storage, key, fallback) => {
    try { return JSON.parse(storage.getItem(key) || "null") ?? fallback; }
    catch (_) { return fallback; }
  };

  const api = Object.freeze({
    version: VERSION,
    prefix: PREFIX,
    keys: KEYS,
    isDemo(storage) { return storageOrDefault(storage).getItem(KEYS.mode) === "demo"; },
    resolveKey(normalKey, storage) {
      return this.isDemo(storage) ? (NORMAL_TO_DEMO_KEY[normalKey] || normalKey) : normalKey;
    },
    resolveSettingKey(normalKey, storage) {
      return this.isDemo(storage) ? `${PREFIX}.settings.${normalKey}` : normalKey;
    },
    create(storage) {
      const target = storageOrDefault(storage);
      const snapshot = data();
      writeJson(target, KEYS.players, snapshot.players);
      writeJson(target, KEYS.records, snapshot.records);
      writeJson(target, KEYS.categories, snapshot.categories);
      writeJson(target, KEYS.seasons, snapshot.seasons);
      writeJson(target, KEYS.metadata, { version: VERSION, playerCount: snapshot.players.length, matchCount: snapshot.records.length });
      return snapshot;
    },
    upgrade(storage) {
      const target = storageOrDefault(storage);
      const metadata = readJson(target, KEYS.metadata, {});
      if (metadata?.version === VERSION) return {
        players: readJson(target, KEYS.players, buildPlayers()),
        records: readJson(target, KEYS.records, buildMatches())
      };
      const snapshot = data();
      const currentPlayers = readJson(target, KEYS.players, []);
      const currentRecords = readJson(target, KEYS.records, []);
      const currentCategories = readJson(target, KEYS.categories, []);
      const currentSeasons = readJson(target, KEYS.seasons, []);
      const mergeById = (current, official) => {
        const ids = new Set(current.map(item => String(item?.id || "")));
        return [...current, ...official.filter(item => !ids.has(String(item?.id || "")))];
      };
      const players = currentPlayers.length ? mergeById(currentPlayers, snapshot.players) : snapshot.players;
      const records = currentRecords.length ? mergeById(currentRecords, snapshot.records) : snapshot.records;
      const categories = currentCategories.length ? mergeById(currentCategories, snapshot.categories) : snapshot.categories;
      const seasons = currentSeasons.length ? mergeById(currentSeasons, snapshot.seasons) : snapshot.seasons;
      writeJson(target, KEYS.players, players);
      writeJson(target, KEYS.records, records);
      writeJson(target, KEYS.categories, categories);
      writeJson(target, KEYS.seasons, seasons);
      writeJson(target, KEYS.metadata, { version: VERSION, playerCount: players.length, matchCount: records.length });
      return { players, records, categories, seasons };
    },
    setMode(mode, storage) {
      storageOrDefault(storage).setItem(KEYS.mode, mode === "demo" ? "demo" : "normal");
    },
    remove(storage) {
      const target = storageOrDefault(storage);
      const names = [];
      for (let index = 0; index < Number(target.length || 0); index += 1) {
        const key = target.key(index);
        if (key?.startsWith(`${PREFIX}.`)) names.push(key);
      }
      [...new Set([...names, ...Object.values(KEYS)])].forEach(key => target.removeItem(key));
      target.setItem(KEYS.mode, "normal");
    },
    snapshot: data
  });

  globalThis.CueScoreDemoData = api;
  if (api.isDemo()) api.upgrade();
})();
