import type { QueueMonitorEntry } from "../../../../interface/Queue";

type QueueColumnProps = {
  title: string; // "Consultation" or "Laboratory"
  entries: QueueMonitorEntry[]; // only the entries of THIS service type
};

// How many waiting patients we show before writing "+3 more".
const NEXT_IN_LINE_LIMIT = 8;

function QueueColumn({ title, entries }: QueueColumnProps) {
  // Split the entries by status. The backend already sends them in queue order.
  const serving = entries.filter((entry) => entry.status === "serving");
  const waiting = entries.filter(
    (entry) => entry.status === "waiting" || entry.status === "skipped",
  );
  const completedCount = entries.filter(
    (entry) => entry.status === "completed",
  ).length;

  return (
    <section className="flex flex-col rounded-xl bg-slate-800/70 p-5">
      {/* Title + counters */}
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="text-xl font-semibold">{title}</h3>
        <span className="text-sm text-slate-400">
          {waiting.length} waiting · {completedCount} done today
        </span>
      </div>

      {/* NOW SERVING */}
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-emerald-300">
        Now serving
      </p>

      {serving.length === 0 ? (
        <p className="mb-6 rounded-lg border border-dashed border-slate-600 p-5 text-center text-slate-500">
          No one is being served
        </p>
      ) : (
        <div className="mb-6 grid gap-3">
          {serving.map((entry) => (
            <div
              key={entry.queue_id}
              className="flex items-center justify-between rounded-lg bg-emerald-500/15 p-4 ring-1 ring-emerald-400/40"
            >
              <div>
                <p className="text-4xl font-black tabular-nums">
                  {entry.queue_id}
                </p>
                <p className="text-slate-300">{entry.display_name}</p>
              </div>
              {entry.room && (
                <p className="text-lg text-emerald-200">{entry.room}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* NEXT IN LINE */}
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
        Next in line
      </p>

      {waiting.length === 0 ? (
        <p className="text-slate-500">Queue is empty</p>
      ) : (
        <ol className="space-y-2">
          {waiting.slice(0, NEXT_IN_LINE_LIMIT).map((entry) => (
            <li
              key={entry.queue_id}
              className="flex items-center justify-between rounded-lg bg-slate-700/50 px-4 py-2.5"
            >
              <span className="text-xl font-bold tabular-nums">
                {entry.queue_id}
              </span>
              <span className="flex items-center gap-3 text-slate-300">
                {entry.status === "skipped" && (
                  <span className="text-xs text-amber-300">skipped</span>
                )}
                {entry.is_priority && (
                  <span className="rounded bg-red-500/20 px-2 py-0.5 text-xs font-semibold text-red-300">
                    PRIORITY
                  </span>
                )}
                {entry.display_name}
              </span>
            </li>
          ))}

          {waiting.length > NEXT_IN_LINE_LIMIT && (
            <li className="px-4 text-sm text-slate-500">
              +{waiting.length - NEXT_IN_LINE_LIMIT} more
            </li>
          )}
        </ol>
      )}
    </section>
  );
}

export default QueueColumn;