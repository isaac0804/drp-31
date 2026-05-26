# DRP Project Group 31

A React + TypeScript web app for organizing and joining badminton match sessions.

## Overview

This project is a single-page application that helps players:

- browse available badminton sessions
- host new sessions
- join or leave existing sessions
- manage hosted sessions
- update their profile

The current app uses local browser storage to persist user and session data, making it suitable as a prototype or coursework project without requiring a backend service.

## Tech Stack

- React
- TypeScript
- Vite
- CSS
- Lucide React
- Motion

## Project Structure

- `src/App.tsx` — main application state and screen routing
- `src/components/` — UI screens and shared navigation components
- `src/data.ts` — seeded mock session and user data
- `src/types.ts` — core TypeScript data models
- `src/index.css` — global styles
- `index.html` — Vite entry HTML

## Main Features

### Explore sessions
Users can browse available badminton sessions and open session details.

### Host sessions
Users can create new sessions and edit sessions they manage.

### Session management
Users can join or leave sessions, and hosts can cancel sessions.

### Profile editing
Users can update their profile information, and profile changes propagate to related session data.

### Local persistence
Session and profile data are stored in `localStorage` so the app keeps state across refreshes in the same browser.

## Getting Started

### Prerequisites

- Node.js
- npm

### Install dependencies

```bash
npm install
```

### Run locally

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Type-check

```bash
npm run lint
```

## Notes

- This repository appears to be adapted from a template, but the application itself is focused on badminton session coordination.
- The current implementation is frontend-first and does not require a database or backend API for its core flows.
