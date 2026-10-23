import type { Request, Response } from "express";
import { getQueueMonitorEntries } from "./queueMonitor.query.js";

// ============================================================================
// THE "HUB": keeps track of every connected Queue Monitor and sends them data.
//
//   1. A Queue Monitor page opens ONE long-lived connection to the backend.
//      We keep that connection (the "res") in the `screens` list below.
//   2. Whenever a controller changes queue_entries, it calls
//      publishQueueChange().
//   3. publishQueueChange() reads today's queue ONCE from the database and
//      writes the result to every connected screen.
//   4. The screen replaces its data. No page refresh, no polling.
//
// NOTE: `screens` lives in this server's memory, so this only works while
// there is ONE backend instance running.
// ============================================================================

// How many Queue Monitors can be connected at the same time.
const MAX_SCREENS = 50;

// How often (in milliseconds) we send a "ping". It stops proxies from closing
// the connection because they think nobody is using it.
const PING_EVERY_MS = 25_000;

// If many changes happen almost at once (serving a patient runs several
// UPDATEs), we wait this long and send ONE update instead of many.
const WAIT_BEFORE_SENDING_MS = 150;

// One connected Queue Monitor = one open response.
export type QueueScreen = {
  id: number;
  res: Response;
  connectedAt: number;
};

const screens = new Set<QueueScreen>();
let nextScreenId = 1;
let messageCount = 0; // used as the SSE message id
let waitTimer: NodeJS.Timeout | null = null;
let pingTimer: NodeJS.Timeout | null = null;

// Turns an event name + data into the text format SSE requires:
//   id: 1
//   event: snapshot
//   data: {...}
//   (blank line = end of message)
function buildMessage(eventName: string, data: unknown) {
  messageCount++;
  return `id: ${messageCount}\nevent: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
}

// Writes one message to every connected screen.
function sendToAllScreens(message: string) {
  for (const screen of screens) {
    screen.res.write(message);
  }
}

// Starts the ping timer (only if it is not running yet).
function startPinging() {
  if (pingTimer) return;

  pingTimer = setInterval(() => {
    // The frontend uses this ping to know the connection is still alive.
    sendToAllScreens(buildMessage("ping", { time: Date.now() }));
  }, PING_EVERY_MS);

  // unref() = this timer alone will not keep the server from shutting down.
  pingTimer.unref();
}

// Stops the ping timer when nobody is connected anymore.
function stopPingingIfNoScreens() {
  if (screens.size === 0 && pingTimer) {
    clearInterval(pingTimer);
    pingTimer = null;
  }
}

// ----------------------------------------------------------------------------
// Used by the streamQueue handler when a Queue Monitor connects.
// Returns the new screen, or null if there are already too many connected.
// ----------------------------------------------------------------------------
export function openQueueStream(req: Request, res: Response): QueueScreen | null {
  // 1. don't accept more screens than we allow
  if (screens.size >= MAX_SCREENS) return null;

  // 2. these headers turn a normal response into a live stream
  res.status(200).set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no", // tells proxies not to hold back (buffer) the stream
  });
  res.flushHeaders(); // send the headers right now, don't wait for data

  // 3. keep the connection open: no socket timeout, send every message immediately
  req.socket.setTimeout(0);
  req.socket.setNoDelay(true);

  // 4. remember this screen
  const screen: QueueScreen = {
    id: nextScreenId++,
    res,
    connectedAt: Date.now(),
  };
  screens.add(screen);
  startPinging();
  console.log(`[queue-sse] screen #${screen.id} connected (total: ${screens.size})`);

  // 5. when the browser closes the tab / loses connection, forget this screen
  req.on("close", () => {
    screens.delete(screen);
    stopPingingIfNoScreens();
    console.log(`[queue-sse] screen #${screen.id} left (total: ${screens.size})`);
  });

  // 6. tell the browser to wait 3 seconds before reconnecting if it drops
  res.write("retry: 3000\n\n");

  return screen;
}

// ----------------------------------------------------------------------------
// Sends today's queue to ONE screen. Used right after it connects, so a screen
// never starts empty (and never stays wrong after a reconnect).
// ----------------------------------------------------------------------------
export async function sendQueueSnapshot(screen: QueueScreen) {
  try {
    const queueEntries = await getQueueMonitorEntries();
    screen.res.write(buildMessage("snapshot", { queueEntries }));
  } catch (error) {
    console.error("[queue-sse] could not load the first snapshot:", error);
    screen.res.write(buildMessage("server-error", { message: "Could not load queue." }));
  }
}

// ----------------------------------------------------------------------------
// *** THIS IS THE FUNCTION CONTROLLERS CALL. ***
// Call it AFTER a change to queue_entries has succeeded (after COMMIT if you
// use a transaction), so we never announce something that got rolled back.
// It never throws and it does not slow down the HTTP response.
// ----------------------------------------------------------------------------
export function publishQueueChange() {
  // A send is already scheduled, it will include this change too.
  if (waitTimer) return;

  waitTimer = setTimeout(async () => {
    waitTimer = null;

    // Nobody is watching, so skip the database query completely.
    if (screens.size === 0) return;

    try {
      // 1. read today's queue ONCE
      const queueEntries = await getQueueMonitorEntries();

      // 2. send the same data to every screen
      sendToAllScreens(buildMessage("snapshot", { queueEntries }));
    } catch (error) {
      console.error("[queue-sse] could not send the update:", error);
    }
  }, WAIT_BEFORE_SENDING_MS);
}

// Info for the /queue/stream/stats route (how many screens are connected).
export function getConnectedScreens() {
  return [...screens].map((screen) => ({
    id: screen.id,
    connectedForSeconds: Math.round((Date.now() - screen.connectedAt) / 1000),
  }));
}

// Called from server.ts when the server shuts down (example: a Render deploy).
// Without this, the shutdown would wait forever on connections that never end.
export function closeAllQueueStreams() {
  if (waitTimer) clearTimeout(waitTimer);
  if (pingTimer) clearInterval(pingTimer);

  for (const screen of screens) {
    screen.res.end();
  }
  screens.clear();
}