export interface SeriesPoint {
  label: string;
  value: number;
}

export default function MetricSpark({ series }: { series: SeriesPoint[] }) {
  const max = Math.max(...series.map((s) => s.value || 1));

  return (
    <div className="flex items-end gap-1 h-16">
      {series.map((s) => (
        <div key={s.label} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-full bg-gradient-to-t from-blue-500 to-cyan-400"
            style={{
              height: `${(s.value / max) * 100}%`,
              minHeight: s.value > 0 ? '4px' : '0px',
            }}
          />
          <span className="text-[10px] text-neutral-500 truncate">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
