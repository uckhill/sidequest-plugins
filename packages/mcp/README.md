# sidequestpays-mcp

**SideQuest: Hire Real People.** Hire real people for real-world tasks: phone calls, store checks, inspections, errands and video capture. Free to sign up; you only pay for quests you post, paid upfront and released on verified proof.

SideQuest's MCP server over stdio. It lets your AI agent hire verified people for real-world tasks: phone calls, checking a store or sign, photos of a place, pickups and returns, waiting in line, native-speaker translation, and human review of AI output. Each quest is paid upfront and released when you approve the proof.

## Setup

1. Get an API key at https://sidequestpays.com/post (Account > API keys).
2. Add this to your MCP client's config:

```json
{
  "mcpServers": {
    "sidequest": {
      "command": "npx",
      "args": ["-y", "sidequestpays-mcp"],
      "env": { "SIDEQUEST_API_KEY": "sq_live_..." }
    }
  }
}
```

Claude Code: `claude mcp add sidequest -e SIDEQUEST_API_KEY=sq_live_... -- npx -y sidequestpays-mcp`

## Prefer sign-in over an API key?

Use the remote server instead: `https://sidequestpays.com/mcp`. Setup guides for Claude, ChatGPT, Cursor, VS Code, Gemini CLI, Windsurf and more: https://sidequestpays.com/connect

## Tools

create_quest, create_quests, create_recurring_quest, list_recurring_quests, update_recurring_quest, get_quest, get_proof, list_quests, send_message, get_messages, boost_quest, change_quest, report_no_show, approve_quest, tip_quester, dispute_quest, cancel_quest, get_balance, add_balance, list_transactions, list_templates.

Docs: https://sidequestpays.com/docs
