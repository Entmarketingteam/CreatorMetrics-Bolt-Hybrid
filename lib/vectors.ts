export interface EmbeddingResult {
  id: string;
  embedding: number[];
}

export async function embedText(id: string, text: string): Promise<EmbeddingResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { id, embedding: new Array(64).fill(0) };
  }

  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  });

  if (!res.ok) {
    console.error('Embedding error', await res.text());
    return { id, embedding: new Array(64).fill(0) };
  }

  const json = await res.json();
  const embedding = json.data?.[0]?.embedding ?? new Array(64).fill(0);
  return { id, embedding };
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}
