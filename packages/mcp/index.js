#!/usr/bin/env node
import { createInterface } from "node:readline";

const URL_ = process.env.SIDEQUEST_MCP_URL || "https://sidequestpays.com/mcp";
const KEY = (process.env.SIDEQUEST_API_KEY || "").trim();
const VERSION = "1.0.0";

const write = (msg) => process.stdout.write(JSON.stringify(msg) + "\n");
const log = (...a) => process.stderr.write("[sidequestpays-mcp] " + a.join(" ") + "\n");

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  process.stderr.write(`sidequestpays-mcp ${VERSION}
SideQuest MCP server over stdio. Set SIDEQUEST_API_KEY (get one at https://sidequestpays.com/post > Account > API keys).
Config: { "command": "npx", "args": ["-y", "sidequestpays-mcp"], "env": { "SIDEQUEST_API_KEY": "sq_live_..." } }
Remote alternative with email sign-in: https://sidequestpays.com/mcp
`);
  process.exit(0);
}
if (!KEY) log("SIDEQUEST_API_KEY is not set. Tool calls will fail until you add it. Get a key at https://sidequestpays.com/post (Account > API keys).");

let session = null;

async function forward(msg) {
  const headers = { "content-type": "application/json", accept: "application/json, text/event-stream", "user-agent": "sidequestpays-mcp/" + VERSION };
  if (KEY) headers["x-api-key"] = KEY;
  if (session) headers["mcp-session-id"] = session;
  let res;
  try {
    res = await fetch(URL_, { method: "POST", headers, body: JSON.stringify(msg) });
  } catch (e) {
    return errorFor(msg, -32000, "Couldn't reach SideQuest: " + (e && e.message ? e.message : String(e)));
  }
  const sid = res.headers.get("mcp-session-id");
  if (sid) session = sid;
  if (res.status === 202) return null;
  const text = await res.text();
  if (res.status === 401) return errorFor(msg, -32001, "SideQuest rejected the API key. Set SIDEQUEST_API_KEY to a valid key from https://sidequestpays.com/post (Account > API keys).");
  const type = res.headers.get("content-type") || "";
  if (type.includes("text/event-stream")) {
    const out = [];
    for (const line of text.split("\n")) if (line.startsWith("data:")) {
      try { out.push(JSON.parse(line.slice(5).trim())); } catch {}
    }
    return out.length === 1 ? out[0] : out.length ? out : null;
  }
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return errorFor(msg, -32000, `SideQuest returned HTTP ${res.status}.`);
  }
}

function errorFor(msg, code, message) {
  if (Array.isArray(msg)) return msg.filter((m) => m && m.id !== undefined).map((m) => ({ jsonrpc: "2.0", id: m.id, error: { code, message } }));
  if (!msg || msg.id === undefined) return null;
  return { jsonrpc: "2.0", id: msg.id, error: { code, message } };
}

const rl = createInterface({ input: process.stdin, crlfDelay: Infinity });
let queue = Promise.resolve();
rl.on("line", (line) => {
  if (!line.trim()) return;
  queue = queue.then(async () => {
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      write({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } });
      return;
    }
    const out = await forward(msg);
    if (Array.isArray(out)) out.forEach((m) => m && write(m));
    else if (out) write(out);
  });
});
rl.on("close", () => {
  queue.then(() => process.exit(0));
});
