import { EventEmitter } from "events";

// A singleton event emitter to bridge the incoming webhook POST requests 
// and the outgoing SSE stream.
class GlobalEventEmitter extends EventEmitter {}

const globalEvents = new GlobalEventEmitter();

// Limit listeners to prevent memory leaks in dev
globalEvents.setMaxListeners(20);

export default globalEvents;
