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
  status:
    | "waiting"
    | "serving"
    | "skipped"
    | "completed"
    | "cancelled"
    | string;
  display_name: string;
  updated_at: string;
};

export type StreamState =
  | "connecting"
  | "live"
  | "reconnecting"
  | "unauthorized";

const STREAM_PATH = "/api/admin/queue/stream";
const WATCHDOG_MS = 65_000;
const MAX_BACKOFF_MS = 15_000;

class FatalError extends Error {}

export function useQueueStream() {
  const [entries, setEntries] = useState<MonitorEntry[]>([]);
  const [state, setState] = useState<StreamState>("connecting");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [epoch, setEpoch] = useState(0);

  // Use a predictable initial value during render.
  const lastMessageAt = useRef(0);
  const reconnectingRef = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    let attempt = 0;
    let disposed = false;

    lastMessageAt.current = Date.now();
    reconnectingRef.current = false;

    const watchdog = setInterval(() => {
      if (
        !disposed &&
        !reconnectingRef.current &&
        Date.now() - lastMessageAt.current > WATCHDOG_MS
      ) {
        reconnectingRef.current = true;
        setState("reconnecting");
        setEpoch((current) => current + 1);
      }
    }, 10_000);

    fetchEventSource(
      `${api.defaults.baseURL ?? ""}${STREAM_PATH}`,
      {
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${
            sessionStorage.getItem("token") ?? ""
          }`,
        },
        openWhenHidden: true,

        async onopen(response) {
          const isStream = response.headers
            .get("content-type")
            ?.startsWith("text/event-stream");

          if (response.ok && isStream) {
            attempt = 0;
            lastMessageAt.current = Date.now();
            setState("live");
            return;
          }

          if (response.status === 401 || response.status === 403) {
            setState("unauthorized");
            throw new FatalError("Not authorized");
          }

          throw new Error(
            `Unexpected response ${response.status}`
          );
        },

        onmessage(event) {
          lastMessageAt.current = Date.now();

          if (event.event === "snapshot") {
            try {
              const data = JSON.parse(event.data) as {
                queueEntries: MonitorEntry[];
              };

              setEntries(data.queueEntries);
              setLastUpdated(new Date());
            } catch (error) {
              console.error(
                "Failed to parse queue snapshot:",
                error
              );
            }
          }

          // Ping events refresh the watchdog timestamp.
        },

        onclose() {
          throw new Error("Stream closed by server");
        },

        onerror(error) {
          if (error instanceof FatalError) {
            throw error;
          }

          if (!disposed) {
            setState("reconnecting");
          }

          attempt += 1;

          return Math.min(
            1000 * 2 ** attempt,
            MAX_BACKOFF_MS
          );
        },
      }
    ).catch((error: unknown) => {
      if (
        !disposed &&
        !(error instanceof FatalError) &&
        !controller.signal.aborted
      ) {
        console.error("Queue stream stopped:", error);
      }
    });

    return () => {
      disposed = true;
      clearInterval(watchdog);
      controller.abort();
    };
  }, [epoch]);

  return {
    entries,
    state,
    lastUpdated,
  };
}