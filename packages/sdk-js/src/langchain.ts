import { tool } from "@langchain/core/tools";
import { SideQuest, TOOLS, runTool } from "./index.js";

/** SideQuest tools for LangChain.js and LangGraph.js: model.bindTools(sidequestTools()). */
export function sidequestTools(opts: { client?: SideQuest; readOnly?: boolean } = {}) {
  const client = opts.client ?? new SideQuest();
  return TOOLS.filter((t) => !opts.readOnly || t.read_only).map((t) =>
    tool(async (args: any) => runTool(client, t.name, args ?? {}), { name: t.name, description: t.description, schema: t.input_schema as any }),
  );
}
