import { runAtlasAgent } from './atlas';
import { runMuseAgent } from './muse';
import { runNinaAgent } from './nina';
import { runEchoAgent } from './echo';

export type AgentType = 'atlas' | 'muse' | 'nina' | 'echo';

export interface AgentRequest {
  agent: AgentType;
  input: string;
  context?: Record<string, any>;
}

export interface AgentResponse {
  agent: AgentType;
  output: string;
  metadata?: Record<string, any>;
}

export async function runAgent(req: AgentRequest): Promise<AgentResponse> {
  switch (req.agent) {
    case 'atlas':
      return { agent: 'atlas', output: await runAtlasAgent(req.input, req.context) };
    case 'muse':
      return { agent: 'muse', output: await runMuseAgent(req.input, req.context) };
    case 'nina':
      return { agent: 'nina', output: await runNinaAgent(req.input, req.context) };
    case 'echo':
      return { agent: 'echo', output: await runEchoAgent(req.input) };
    default:
      return { agent: req.agent, output: `Unknown agent: ${req.agent}` };
  }
}
