import type { ArticleStatus } from "@/lib/types";

const STAGES: { key: ArticleStatus | "keyword"; label: string }[] = [
  { key: "keyword", label: "Keyword" },
  { key: "draft", label: "Generado" },
  { key: "optimizing", label: "Optimizado" },
  { key: "ready", label: "Enlazado" },
  { key: "published", label: "Publicado" },
];

function stageIndex(status: ArticleStatus): number {
  switch (status) {
    case "draft":
      return 1;
    case "optimizing":
      return 2;
    case "ready":
      return 3;
    case "publishing":
      return 4;
    case "published":
      return 4;
    case "failed":
      return -1;
    default:
      return 0;
  }
}

export function Pipeline({ status }: { status: ArticleStatus }) {
  const current = stageIndex(status);
  const isFailed = status === "failed";

  return (
    <div className="flex items-center gap-0" role="img" aria-label={`Estado: ${status}`}>
      {STAGES.map((stage, i) => {
        const done = !isFailed && i <= current;
        const isLast = i === STAGES.length - 1;
        return (
          <div key={stage.key} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  isFailed && i === 0
                    ? "bg-red-500"
                    : done
                      ? "bg-[var(--color-signal)]"
                      : "bg-[var(--color-line)]"
                }`}
              />
              <span
                className={`text-[10px] font-mono-tab uppercase tracking-wide whitespace-nowrap ${
                  done ? "text-[var(--color-slate)]" : "text-[var(--color-slate-soft)]"
                }`}
              >
                {stage.label}
              </span>
            </div>
            {!isLast && (
              <div
                className={`h-px w-8 mb-4 ${
                  done && i < current ? "bg-[var(--color-signal)]" : "bg-[var(--color-line)]"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
