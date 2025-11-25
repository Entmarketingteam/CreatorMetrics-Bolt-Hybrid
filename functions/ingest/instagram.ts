export type InstagramPostMetric = {
  postId: string;
  caption?: string;
  impressions?: number;
  reach?: number;
  linkClicks?: number;
  saves?: number;
  likes?: number;
};

function parseCsv(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length);
  if (!lines.length) return { headers: [], rows: [] };

  const headers = lines[0]
    .split(",")
    .map((h) => h.replace(/^"|"$/g, "").trim());
  const rows = lines.slice(1).map((line) =>
    line
      .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
      .map((cell) => cell.replace(/^"|"$/g, "").trim())
  );
  return { headers, rows };
}

export function parseInstagramCsv(text: string): InstagramPostMetric[] {
  const { headers, rows } = parseCsv(text);
  if (!headers.length) return [];

  const indexOf = (nameFragment: string) =>
    headers.findIndex((h) =>
      h.toLowerCase().includes(nameFragment.toLowerCase())
    );

  const idxPostId = indexOf("post id");
  const idxCaption =
    indexOf("caption") !== -1 ? indexOf("caption") : indexOf("description");
  const idxImpressions = indexOf("impressions");
  const idxReach = indexOf("reach");
  const idxLinkClicks = indexOf("link clicks");
  const idxSaves = indexOf("saves");
  const idxLikes = indexOf("likes");

  return rows
    .map((row) => {
      const get = (idx: number) => (idx === -1 ? "" : row[idx] ?? "");
      const num = (idx: number) => {
        const v = get(idx).replace(/,/g, "");
        const n = Number(v);
        return Number.isFinite(n) ? n : undefined;
      };

      const postId = get(idxPostId);
      if (!postId) return null;

      return {
        postId,
        caption: idxCaption !== -1 ? get(idxCaption) : undefined,
        impressions: num(idxImpressions),
        reach: num(idxReach),
        linkClicks: num(idxLinkClicks),
        saves: num(idxSaves),
        likes: num(idxLikes),
      } as InstagramPostMetric;
    })
    .filter(Boolean) as InstagramPostMetric[];
}
