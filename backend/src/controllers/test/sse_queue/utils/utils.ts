import type { Response } from "express";
type User = {
  user_id: number;
  name: string;
  email: string;
  role: string;
};
const clients = new Map<Response, User>();

export async function addClient(res: Response, user: User) {}

export async function sendData(data: any) {
  for (const [client, user] of clients) {
    client.write(`data: ${JSON.stringify({ data })}`);
  }
}
