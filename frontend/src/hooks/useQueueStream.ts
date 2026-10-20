import { useEffect, useRef, useState } from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import api from "../lib/axios";

/** Mirrors backend/src/services/queueSnapshot.ts -> MonitorEntry */
export type MonitorEntry = {
  queue_id: string;
  queue_number: number;
  service_name: string;
  service_type: "consultation" | "laboratory" | string;
  room: string | null;
  is_priority: boolean;
  status: "waiting" | "serving" | "skipped" | "completed" | "cancelled" | string;
  display_name: string;
  updated_at: string;
};

export type StreamState = "connecting" | "live" | "reconnecting" | "unauthorized";

const STREAM_PATH = "/api/admin/queue/stream";
const WATCHDOG_MS = 65_000; // server pings every 25s; 2+ missed pings => connection is dead
const MAX_BACKOFF_MS = 15_000;

class FatalError extends Error {}

export function useQueueStream() {
  const [entries, setEntries] = useState<MonitorEntry[]>([]);
  const [state, setState] = useState<StreamState>("connecting");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [epoch, setEpoch] = useState(0); // bump to force a fresh connection
  const lastMessageAt = useRef(Date.now());

  useEffect(() => {
    const controller = new AbortController();
    let attempt = 0;
    lastMessageAt.current = Date.now();

    // Watchdog: half-open TCP connections look "connected" forever. If the
    // server's ping stops arriving, tear down and reconnect ourselves.
    const watchdog = setInterval(() => {
      if (Date.now() - lastMessageAt.current > WATCHDOG_MS) {
        setState("reconnecting");
        setEpoch((e) => e + 1);
      }
    }, 10_000);

    fetchEventSource(`${api.defaults.baseURL ?? ""}${STREAM_PATH}`, {
      signal: controller.signal,
      headers: { Authorization: `Bearer ${sessionStorage.getItem("token") ?? ""}` },
      openWhenHidden: true, // a TV tab is often "hidden"/backgrounded; keep streaming anyway

      async onopen(res) {
        const isStream = res.headers.get("content-type")?.startsWith("text/event-stream");
        if (res.ok && isStream) {
          attempt = 0;
          lastMessageAt.current = Date.now();
          setState("live");
          return;
        }
        if (res.status === 401 || res.status === 403) {
          setState("unauthorized");
          throw new FatalError("Not authorized"); // retrying can't fix a bad token
        }
        throw new Error(`Unexpected response ${res.status}`); // 5xx/503: retry
      },

      onmessage(ev) {
        lastMessageAt.current = Date.now();
        if (ev.event === "snapshot") {
          const data = JSON.parse(ev.data) as { queueEntries: MonitorEntry[] };
          setEntries(data.queueEntries);
          setLastUpdated(new Date());
        }
        // "ping" only refreshes the watchdog; "server-error" is non-fatal.
      },

      onclose() {
        throw new Error("Stream closed by server"); // treat as retriable
      },

      onerror(err) {
        if (err instanceof FatalError) throw err; // stop retrying
        setState("reconnecting");
        attempt += 1;
        return Math.min(1000 * 2 ** attempt, MAX_BACKOFF_MS); // exponential backoff
      },
    }).catch(() => {
      /* FatalError lands here; state already set */
    });

    return () => {
      clearInterval(watchdog);
      controller.abort(); // closes the HTTP connection => server drops the client
    };
  }, [epoch]);

  return { entries, state, lastUpdated };
}