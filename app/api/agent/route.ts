import { runAgent } from '../../../functions/agents/router';

export async function POST(req: Request) {
  const { agent, input } = await req.json();
  const result = await runAgent({ agent, input });
  return Response.json(result);
}
