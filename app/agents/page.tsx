'use client';

import { useState } from 'react';

export default function AgentsPage() {
  const [agent, setAgent] = useState('atlas');
  const [input, setInput] = useState('overall performance summary');
  const [output, setOutput] = useState('');

  async function run() {
    const res = await fetch('/api/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent, input }),
    });
    const data = await res.json();
    setOutput(data.output);
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50 px-0 py-0">
      <div className="max-w-4xl mx-auto px-4 md:px-0 py-8 space-y-6">
        <h1 className="text-2xl font-semibold">Agent Playground</h1>

        <div className="space-y-3">
          <select
            value={agent}
            onChange={(e) => setAgent(e.target.value)}
            className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm"
          >
            <option value="atlas">Atlas (Analytics)</option>
            <option value="muse">Muse (Creative)</option>
            <option value="nina">Nina (Data Cleaning)</option>
            <option value="echo">Echo (Debug)</option>
          </select>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask an agent something..."
            className="w-full h-40 bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-sm"
          />

          <button
            onClick={run}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm"
          >
            Run Agent
          </button>
        </div>

        <pre className="bg-neutral-900 border border-neutral-700 rounded-lg p-4 whitespace-pre-wrap text-xs min-h-[120px]">
{output || 'Agent output will appear here…'}
        </pre>
      </div>
    </main>
  );
}
