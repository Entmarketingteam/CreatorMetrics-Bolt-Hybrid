export async function runMuseAgent(input: string, _context: any = {}) {
  const lower = input.toLowerCase();

  if (lower.includes('ltk') && lower.includes('caption')) {
    return `✨ LTK Caption Idea

LMNT has been such a game-changer in my routine — especially this season. 💧
I’m linking my go-to flavors and how I mix them into my day so you can easily save + shop.

Tap to see them all and save this for later!`;
  }

  if (lower.includes('lmnt') || lower.includes('q4')) {
    return `LMNT Q4 Launch Angle:

"Trying to drink more water but hate the taste? This is the one thing that actually made it easy for me — and it has clean ingredients."`;
  }

  if (lower.includes('hook')) {
    return `🔥 Hook Ideas

1) "This is the one thing I changed that made my water goals actually happen..."
2) "POV: you finally find an electrolyte that doesn’t taste fake."
3) "I didn’t realize how much better I could feel until I switched to this…"`;
  }

  return `Muse here — ask me for an "LTK caption" or "hook ideas".`;
}
