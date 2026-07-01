import { Server } from "http";
import { IncomingMessage } from "http";
import { WebSocketServer, WebSocket, RawData } from "ws";

export let wss: WebSocketServer;

export function initializeWebSocket(server: Server) {
  wss = new WebSocketServer({ server });

  wss.on("connection", (socket: WebSocket, request: IncomingMessage) => {
    const ip = request.socket.remoteAddress ?? "Unknown";

    socket.on("message", (rawData: RawData) => {
      const message = rawData.toString();

      console.log({
        message,
        byte_codes: rawData,
        ip,
      });

      wss.clients.forEach((client: WebSocket) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(`${message} from web socket`);
        }
      });
    });

    socket.on("error", (err: Error) => {
      console.error(`WebSocket error: ${err.message} : ${ip}`);
    });

    socket.on("close", (code: number, reason: Buffer) => {
      console.log(`WebSocket closed: ${code} - ${reason.toString()} : ${ip}`);
    });
  });

  console.log("WebSocket initialized");
}