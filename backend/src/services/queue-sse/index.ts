// ============================================================================
// QUEUE MONITOR (SSE) - PUBLIC ENTRY POINT
//
// Everything about the live Queue Monitor lives in this folder:
//
//   queueMonitor.query.ts     -> the SQL that reads today's queue
//   queueStream.hub.ts        -> keeps the connected screens + sends data to them
//   queueStream.handlers.ts   -> the Express handlers for the SSE routes
//   index.ts                  -> (this file) the only thing the rest of the
//                                backend should import from
//
// The rest of the API only needs to know about 4 things:
// ============================================================================

// Call this in a controller AFTER it changes queue_entries.
export { publishQueueChange } from "./queueStream.hub.js";

// Used by admin.route.ts: the route the Queue Monitor page connects to.
export { streamQueue, getQueueStreamStats } from "./queueStream.handlers.js";

// Used by server.ts: closes the connections when the server shuts down.
export { closeAllQueueStreams } from "./queueStream.hub.js";