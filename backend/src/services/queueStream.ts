import type { Request, Response } from "express";
import { fetchQueueSnapshot } from "./queueSnapshot.js";

/**
 * SSE hub for the queue monitor.
 *
 *   controller mutates queue_entries
 *        └─> publishQueueChange()          (debounced)
 *              └─> fetchQueueSnapshot()    (ONE query, however many screens)
 *                    └─> res.write(frame)  (to every connected monitor)
 *
 * Design choices:
 *  - We push a FULL SNAPSHOT, not deltas. Today's queue is tiny, and a
 *    snapshot is self-healing: a missed message can never leave a screen wrong.
 *  - State lives in this process's memory => ONE server instance only.
 */

const MAX_CLIENTS = 50;          // safety cap; each client is an open socket
const HEARTBEAT_MS = 25_000;     // keeps proxies from closing an "idle" stream
const DEBOUNCE_MS = 150;         // coalesce bursts (serve = several UPDATEs)
const MAX_BUFFERED_BYTES = 1_000_000; // drop clients that can't keep up

type Client = { id: number; res: Response; connectedAt: number };

const clients = new Set<Client>();
let nextClientId = 1;
let eventId = 0;
let debounceTimer: NodeJS.Timeout | null = null;
let heartbeatTimer: NodeJS.Timeout | null = null;

function frame(event: string, data: unknown) {
  return `id: ${++eventId}\nevent: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

function send(client: Client, payload: string) {
  if (client.res.writableLength > MAX_BUFFERED_BYTES) {
    client.res.destroy(); // slow/dead consumer: free the memory, it will reconnect
    return;
  }
  client.res.write(payload);
}

function startHeartbeat() {
  if (heartbeatTimer) return;
  heartbeatTimer = setInterval(() => {
    // A real (named) event, not a ": comment", so the browser can see it and
    // run a watchdog. Comments are swallowed by SSE parsers.
    const ping = frame("ping", { t: Date.now() });
    for (const c of clients) send(c, ping);
  }, HEARTBEAT_MS);
  heartbeatTimer.unref();
}

function stopHeartbeatIfIdle() {
  if (clients.size === 0 && heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}

async function broadcastSnapshot() {
  if (clients.size === 0) return; // nobody watching => no DB query at all
  const queueEntries = await fetchQueueSnapshot();
  const payload = frame("snapshot", {
    queueEntries,
    serverTime: new Date().toISOString(),
  });
  for (const c of clients) send(c, payload);
}

/**
 * Call this AFTER a queue mutation has succeeded/committed.
 * Safe to call from anywhere, never throws, never blocks the HTTP response.
 */
export function publishQueueChange() {
  if (debounceTimer) return; // a broadcast is already scheduled
  debounceTimer = setTimeout(async () => {
    debounceTimer = null;
    try {
      await broadcastSnapshot();
    } catch (error) {
      console.error("[queue-sse] broadcast failed:", error);
    }
  }, DEBOUNCE_MS);
}

/** Express handler: GET /api/admin/queue/stream */
export async function streamQueue(req: Request, res: Response) {
  if (clients.size >= MAX_CLIENTS) {
    return res.status(503).json({ message: "Too many live monitors connected." });
  }

  res.status(200).set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no", // tell nginx-style proxies not to buffer the stream
  });
  res.flushHeaders();
  req.socket.setTimeout(0);    // never time out this socket
  req.socket.setNoDelay(true); // send each frame immediately

  const client: Client = { id: nextClientId++, res, connectedAt: Date.now() };
  clients.add(client);
  startHeartbeat();
  console.log(`[queue-sse] +client #${client.id} (total ${clients.size})`);

  req.on("close", () => {
    clients.delete(client);
    stopHeartbeatIfIdle();
    console.log(`[queue-sse] -client #${client.id} (total ${clients.size})`);
  });

  res.write("retry: 3000\n\n"); // browser-native reconnect delay hint

  // Every (re)connect starts with a full snapshot => screens always converge.
  try {
    const queueEntries = await fetchQueueSnapshot();
    send(client, frame("snapshot", { queueEntries, serverTime: new Date().toISOString() }));
  } catch (error) {
    console.error("[queue-sse] initial snapshot failed:", error);
    send(client, frame("server-error", { message: "Could not load queue." }));
  }
}

/** For health checks / an admin "how many screens are live" indicator. */
export function getQueueStreamStats() {
  return {
    clients: clients.size,
    connections: [...clients].map((c) => ({
      id: c.id,
      connectedForSec: Math.round((Date.now() - c.connectedAt) / 1000),
    })),
  };
}

/** Call on SIGTERM so deploys close streams cleanly instead of hanging. */
export function closeAllQueueStreams() {
  if (debounceTimer) clearTimeout(debounceTimer);
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  for (const c of clients) c.res.end();
  clients.clear();
}