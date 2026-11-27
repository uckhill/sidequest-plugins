# SideQuest plugins for Claude Code

**SideQuest: Hire Real People.** Hire real people for real-world tasks: phone calls, store checks, inspections, errands and video capture. Free to sign up; you only pay for quests you post, paid upfront and released on verified proof.

Let Claude Code hire verified people for real-world tasks: phone calls, store and sign checks, photo proof of a place, pickups and returns, waiting in line, native-speaker translation, and human review of AI output. Each quest is paid upfront and released when you approve the proof.

## Install

```
/plugin marketplace add sidequestpays/sidequest-plugins
/plugin install sidequest@sidequest
```

Then run `/mcp`, pick `sidequest`, and sign in with your email.

The plugin adds the SideQuest MCP server (`https://sidequestpays.com/mcp`) and a skill that teaches Claude how to write a complete brief and review proof.

More: https://sidequestpays.com/connect/claude-code

## npm packages

| Package | What it is | Source |
|---|---|---|
| [`sidequestpays-mcp`](https://www.npmjs.com/package/sidequestpays-mcp) | SideQuest MCP server over stdio, for clients that run local servers | [`packages/mcp`](packages/mcp) |
| [`sidequestpays`](https://www.npmjs.com/package/sidequestpays) | JavaScript SDK, plus tools for the Vercel AI SDK and LangChain | [`packages/sdk-js`](packages/sdk-js) |
| [`n8n-nodes-sidequest`](https://www.npmjs.com/package/n8n-nodes-sidequest) | n8n community node | [sidequestpays/n8n-nodes-sidequest](https://github.com/sidequestpays/n8n-nodes-sidequest) |

Releases are published from GitHub Actions with npm provenance.

Report issues here or email support@sidequestpays.com.
