import { useEffect, useMemo, useRef, useState } from "react";
import { useQueueStream, type MonitorEntry, type StreamState } from "../../../hooks/useQueueStream";

// Props kept so Admin.tsx doesn't need to change. The monitor does its own
// data fetching via SSE, so none of them are required.
type QueueingMonitorProps = {
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  loadData?: () => Promise<void>;
  loading?: boolean;
};

const SERVICE_COLUMNS = [
  { type: "consultation", title: "Consultation", prefix: "CONS" },
  { type: "laboratory", title: "Laboratory", prefix: "LAB" },
] as const;

const NEXT_IN_LINE = 8;

const STATE_BADGE: Record<StreamState, { label: string; cls: string }> = {
  connecting: { label: "Connecting…", cls: "bg-amber-500/20 text-amber-300" },
  live: { label: "Live", cls: "bg-emerald-500/20 text-emerald-300" },
  reconnecting: { label: "Reconnecting…", cls: "bg-amber-500/20 text-amber-300" },
  unauthorized: { label: "Session expired — log in again", cls: "bg-red-500/20 text-red-300" },
};

function QueueingMonitor(_props: QueueingMonitorProps) {
  const { entries, state, lastUpdated } = useQueueStream();
  const screenRef = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const byType = useMemo(() => {
    const out: Record<string, { serving: MonitorEntry[]; waiting: MonitorEntry[]; done: number }> = {};
    for (const col of SERVICE_COLUMNS) out[col.type] = { serving: [], waiting: [], done: 0 };
    for (const e of entries) {
      const bucket = out[e.service_type];
      if (!bucket) continue;
      if (e.status === "serving") bucket.serving.push(e);
      else if (e.status === "waiting" || e.status === "skipped") bucket.waiting.push(e);
      else if (e.status === "completed") bucket.done += 1;
    }
    return out;
  }, [entries]);

  const stale = state !== "live";

  return (
    <div
      ref={screenRef}
      className="mx-6 flex min-h-[80vh] flex-col rounded-2xl bg-slate-900 p-6 text-white"
    >
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold tracking-tight">Queue Monitor</h2>
          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${STATE_BADGE[state].cls}`}>
            <span className={`h-2 w-2 rounded-full bg-current ${state === "live" ? "animate-pulse" : ""}`} />
            {STATE_BADGE[state].label}
          </span>
        </div>
        <div className="flex items-center gap-4 text-slate-300">
          <span className="tabular-nums text-xl">{now.toLocaleTimeString()}</span>
          <button
            onClick={() =>
              document.fullscreenElement ? document.exitFullscreen() : screenRef.current?.requestFullscreen()
            }
            className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm hover:bg-slate-800"
          >
            Fullscreen
          </button>
        </div>
      </header>

      {/* Dim the board when the feed is not live, so nobody trusts stale numbers. */}
      <div className={`grid flex-1 gap-6 lg:grid-cols-2 ${stale ? "opacity-50" : ""}`}>
        {SERVICE_COLUMNS.map((col) => {
          const { serving, waiting, done } = byType[col.type];
          return (
            <section key={col.type} className="flex flex-col rounded-xl bg-slate-800/70 p-5">
              <div className="mb-4 flex items-baseline justify-between">
                <h3 className="text-xl font-semibold">{col.title}</h3>
                <span className="text-sm text-slate-400">
                  {waiting.length} waiting · {done} done today
                </span>
              </div>

              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-emerald-300">Now serving</p>
              {serving.length === 0 ? (
                <p className="mb-6 rounded-lg border border-dashed border-slate-600 p-5 text-center text-slate-500">
                  No one is being served
                </p>
              ) : (
                <div className="mb-6 grid gap-3">
                  {serving.map((e) => (
                    <div key={e.queue_id} className="flex items-center justify-between rounded-lg bg-emerald-500/15 p-4 ring-1 ring-emerald-400/40">
                      <div>
                        <p className="text-4xl font-black tabular-nums">{e.queue_id}</p>
                        <p className="text-slate-300">{e.display_name}</p>
                      </div>
                      {e.room && <p className="text-right text-lg text-emerald-200">{e.room}</p>}
                    </div>
                  ))}
                </div>
              )}

              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">Next in line</p>
              {waiting.length === 0 ? (
                <p className="text-slate-500">Queue is empty</p>
              ) : (
                <ol className="space-y-2">
                  {waiting.slice(0, NEXT_IN_LINE).map((e) => (
                    <li key={e.queue_id} className="flex items-center justify-between rounded-lg bg-slate-700/50 px-4 py-2.5">
                      <span className="text-xl font-bold tabular-nums">{e.queue_id}</span>
                      <span className="flex items-center gap-3 text-slate-300">
                        {e.status === "skipped" && <span className="text-xs text-amber-300">skipped</span>}
                        {e.is_priority && (
                          <span className="rounded bg-red-500/20 px-2 py-0.5 text-xs font-semibold text-red-300">PRIORITY</span>
                        )}
                        {e.display_name}
                      </span>
                    </li>
                  ))}
                  {waiting.length > NEXT_IN_LINE && (
                    <li className="px-4 text-sm text-slate-500">+{waiting.length - NEXT_IN_LINE} more</li>
                  )}
                </ol>
              )}
            </section>
          );
        })}
      </div>

      <footer className="mt-4 text-right text-xs text-slate-500">
        {lastUpdated ? `Last update ${lastUpdated.toLocaleTimeString()}` : "Waiting for first update…"}
      </footer>
    </div>
  );
}

export default QueueingMonitor;