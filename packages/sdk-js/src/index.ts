import { createHmac, timingSafeEqual } from "node:crypto";
import TOOL_SPECS from "./tools.json" with { type: "json" };

export const DEFAULT_BASE_URL = "https://sidequestpays.com";
const USER_AGENT = "sidequestpays-js/0.2.1";
const TERMINAL = new Set(["submitted", "approved", "paid", "disputed", "cancelled", "refunded"]);

export type Template = "verify_location" | "photo_proof" | "pickup_dropoff" | "inspect_item" | "phone_call" | "translation" | "check_ai_output" | "errand" | "online" | "be_present" | "video_capture";

export type ProofTemplate = "store_check" | "item_inspection" | "pickup_dropoff" | "phone_call";

export interface QuestDetails { instructions?: string; steps?: string[]; checklist?: string[]; address?: string; min_photos?: number; [k: string]: unknown }

export interface CreateQuestInput {
  confirm_accurate: true;
  template?: Template;
  proof_template?: ProofTemplate;
  max_total_usd?: number;
  title: string;
  reward_usd: number;
  details?: QuestDetails;
  lat?: number;
  lng?: number;
  zip?: string;
  country?: string;
  language?: string;
  funding?: "auto" | "balance" | "checkout";
  success_url?: string;
  cancel_url?: string;
  brief?: { what: string; where?: string; when?: string; which?: string; how: string; why?: string; who?: string; if_different?: string };
  expires_in_hours?: number;
  starts_at?: string;
  ends_at?: string;
  checkin_every_minutes?: number;
}

export interface Quest {
  id: string;
  template: Template;
  title: string;
  details: QuestDetails;
  remote: boolean;
  location: { lat: number; lng: number; zip: string | null } | null;
  country: string | null;
  language: string | null;
  reward_usd: number;
  fee_usd: number;
  total_usd: number;
  status: string;
  funds_secured: boolean;
  quester_assigned: boolean;
  claim_expires_at: string | null;
  auto_approves_at: string | null;
  proof: { photo_urls?: string[]; notes?: string; checklist?: unknown; gps?: unknown; timestamp?: string; distance_from_quest_miles?: number } | null;
  quester_verdict: { verdict: "matches" | "doesnt_match" | "unsure"; reason: string | null } | null;
  dispute: { reason: string | null; by: string; deadline_at: string | null } | null;
  created_at: string;
  updated_at: string;
}

export interface ToolSpec { name: string; description: string; input_schema: Record<string, any>; read_only: boolean }

export const TOOLS: ToolSpec[] = TOOL_SPECS as ToolSpec[];

export class SideQuestError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(`${code}: ${message}`);
    this.name = "SideQuestError";
  }
}

export interface SideQuestOptions { apiKey?: string; baseUrl?: string; fetch?: typeof fetch }

const env = (k: string): string | undefined => (globalThis as any).process?.env?.[k];

export class SideQuest {
  readonly apiKey?: string;
  readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(opts: SideQuestOptions = {}) {
    this.apiKey = opts.apiKey ?? env("SIDEQUEST_API_KEY");
    this.baseUrl = (opts.baseUrl ?? env("SIDEQUEST_BASE_URL") ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.fetchImpl = opts.fetch ?? fetch;
  }

  private async request<T>(method: string, path: string, body?: Record<string, unknown>, query?: Record<string, unknown>, auth = true): Promise<T> {
    const url = new URL(this.baseUrl + path);
    for (const [k, v] of Object.entries(query ?? {})) if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    const headers: Record<string, string> = { accept: "application/json", "user-agent": USER_AGENT };
    if (auth) {
      if (!this.apiKey) throw new SideQuestError(401, "missing_api_key", "Set SIDEQUEST_API_KEY or pass apiKey. Get one with SideQuest.signup().");
      headers["x-api-key"] = this.apiKey;
    }
    let payload: string | undefined;
    if (body) {
      headers["content-type"] = "application/json";
      payload = JSON.stringify(Object.fromEntries(Object.entries(body).filter(([, v]) => v !== undefined && v !== null)));
    }
    let res: Response;
    try {
      res = await this.fetchImpl(url, { method, headers, body: payload });
    } catch (e) {
      throw new SideQuestError(0, "network_error", String((e as Error)?.message ?? e));
    }
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) throw new SideQuestError(res.status, data?.error?.code ?? "http_error", data?.error?.message ?? res.statusText);
    return data as T;
  }

  static signup(company: string, email: string, opts: SideQuestOptions = {}) {
    return new SideQuest({ ...opts, apiKey: "" }).request<{ api_key: string; requester_id: string; limits: unknown; note: string }>("POST", "/v1/requesters", { company, email }, undefined, false);
  }

  static confirmSignup(email: string, code: string, opts: SideQuestOptions = {}) {
    return new SideQuest({ ...opts, apiKey: "" }).request<{ confirmed: boolean; requester_id: string }>("POST", "/v1/requesters/confirm", { email, code }, undefined, false);
  }

  static resendConfirmation(email: string, opts: SideQuestOptions = {}) {
    return new SideQuest({ ...opts, apiKey: "" }).request<{ sent: boolean }>("POST", "/v1/requesters/resend", { email }, undefined, false);
  }

  templates() { return this.request<Array<{ id: Template; name: string; remote: boolean }>>("GET", "/v1/templates", undefined, undefined, false); }
  proofTemplates() { return this.request<Array<{ id: ProofTemplate; name: string; template: Template; checklist: string[]; proof: { photos: number; recording: boolean } }>>("GET", "/v1/proof-templates", undefined, undefined, false); }
  balance() { return this.request<{ balance_usd: number; [k: string]: unknown }>("GET", "/v1/balance"); }
  topUp(amount_usd: number) { return this.request<{ checkout_url: string; amount_usd: number }>("POST", "/v1/balance/topup", { amount_usd }); }
  createQuest(input: CreateQuestInput) { return this.request<{ quest: Quest; checkout_url?: string; listing_url?: string; balance_usd?: number; next: string }>("POST", "/v1/quests", { ...input }); }
  getQuest(id: string) { return this.request<Quest>("GET", `/v1/quests/${encodeURIComponent(id)}`); }
  listQuests(opts: { status?: string; limit?: number } = {}) { return this.request<Quest[]>("GET", "/v1/quests", undefined, opts); }
  approveQuest(id: string, rating?: number) { return this.request<Quest>("POST", `/v1/quests/${encodeURIComponent(id)}/approve`, { rating }); }
  disputeQuest(id: string, reason: string) { return this.request<Quest>("POST", `/v1/quests/${encodeURIComponent(id)}/dispute`, { reason }); }
  cancelQuest(id: string) { return this.request<Quest>("POST", `/v1/quests/${encodeURIComponent(id)}/cancel`, {}); }
  setWebhook(url: string) { return this.request<{ url: string; secret: string }>("PUT", "/v1/webhook", { url }); }

  async waitForQuest(id: string, opts: { timeoutMs?: number; pollMs?: number } = {}): Promise<Quest> {
    const deadline = Date.now() + (opts.timeoutMs ?? 86_400_000);
    for (;;) {
      const q = await this.getQuest(id);
      if (TERMINAL.has(q.status) || Date.now() >= deadline) return q;
      await new Promise((r) => setTimeout(r, opts.pollMs ?? 60_000));
    }
  }
}

export async function runTool(client: SideQuest, name: string, args: Record<string, any> = {}): Promise<string> {
  try {
    const need = (k: string) => {
      if (args[k] === undefined || args[k] === null || args[k] === "") throw new SideQuestError(400, "missing_argument", `${k} is required`);
      return args[k];
    };
    let out: unknown;
    switch (name) {
      case "list_templates": out = { templates: await client.templates(), proof_templates: await client.proofTemplates() }; break;
      case "create_quest": out = await client.createQuest(args as CreateQuestInput); break;
      case "get_balance": out = await client.balance(); break;
      case "get_quest": out = await client.getQuest(need("quest_id")); break;
      case "list_quests": out = await client.listQuests({ status: args.status, limit: args.limit }); break;
      case "approve_quest": out = await client.approveQuest(need("quest_id"), args.rating); break;
      case "dispute_quest": out = await client.disputeQuest(need("quest_id"), need("reason")); break;
      case "cancel_quest": out = await client.cancelQuest(need("quest_id")); break;
      default: return JSON.stringify({ error: { code: "unknown_tool", message: name } });
    }
    return JSON.stringify(out);
  } catch (e) {
    if (e instanceof SideQuestError) return JSON.stringify({ error: { code: e.code, message: e.message.replace(`${e.code}: `, "") } });
    throw e;
  }
}

export function openaiTools(opts: { readOnly?: boolean } = {}) {
  return TOOLS.filter((t) => !opts.readOnly || t.read_only).map((t) => ({ type: "function" as const, function: { name: t.name, description: t.description, parameters: t.input_schema } }));
}

export function anthropicTools(opts: { readOnly?: boolean } = {}) {
  return TOOLS.filter((t) => !opts.readOnly || t.read_only).map((t) => ({ name: t.name, description: t.description, input_schema: t.input_schema }));
}

export function verifyWebhook(rawBody: string, signatureHeader: string | null | undefined, secret: string, toleranceSeconds = 300): boolean {
  if (!signatureHeader || !secret) return false;
  const parts = Object.fromEntries(signatureHeader.split(",").map((p) => p.split("=", 2)));
  const t = parts.t, v1 = parts.v1;
  if (!t || !v1 || !/^\d+$/.test(t)) return false;
  if (Math.abs(Math.floor(Date.now() / 1000) - Number(t)) > toleranceSeconds) return false;
  const expected = createHmac("sha256", secret).update(`${t}.${rawBody}`).digest("hex");
  const a = Buffer.from(expected), b = Buffer.from(v1);
  return a.length === b.length && timingSafeEqual(a, b);
}
