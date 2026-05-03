<p align="center">
  <img src="assets/input_nobg.png" alt="Lumina" height="80">
</p>

# Lumina

A personal knowledge base for storing, organizing, and linking AI-generated answers.

## Features

- Organize answers into niches
- Link answers with parent / sibling / friend relationships
- Visualize your knowledge graph
- Import answers via AI prompts
- Star and search answers

## Stack

- Node.js + Express
- Turso (libSQL) for storage
- Vanilla JS + D3.js for the graph

## Getting Started

```bash
npm install
npm run dev
```

Requires a `.env` file with:

```
TURSO_DATABASE_URL=...
TURSO_AUTH_TOKEN=...
SESSION_SECRET=...
```
