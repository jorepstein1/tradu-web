# Tradu

<img src="public/tradu_icon.svg" alt="Tradu icon" width="80" />

A web app for looking up translations and turning them into flashcards. Available at [traducards.app](https://www.traducards.app).

## What it does

1. **Search** — Enter a word; the app fetches translations from WordReference
2. **Browse** — See translations with definitions, parts of speech, and example expressions
3. **Select** — Drag translations into your card queue; edit or remove fields as needed
4. **Upload** — Send the cards to your [Mochi Cards](https://mochi.cards) account via API

Configure your Mochi API key, deck, and template in the settings menu.

## Tech

- **Frontend**: Next.js / React / TypeScript / Tailwind CSS
- **Backend**: Flask (Python) — scrapes WordReference and talks to the Mochi API

## Local development

### Prerequisites

- Node.js and npm
- Python 3.12 with pip

### Running locally

1. Start the Flask backend:
   ```bash
   npm run flask-dev
   ```

2. Start the Next.js frontend:
   ```bash
   npm run next-dev
   ```
