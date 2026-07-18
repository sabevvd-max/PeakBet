import { createHmac } from "crypto";

const SECRET = process.env.ROUND_TOKEN_SECRET ?? "insecure-dev-secret";
const TTL_MS = 5 * 60 * 1000;

/**
 * Signs a small JSON payload (server seed, dealt cards, etc.) so it can be
 * safely round-tripped through the client between a "deal" and a "draw/settle"
 * request without any server-side session storage. The client cannot forge or
 * tamper with the payload since it doesn't know ROUND_TOKEN_SECRET.
 */
export function signRoundToken(payload: object): string {
  const body = Buffer.from(JSON.stringify({ ...payload, iat: Date.now() })).toString("base64url");
  const sig = createHmac("sha256", SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyRoundToken<T = Record<string, unknown>>(token: string): T {
  const [body, sig] = token.split(".");
  if (!body || !sig) throw new Error("Malformed round token");

  const expectedSig = createHmac("sha256", SECRET).update(body).digest("base64url");
  if (sig !== expectedSig) throw new Error("Invalid round token");

  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf-8")) as T & { iat: number };
  if (Date.now() - payload.iat > TTL_MS) throw new Error("Round token expired");

  return payload;
}
