// ============================================================================
// QUEUE MONITOR (SSE) - PUBLIC ENTRY POINT
//
// SSE here only TELLS the Queue Monitor that the queue changed.
// The Queue Monitor then reloads the data from the normal REST API.
//
// Everything about that signal lives in this folder:
//
//   queueStream.hub.ts        -> keeps the connected screens + sends "queue-changed"
//   queueStream.handlers.ts   -> the Express handler for the SSE route
//   index.ts                  -> (this file) the only thing the rest of the
//                                backend should import from
//
// The rest of the API only needs to know about 2 things:
// ============================================================================

// Call this in a controller AFTER it changes queue_entries.
export { publishQueueChange } from "./queueStream.hub.js";

// Used by admin.route.ts: the route the Queue Monitor page connects to.
export { streamQueue } from "./queueStream.handlers.js";
