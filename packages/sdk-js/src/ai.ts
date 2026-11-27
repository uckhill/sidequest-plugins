import { jsonSchema, tool } from "ai";
import { SideQuest, TOOLS, runTool } from "./index.js";

/** SideQuest tools for the Vercel AI SDK: generateText({ tools: sidequestTools() }). */
export function sidequestTools(opts: { client?: SideQuest; readOnly?: boolean } = {}) {
  const client = opts.client ?? new SideQuest();
  const out: Record<string, any> = {};
  for (const t of TOOLS) {
    if (opts.readOnly && !t.read_only) continue;
    const schema = jsonSchema(t.input_schema as any);
    out[t.name] = tool({
      description: t.description,
      inputSchema: schema,
      parameters: schema,
      execute: async (args: any) => JSON.parse(await runTool(client, t.name, args ?? {})),
    } as any);
  }
  return out;
}
