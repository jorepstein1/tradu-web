# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This App Does

**Tradu** is a Spanish/English translation flashcard tool. Users search for words, get translations scraped from WordReference.com, drag translations to a "Cards to Make" column, edit them, then upload them to [Mochi Cards](https://mochi.cards) (a spaced-repetition app).

## Development Commands

```bash
# Frontend only
npm run next-dev

# Flask backend only
npm run flask-dev

# Build
npm run build

# Lint
npm run lint

# Run Python unittests (for changes to word_reference_scraper)
uv run -m pytest tests/test_word_reference_api.py
```

Python dependencies are managed with `uv`. Flask runs on port 5328; Next.js proxies `/api/*` requests to it.

## Architecture

**Stack:** Next.js 15 (React 19, TypeScript) + Flask (Python 3.12)

**Frontend** (`/app`, `/components`, `/services`):

- Single page: `app/page.tsx` → `<Tradu />` (main orchestrator)
- `Tradu.tsx` manages search state, selected translations, and user edits
- UI uses shadcn/ui (`/components/ui`) + Tailwind CSS v4
- Drag & drop via **dnd-kit** — must use keyboard navigation (Space to pick/drop, Arrow keys to move), not mouse drag

**Backend** (`/api/index.py`, `/word_reference_scraper`):

- Flask app with three endpoints: `/api/translate`, `/api/get-decks`, `/api/upload`
- Translation data is scraped by the local `word_reference_scraper` Python package
- On upload, the backend automatically finds or creates a Mochi template named "Tradu" (field IDs: `tradu-front`, `tradu-back`; display names: "Front", "Back")

**Data flow:**

1. User searches → `SearchSection` fires server action → Flask scrapes WordReference → returns `Translation[]`
2. User drags cards from "Results" (id=`"from"`) to "Cards to Make" (id=`"to"`) drop zones
3. User edits translations in the right column (deletable word parts, definitions, expressions)
4. Upload → Flask POSTs to Mochi API

**Key data model** (`services/mochiApi.ts`):

```typescript
Translation {
  translation_id: string
  from_word: { text, definition, part_of_speech, sense }
  to_words: ToWord[]
  expressions: Expression[]
}
```

**Component hierarchy:**

```
Tradu
├── SearchSection (HeaderAndSearchSpace) — search bar, language toggle, settings button
├── ResultsSpace — DndContext wrapping both columns
│   ├── CardDropZone (id="from") — search results, draggable
│   └── CardDropZone (id="to") — cards to make, editable/deletable
└── SettingsModalDialog — Mochi API key and deck selector
```

**State:** Local React state + `useActionState` for search. Mochi settings (API key in state, Deck ID in cookie) persisted across sessions.

**Styling:** Tailwind v4 with OKLch CSS custom properties for theming (light/dark). shadcn/ui "new-york" style.

## Drag & Drop

Only pointer/mouse-based dragging is configured (no `KeyboardSensor`). Mouse drag is not reliably driveable by the Claude Chrome extension.

Dragging a card back to the left zone removes it from selection.

## Keyboard Navigation

Cards support keyboard-driven column movement via `onKeyDown` on the `<li>` in `TranslationCard` (not dnd-kit `KeyboardSensor`):

- **Tab** — focus a card (dnd-kit sets `tabIndex=0` via `useDraggable` attributes)
- **ArrowRight** — move focused card from "Search Results" → "Cards to Make"
- **ArrowLeft** — move focused card from "Cards to Make" → "Search Results" (also resets edits)

Focus follows the card after moving via `requestAnimationFrame` + `data-translation-id`.

## Testing in Chrome (for Claude)

To test card navigation end-to-end using the Chrome extension:

1. Start the dev server: `npm run next-dev` (port 3000)
2. Navigate to `http://localhost:3000`
3. Press **Tab** to focus the search input, **type** a word, press **Enter** — wait ~4s for results
4. Press **Tab** three times to focus the first card
5. Press **ArrowRight** — card should move to "Cards to Make" and stay focused
6. Press **ArrowLeft** — card should move back to "Search Results" and stay focused

Note: clicking to focus the search input is unreliable from the extension — always use Tab to focus it first.
