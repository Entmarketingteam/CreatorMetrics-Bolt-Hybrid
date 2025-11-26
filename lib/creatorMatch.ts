import levenshtein from "fast-levenshtein";

export type CreatorProfile = {
  id: string;
  name: string;
  handles: string[];
  trackingIds: string[];
  ltkNames: string[];
};

export type MatchResult = {
  creatorId: string | null;
  confidence: number;
  source: string;
};

function normalize(x: string) {
  return x.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
}

function fuzzyScore(a: string, b: string) {
  const dist = levenshtein.get(normalize(a), normalize(b));
  const max = Math.max(a.length, b.length);
  return 1 - dist / max;
}

export function matchCreator(
  text: string,
  creators: CreatorProfile[]
): MatchResult {
  const raw = normalize(text);

  for (const c of creators) {
    for (const t of c.trackingIds) {
      if (raw.includes(normalize(t))) {
        return { creatorId: c.id, confidence: 1, source: "amazon" };
      }
    }
  }

  for (const c of creators) {
    for (const n of c.ltkNames) {
      if (raw.includes(normalize(n))) {
        return { creatorId: c.id, confidence: 0.95, source: "ltk" };
      }
    }
  }

  for (const c of creators) {
    for (const h of c.handles) {
      const handleNorm = normalize(h);
      if (raw.includes(handleNorm)) {
        return { creatorId: c.id, confidence: 0.9, source: "instagram" };
      }
    }
  }

  let best: { id: string; score: number } | null = null;

  for (const c of creators) {
    const all = [...c.handles, ...c.ltkNames, ...c.trackingIds];
    for (const token of all) {
      const score = fuzzyScore(raw, token);
      if (!best || score > best.score) {
        best = { id: c.id, score };
      }
    }
  }

  if (best && best.score > 0.6) {
    return {
      creatorId: best.id,
      confidence: best.score,
      source: "fuzzy",
    };
  }

  return { creatorId: null, confidence: 0, source: "none" };
}
