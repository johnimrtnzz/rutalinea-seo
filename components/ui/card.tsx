export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border border-[var(--color-line)] bg-white p-5 ${className}`}
    >
      {children}
    </div>
  );
}

export function ScoreBadge({ score }: { score: number }) {
  const tone =
    score >= 80
      ? "bg-[var(--color-signal-soft)] text-[var(--color-signal)]"
      : score >= 50
        ? "bg-amber-50 text-amber-700"
        : "bg-red-50 text-red-700";

  return (
    <span className={`font-mono-tab text-xs font-semibold px-2 py-1 rounded ${tone}`}>
      {score}/100
    </span>
  );
}
