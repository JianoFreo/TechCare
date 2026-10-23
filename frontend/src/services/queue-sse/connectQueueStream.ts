import { fetchEventSource } from "@microsoft/fetch-event-source";
import api from "../../lib/axios";
import type {
  QueueMonitorEntry,
  QueueStreamStatus,
} from "../../interface/Queue";

// ============================================================================
// FRONTEND SIDE OF THE QUEUE MONITOR (SSE)
//
// This file opens the live connection to the backend and keeps it alive.
// It is plain TypeScript (no React), so pages only have to say:
//   "call me when there is new data" and "call me when the status changes".
//
// The backend side of this lives in backend/src/services/queue-sse/
// ============================================================================

// The backend route that keeps the connection open (admin.route.ts).
const STREAM_URL = "/api/admin/queue/stream";

// The backend sends a "ping" every 25 seconds. If we hear NOTHING for this
// long (in milliseconds), the connection is probably dead, so we reconnect.
const SILENCE_LIMIT_MS = 65_000;

// How often we check for that silence (in milliseconds).
const SILENCE_CHECK_EVERY_MS = 10_000;

// The longest we wait before trying to reconnect (in milliseconds).
const MAX_RETRY_WAIT_MS = 15_000;

// Used to stop retrying when retrying can't help (example: bad token).
class StopRetryingError extends Error {}

type ConnectQueueStreamOptions = {
  // Called every time the backend sends the full queue.
  onSnapshot: (queueEntries: QueueMonitorEntry[]) => void;
  // Called when the connection status changes (live, reconnecting...).
  onStatusChange: (status: QueueStreamStatus) => void;
};

// Opens the live connection. Returns a function that closes it:
//   const close = connectQueueStream({ onSnapshot, onStatusChange });
//   close(); // when leaving the page
export function connectQueueStream({
  onSnapshot,
  onStatusChange,
}: ConnectQueueStreamOptions) {
  let controller: AbortController | null = null; // used to close the connection
  let lastHeardAt = Date.now(); // last time we heard ANYTHING (update or ping)
  let isClosed = false; // true after the page called close()
  let gaveUp = false; // true if the token is invalid (don't keep retrying)

  // Opens ONE connection. fetchEventSource retries by itself when it fails.
  function openConnection() {
    controller = new AbortController();
    let failedAttempts = 0;
    lastHeardAt = Date.now();

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
          lastHeardAt = Date.now();
          onStatusChange("live");
          return;
        }

        // 2. wrong/expired token: retrying will not fix it, so stop
        if (response.status === 401 || response.status === 403) {
          gaveUp = true;
          onStatusChange("unauthorized");
          throw new StopRetryingError("Not authorized");
        }

        // 3. anything else (500, 503...): throw a normal error so it retries
        throw new Error(`Unexpected response: ${response.status}`);
      },

      // The backend sent a message.
      onmessage(message) {
        lastHeardAt = Date.now();

        // "snapshot" = the full queue for today, replace what we have.
        // ("ping" only proves the connection is alive, nothing to do.)
        if (message.event === "snapshot") {
          const data = JSON.parse(message.data) as {
            queueEntries: QueueMonitorEntry[];
          };
          onSnapshot(data.queueEntries);
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

        onStatusChange("reconnecting");
        failedAttempts++;

        // wait 2s, 4s, 8s, 15s, 15s... (doubles each time, with a limit)
        return Math.min(1000 * 2 ** failedAttempts, MAX_RETRY_WAIT_MS);
      },
    }).catch(() => {
      // StopRetryingError ends up here. The status was already reported.
    });
  }

  // Safety check: a connection can look open but be dead.
  // If we haven't heard anything for too long, throw it away and start a new one.
  const silenceChecker = setInterval(() => {
    if (isClosed || gaveUp) return;

    if (Date.now() - lastHeardAt > SILENCE_LIMIT_MS) {
      onStatusChange("reconnecting");
      controller?.abort();
      openConnection();
    }
  }, SILENCE_CHECK_EVERY_MS);

  openConnection();

  // The "close" function the page calls when it is removed from the screen.
  return function closeQueueStream() {
    isClosed = true;
    clearInterval(silenceChecker);
    controller?.abort();
  };
}