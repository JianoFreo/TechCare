import { useEffect, useRef, useState } from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import api from "../../../lib/axios";
import QueueColumn from "../components/QueueMonitor/QueueColumn";
import type {
  QueueMonitorEntry,
  QueueStreamStatus,
} from "../../../interface/Queue";

// Admin.tsx still passes these props, but this page no longer needs them:
// the data now comes from the live connection (SSE), not from loadData().
type QueueingMonitorProps = {
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  loadData?: () => Promise<void>;
  loading?: boolean;
};

// The backend route that keeps the connection open (admin.route.ts).
const STREAM_URL = "/api/admin/queue/stream";

// The backend sends a "ping" every 25 seconds. If we hear NOTHING for this
// long (in milliseconds), the connection is probably dead, so we reconnect.
const SILENCE_LIMIT_MS = 65_000;

// The longest we wait before trying to reconnect (in milliseconds).
const MAX_RETRY_WAIT_MS = 15_000;

// Label + color of the badge for each connection status.
const STATUS_BADGE: Record<QueueStreamStatus, { label: string; style: string }> = {
  connecting: { label: "Connecting…", style: "bg-amber-500/20 text-amber-300" },
  live: { label: "Live", style: "bg-emerald-500/20 text-emerald-300" },
  reconnecting: { label: "Reconnecting…", style: "bg-amber-500/20 text-amber-300" },
  unauthorized: {
    label: "Session expired — log in again",
    style: "bg-red-500/20 text-red-300",
  },
};

// Used to stop retrying when retrying can't help (example: bad token).
class StopRetryingError extends Error {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function QueueingMonitor(_props: QueueingMonitorProps) {
  const [queueEntries, setQueueEntries] = useState<QueueMonitorEntry[]>([]);
  const [status, setStatus] = useState<QueueStreamStatus>("connecting");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Changing this number makes the useEffect below run again,
  // which closes the old connection and opens a new one.
  const [connectionNumber, setConnectionNumber] = useState(0);

  // The last time we heard ANYTHING from the backend (update or ping).
  // Starts at 0; the connection useEffect below sets the real time when it opens.
  const lastHeardAt = useRef(0);

  // Used for the Fullscreen button.
  const screenRef = useRef<HTMLDivElement>(null);

  // Live clock in the header.
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // THE LIVE CONNECTION
  // Opens when the page opens, closes when the page closes.
  useEffect(() => {
    const controller = new AbortController(); // used to close the connection
    let failedAttempts = 0;
    lastHeardAt.current = Date.now();

    // Safety check every 10 seconds: a connection can look open but be dead.
    // If we haven't heard anything for too long, start a new connection.
    const silenceChecker = setInterval(() => {
      if (Date.now() - lastHeardAt.current > SILENCE_LIMIT_MS) {
        setStatus("reconnecting");
        setConnectionNumber((number) => number + 1);
      }
    }, 10_000);

    // We use fetchEventSource instead of the browser's EventSource because
    // EventSource can't send the Authorization header, and our backend
    // needs the token (authMiddleware + adminMiddleware).
    fetchEventSource(`${api.defaults.baseURL ?? ""}${STREAM_URL}`, {
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token") ?? ""}`,
      },

      // IMPORTANT: keep receiving updates even if this browser tab is in the
      // background (a monitor/TV tab is often not the active tab).
      openWhenHidden: true,

      // The backend answered. Is it really the live stream?
      async onopen(response) {
        const isStream = response.headers
          .get("content-type")
          ?.startsWith("text/event-stream");

        // 1. all good
        if (response.ok && isStream) {
          failedAttempts = 0;
          lastHeardAt.current = Date.now();
          setStatus("live");
          return;
        }

        // 2. wrong/expired token: retrying will not fix it, so stop
        if (response.status === 401 || response.status === 403) {
          setStatus("unauthorized");
          throw new StopRetryingError("Not authorized");
        }

        // 3. anything else (500, 503...): throw a normal error so it retries
        throw new Error(`Unexpected response: ${response.status}`);
      },

      // The backend sent a message.
      onmessage(message) {
        lastHeardAt.current = Date.now();

        // "snapshot" = the full queue for today, replace what we have.
        // ("ping" only proves the connection is alive, nothing to do.)
        if (message.event === "snapshot") {
          const data = JSON.parse(message.data) as {
            queueEntries: QueueMonitorEntry[];
          };
          setQueueEntries(data.queueEntries);
          setLastUpdated(new Date());
        }
      },

      // The backend closed the connection (example: it restarted).
      // Throwing here makes fetchEventSource reconnect.
      onclose() {
        throw new Error("Connection closed by the backend");
      },

      // Something failed. Whatever we RETURN is how many milliseconds
      // to wait before trying again.
      onerror(error) {
        if (error instanceof StopRetryingError) throw error; // stop for good

        setStatus("reconnecting");
        failedAttempts++;

        // wait 2s, 4s, 8s, 15s, 15s... (doubles each time, with a limit)
        return Math.min(1000 * 2 ** failedAttempts, MAX_RETRY_WAIT_MS);
      },
    }).catch(() => {
      // StopRetryingError ends up here. The status badge is already updated.
    });

    // Cleanup: close the connection when leaving the page.
    return () => {
      clearInterval(silenceChecker);
      controller.abort();
    };
  }, [connectionNumber]);

  function handleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      screenRef.current?.requestFullscreen();
    }
  }

  // Fade the board when we are not live so nobody trusts old numbers.
  const isLive = status === "live";

  return (
    <div
      ref={screenRef}
      className="mx-6 flex min-h-[80vh] flex-col rounded-2xl bg-slate-900 p-6 text-white"
    >
      {/* HEADER: title, connection badge, clock, fullscreen */}
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold tracking-tight">Queue Monitor</h2>
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${STATUS_BADGE[status].style}`}
          >
            <span
              className={`h-2 w-2 rounded-full bg-current ${isLive ? "animate-pulse" : ""}`}
            />
            {STATUS_BADGE[status].label}
          </span>
        </div>

        <div className="flex items-center gap-4 text-slate-300">
          <span className="text-xl tabular-nums">
            {currentTime.toLocaleTimeString()}
          </span>
          <button
            onClick={handleFullscreen}
            className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm hover:bg-slate-800"
          >
            Fullscreen
          </button>
        </div>
      </header>

      {/* BOARD: one column per service type */}
      <div className={`grid flex-1 gap-6 lg:grid-cols-2 ${isLive ? "" : "opacity-50"}`}>
        <QueueColumn
          title="Consultation"
          entries={queueEntries.filter((entry) => entry.service_type === "consultation")}
        />
        <QueueColumn
          title="Laboratory"
          entries={queueEntries.filter((entry) => entry.service_type === "laboratory")}
        />
      </div>

      <footer className="mt-4 text-right text-xs text-slate-500">
        {lastUpdated
          ? `Last update ${lastUpdated.toLocaleTimeString()}`
          : "Waiting for first update…"}
      </footer>
    </div>
  );
}

export default QueueingMonitor;