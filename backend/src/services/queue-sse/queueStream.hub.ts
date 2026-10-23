import type { Request, Response } from "express";

// ============================================================================
// THE "HUB": keeps track of every connected Queue Monitor and tells them
// when the queue changed.
//
// IMPORTANT: SSE does NOT send the queue data. It only sends a tiny message:
// "the queue changed". The Queue Monitor then reloads the data by itself using
// the normal REST API (GET /api/admin/queues).
//
//   1. A Queue Monitor page opens ONE long-lived connection to the backend.
//      We keep that connection (the "res") in the `screens` list below.
//   2. Whenever a controller changes queue_entries, it calls
//      publishQueueChange().
//   3. publishQueueChange() sends a "queue-changed" message to every screen.
//   4. Each screen reloads the queue from the REST API. No page refresh.
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
// UPDATEs), we wait this long and send ONE "queue-changed" instead of many.
// That way the screens reload the queue once, not many times.
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
//   event: queue-changed
//   data: {...}
//   (blank line = end of message)
function buildMessage(eventName: string, data: unknown) {
  messageCount++;
  return `id: ${messageCount}\nevent: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
}

// Writes one message to every connected screen.
function sendToAllScreens(message: string) {
  for (const screen of screens) {
    try {
      screen.res.write(message);
    } catch (error) {
      // One broken connection must not stop the others from getting the message.
      console.error(`[queue-sse] could not write to screen #${screen.id}:`, error);
    }
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
// *** THIS IS THE FUNCTION CONTROLLERS CALL. ***
// Call it AFTER a change to queue_entries has succeeded (after COMMIT if you
// use a transaction), so we never announce something that got rolled back.
// It does not read the database and it does not slow down the HTTP response.
// ----------------------------------------------------------------------------
export function publishQueueChange() {
  // A message is already scheduled, it covers this change too.
  if (waitTimer) return;

  waitTimer = setTimeout(() => {
    waitTimer = null;

    // Nobody is watching, nothing to send.
    if (screens.size === 0) return;

    // Only a signal, no queue data. Each screen reloads the queue by itself.
    sendToAllScreens(
      buildMessage("queue-changed", { changedAt: new Date().toISOString() }),
    );
  }, WAIT_BEFORE_SENDING_MS);
}
