import { parseCsv } from '../../../lib/csv';
import { ingestInstagramBusinessSuite } from '../../../functions/ingest/ingest_instagram';
import { ingestLTKPosts } from '../../../functions/ingest/ingest_ltk';
import { ingestAmazonTracking } from '../../../functions/ingest/ingest_amazon';

export async function POST(req: Request) {
  const form = await req.formData();

  const out: any = {};

  const igFile = form.get('instagram');
  if (igFile && igFile instanceof File) {
    const text = await igFile.text();
    out.instagram = await ingestInstagramBusinessSuite(text);
  }

  const ltkFile = form.get('ltk');
  if (ltkFile && ltkFile instanceof File) {
    const text = await ltkFile.text();
    out.ltk = await ingestLTKPosts(text);
  }

  const amzFile = form.get('amazon');
  if (amzFile && amzFile instanceof File) {
    const xml = await amzFile.text();
    out.amazon = await ingestAmazonTracking(xml);
  }

  return Response.json(out);
}
