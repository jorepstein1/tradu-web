# Tradu Web

A web application for translating words and creating flashcards for language learning. Built with Next.js and Flask.

## Features

- Word translation using WordReference
- Integration with Mochi Cards for flashcard creation
- Support for multiple translation directions (e.g., English-Spanish)
- Drag-and-drop interface for selecting translations
- Card template and deck management

## Development Setup

### Prerequisites for local deployment

- Node.js and npm
- Python 3.12 virtual environment with pip

### Running the Application

1. **Start the Flask backend:**

   ```bash
   npm run flask-dev
   ```

2. **Start the Next.js frontend:**
   ```bash
   npm run next-dev
   ```

## How It Works

1. **Search**: Enter a word to translate using the WordReference scraper
2. **Review**: Browse translation results with definitions, parts of speech, and example expressions
3. **Select**: Choose which translations to convert into flashcards
4. **Configure**: Set up Mochi Cards API key, deck, and template through the settings
5. **Upload**: Create flashcards in your Mochi Cards account

The app scrapes translation data from WordReference and formats it for use with Mochi Cards, a spaced repetition flashcard system.
