import NavItem from './NavItem';

export default function Sidebar() {
  return (
    <div className="h-full flex flex-col p-4 space-y-6">
      <div className="text-xl font-semibold tracking-tight">
        CreatorMetrics
      </div>
      <nav className="flex-1 space-y-1 text-sm">
        <NavItem label="Dashboard" href="/dashboard" />
        <NavItem label="Creators" href="/creators" />
        <NavItem label="Campaigns" href="/campaigns" />
        <NavItem label="Agents" href="/agents" />
        <NavItem label="Upload" href="/upload" />
      </nav>
      <footer className="text-[11px] text-neutral-500">
        v0.1 • Hackathon Build
      </footer>
    </div>
  );
}
