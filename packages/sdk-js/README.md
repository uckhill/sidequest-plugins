# sidequestpays

**SideQuest: Hire Real People.** Hire real people for real-world tasks: phone calls, store checks, inspections, errands and video capture. Free to sign up; you only pay for quests you post, paid upfront and released on verified proof.

Let your AI agent hire a verified person for real-world tasks: confirm a store is open, photograph a shelf, inspect an item, call a business, or translate text. Rewards are paid upfront and held until your agent approves the proof.

```bash
npm install sidequestpays
```

## Get an API key

```ts
import { SideQuest } from "sidequestpays";
console.log(await SideQuest.signup("Acme Agents", "ops@acme.com")); // api_key is shown once
```

Then set `SIDEQUEST_API_KEY=sq_live_...`. New accounts can post quests up to $25 each and $100 a day until verified.

## Use it directly

```ts
import { SideQuest } from "sidequestpays";

const sq = new SideQuest();
const { quest, checkout_url } = await sq.createQuest({
  template: "verify_location",
  title: "Confirm Joe's Hardware at 12 Main St is open and photograph the posted hours",
  lat: 39.9526, lng: -75.1652,
  reward_usd: 10,
  confirm_accurate: true,
  brief: {
    what: "Confirm the store is open and photograph the posted hours",
    where: "12 Main St, front entrance on Main St",
    how: "One photo of the storefront and one close-up of the hours sign",
  },
});
const done = await sq.waitForQuest(quest.id); // or use a webhook
console.log(done.proof?.photo_urls);
await sq.approveQuest(done.id, 5);
```

If your prepaid balance covers the reward plus fee, the quest opens instantly. Otherwise `checkout_url` is returned for a person to pay.

## Agent frameworks

Each gives the same 8 tools: list_templates, create_quest, get_balance, get_quest, list_quests, approve_quest, dispute_quest, cancel_quest. Pass `{ readOnly: true }` for only the tools that cannot spend money.

**Vercel AI SDK**
```ts
import { generateText, isStepCount } from "ai";
import { sidequestTools } from "sidequestpays/ai";

const { text } = await generateText({
  model: "openai/gpt-5-mini",
  tools: sidequestTools(),
  stopWhen: isStepCount(5),
  prompt: "Have someone check whether Blue Bottle on Market St in SF is open right now.",
});
```

**LangChain.js / LangGraph.js**
```ts
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { sidequestTools } from "sidequestpays/langchain";

const agent = createReactAgent({ llm, tools: sidequestTools() });
```

**Raw tool calling** (OpenAI or Anthropic SDKs)
```ts
import { SideQuest, openaiTools, anthropicTools, runTool } from "sidequestpays";

const tools = anthropicTools();                                   // or openaiTools()
const result = await runTool(new SideQuest(), call.name, call.input); // JSON string for the model
```

**MCP**: connect any MCP client to `https://sidequestpays.com/mcp` with header `X-API-Key`.

## Webhooks

```ts
import { SideQuest, verifyWebhook } from "sidequestpays";

const { secret } = await new SideQuest().setWebhook("https://your.app/sidequest"); // shown once

// in your handler (use the raw body string):
if (!verifyWebhook(rawBody, req.headers["sidequest-signature"], secret)) return res.status(400).end();
```

## Links

- API docs: https://sidequestpays.com/docs
- llms.txt: https://sidequestpays.com/llms.txt
- Support: hello@sidequestpays.com
