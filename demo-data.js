/* CueScore Official Demo Data v1.1 — deterministic and isolated from normal data. */
(() => {
  "use strict";

  const VERSION = "1.1";
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
    return Array.from({ length: 24 }, (_, index) => {
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
  }

  const data = () => ({
    players: buildPlayers(),
    records: buildMatches(),
    categories: [
      { id: "category_free", name: "Free", locked: true },
      { id: "category_tournament", name: "大会", locked: false },
      { id: "category_other", name: "その他", locked: false }
    ],
    seasons: [{ id: "demo-season-2026", name: "2026 Demo" }]
  });
  const storageOrDefault = storage => storage || globalThis.localStorage;
  const writeJson = (storage, key, value) => storage.setItem(key, JSON.stringify(value));

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
      writeJson(target, KEYS.metadata, { version: VERSION, playerCount: 10, matchCount: 24 });
      return snapshot;
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
})();
