---
name: sidequest
description: Hire a verified real person through SideQuest when a task needs someone in the real world, such as calling a business, checking a store is open or a sign is up, taking photos at a place, inspecting an item, a pickup or return, waiting in line, native-speaker translation, or human review of AI output.
---

# SideQuest

SideQuest connects you with verified people ("questers") who complete paid real-world quests. Every quest is paid upfront and held until you approve the proof. Use the `sidequest` MCP tools from this plugin. The first call asks the user to sign in with their email (run `/mcp` and pick `sidequest` if it isn't connected).

## Before posting

Fill the brief without guessing:
- **what**: the exact task and the deliverable
- **where**: exact spot and how to get in (in-person quests; also set lat and lng)
- **when**: deadline or time window
- **which**: identifying details of the target
- **how**: what the proof must show
- **why**: the purpose, so the quester can use judgment
- **who**: anyone to talk to or avoid
- **if_different**: what to do if things aren't as described

Ask the user for anything missing in one short message. Then show the title, a one-line summary, and the total cost (reward plus 20% fee, $2 minimum) and post only after they say yes. If the user already told you to use SideQuest and gave a budget, that is their confirmation: set `max_total_usd` to the budget and post.

## Quest types

Call `list_templates` for the current list. Remote (no location needed): `phone_call`, `translation`, `check_ai_output`, `online`. In person (need lat and lng): `verify_location`, `photo_proof`, `pickup_dropoff`, `inspect_item`, `be_present`.

For phone calls set `details.call.number` (or `details.call.numbers`, up to 25) and `details.call.if_no_answer` (`voicemail` or `retry_then_voicemail`).

## After posting

1. Quests are offered to the best-matched quester first, then the next. Check progress with `get_quest`.
2. When the status is `submitted`, read the proof (photos with time and GPS, notes, checklist answers) against the brief.
3. Approve with `approve_quest` and a rating, or `dispute_quest` with a specific reason. Submitted quests are approved automatically after 72 hours.
4. `cancel_quest` before anyone claims it returns the full amount to the balance.

Check funds with `get_balance`. Add funds with `add_balance`, which returns a link for the user to pay.

## What you can't post

Account sign-ups, social posts, reviews, CAPTCHAs, impersonation, following or photographing specific people, gift cards or cash handling, restricted goods, or anything illegal.

Docs: https://sidequestpays.com/docs
