// Optional helper script to ingest your real CSV/XML exports into JSON.
// This is a template; adjust file paths to match your environment before running.
//
// Usage (after installing ts-node):
//   npx ts-node scripts/ingest_from_files.ts

import fs from 'fs';
import path from 'path';
import { ingestAllSourcesReal } from '../functions/ingest';

async function run() {
  console.log('Ingest script template. Update file paths before running.');

  // Example:
  // const instagram1 = fs.readFileSync('/path/to/Instagram1.csv', 'utf8');
  // const ltkPosts = fs.readFileSync('/path/to/LTK-posts.csv', 'utf8');
  // const amazonTracking = fs.readFileSync('/path/to/Fee-Tracking-XML.xml', 'utf8');

  const result = await ingestAllSourcesReal({
    instagramFiles: [],
    defaultCreatorId: 'creator_nicki',
    defaultCampaignId: 'camp_lmnt_q4',
  });

  const outDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
  const outPath = path.join(outDir, 'ingested.json');
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
  console.log('Saved:', outPath);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
