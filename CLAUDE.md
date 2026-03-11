# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This App Does

**Tradu** is a Spanish/English translation flashcard tool. Users search for words, get translations scraped from WordReference.com, drag translations to a "Cards to Make" column, edit them, then upload them to [Mochi Cards](https://mochi.cards) (a spaced-repetition app).

## Development Commands

```bash
# Run full stack (Next.js + Flask concurrently)
npm run dev

# Frontend only
npm run next-dev

# Flask backend only
npm run flask-dev

# Build
npm run build

# Lint
npm run lint
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
- Flask app with four endpoints: `/api/translate`, `/api/get-decks`, `/api/get-templates`, `/api/upload`
- Translation data is scraped by the local `word_reference_scraper` Python package

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
└── SettingsModalDialog — Mochi API key, deck/template selectors
```

**State:** Local React state + `useActionState` for search. Mochi settings persisted in cookies. Redux Toolkit is installed but not currently used.

**Styling:** Tailwind v4 with OKLch CSS custom properties for theming (light/dark). shadcn/ui "new-york" style.

## Drag & Drop

dnd-kit requires keyboard navigation — mouse drag is unreliable:
1. Click card to focus
2. Press `Space` to pick up
3. Press `ArrowRight` to move toward target drop zone
4. Press `Space` to drop

Dragging a card back to the left zone removes it from selection.
