export type DetectedPlatform = "instagram" | "ltk" | "amazon" | "unknown";

export type SchemaDetectionResult = {
  platform: DetectedPlatform;
  confidence: number;
  reasons: string[];
};

export function detectPlatformFromColumns(
  columns: string[]
): SchemaDetectionResult {
  const cols = columns.map((c) => c.toLowerCase());
  const reasons: string[] = [];

  let instagramScore = 0;
  let ltkScore = 0;
  let amazonScore = 0;

  if (cols.some((c) => c.includes("impressions"))) {
    instagramScore += 0.3;
    reasons.push('Found "impressions" → Instagram');
  }
  if (cols.some((c) => c.includes("reach"))) {
    instagramScore += 0.2;
    reasons.push('Found "reach" → Instagram');
  }
  if (cols.some((c) => c.includes("profile") && c.includes("visits"))) {
    instagramScore += 0.2;
    reasons.push('Found "profile visits" → Instagram');
  }

  if (cols.some((c) => c.includes("ltk") || c.includes("rewardstyle"))) {
    ltkScore += 0.4;
    reasons.push('Found "ltk"/"rewardstyle" → LTK');
  }
  if (cols.some((c) => c.includes("publisher"))) {
    ltkScore += 0.2;
    reasons.push('Found "publisher" → LTK');
  }

  if (cols.some((c) => c.includes("asin"))) {
    amazonScore += 0.6;
    reasons.push('Found "asin" → Amazon');
  }
  if (cols.some((c) => c.includes("ordered") || c.includes("units"))) {
    amazonScore += 0.2;
    reasons.push('Found "ordered"/"units" → Amazon');
  }
  if (cols.some((c) => c.includes("earnings") || c.includes("commission"))) {
    amazonScore += 0.2;
    reasons.push('Found "earnings"/"commission" → Amazon');
  }

  const scores = [
    { platform: "instagram" as DetectedPlatform, score: instagramScore },
    { platform: "ltk" as DetectedPlatform, score: ltkScore },
    { platform: "amazon" as DetectedPlatform, score: amazonScore },
  ];

  const best = scores.sort((a, b) => b.score - a.score)[0];

  if (!best || best.score === 0) {
    return { platform: "unknown", confidence: 0, reasons: ["No clear signal."] };
  }

  return {
    platform: best.platform,
    confidence: Math.min(1, best.score),
    reasons,
  };
}
