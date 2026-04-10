---
name: Tradu End-to-End Testing
description: Run end-to-end browser tests on the Tradu webapp
context: fork
allowed-tools: npm sleep curl head
---

# Tradu E2E Testing Skill

Run comprehensive browser tests on the Tradu webapp translation flashcard tool.

## What This Tests

- **Search functionality**: Search for a Spanish word and verify results load from WordReference
- **Keyboard navigation**: Tab to focus cards, ArrowRight/ArrowLeft to move between columns
- **Card movement**: Verify cards move from "Search Results" to "Cards to Make" and back
- **UI state**: Upload button disabled when no API key configured, Configure button opens settings modal
- **Settings modal**: Mochi API Key input field renders correctly

## How to Use

When developing new features or fixing bugs in Tradu, invoke this skill to test your changes:

```
/tradu-test-e2e
```

1. Start Next.js dev server (port 3000) `npm run next-dev`
2. Start Flask dev server (port 5328) `npm run flask-dev`
3. Open Chrome and navigate to http://localhost:3000
4. Run the full test sequence (search, navigation, UI verification)
5. Capture screenshots at key states
6. Report results with pass/fail status for each test

## Test Flow

1. **Initial load**: Verify app renders at localhost:3000
2. **Search**: Tab to search input → type "correr" → Enter → wait 5s for results
3. **Card focus**: Tab×3 to focus first search result card
4. **Move right**: Press ArrowRight to move card to "Cards to Make" column, verify it appears there
5. **Move left**: Press ArrowLeft to move card back to "Search Results", verify it reappears
6. **Upload state**: Verify Upload button is disabled (no API key)
7. **Configure modal**: Click Configure button, verify settings modal opens with Mochi API Key field

## Expected Results

| Test            | Expected                                                                    |
| --------------- | --------------------------------------------------------------------------- |
| Search "correr" | Returns translations with "moverse deprisa", "hacer ejercicio", "run", etc. |
| ArrowRight      | Card moves to right column, focus follows                                   |
| ArrowLeft       | Card moves to left column, focus follows                                    |
| Upload disabled | Button is visually disabled without API key                                 |
| Configure modal | Opens with input field for "Mochi API Key"                                  |

## Notes

- Tests use keyboard navigation only (Tab, ArrowRight, ArrowLeft) per CLAUDE.md spec
- Mouse drag/drop is **not** tested (not reliably driveable by browser extension)

## Keyboard Navigation Reference

From CLAUDE.md:

- **Tab** — focus a card
- **ArrowRight** — move focused card from "Search Results" → "Cards to Make"
- **ArrowLeft** — move focused card from "Cards to Make" → "Search Results"
- Focus automatically follows the card after moving

---

**Stack**: Next.js 15 + React 19 + Flask + dnd-kit
**Tested on**: Chrome with Claude Code extension
