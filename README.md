# DRP Project Group 31

A React + TypeScript web app for organizing and joining badminton match sessions, with Firebase-backed authentication and profile persistence.

## Overview

This project is a single-page application that helps players:

- browse available badminton sessions
- host new sessions
- join or leave existing sessions
- manage hosted sessions
- update their profile

The current app uses Firebase Anonymous Authentication and Firestore for the signed-in demo user profile. Match session data is still stored in local browser storage while the backend migration is in progress.

## Tech Stack

- React
- TypeScript
- Vite
- Firebase Authentication
- Cloud Firestore
- Firebase Hosting
- CSS
- Lucide React
- Motion

## Project Structure

- `src/App.tsx` — main application state and screen routing
- `src/auth.ts` — Firebase anonymous sign-in and Firestore profile access
- `src/firebase.ts` — Firebase app, auth, and Firestore initialization
- `src/components/` — UI screens and shared navigation components
- `src/data.ts` — seeded mock session and user data
- `src/types.ts` — core TypeScript data models
- `src/index.css` — global styles
- `firebase.json` — Firebase Hosting configuration
- `index.html` — Vite entry HTML

## Main Features

### Explore sessions
Users can browse available badminton sessions and open session details.

### Host sessions
Users can create new sessions and edit sessions they manage.

### Session management
Users can join or leave sessions, and hosts can cancel sessions.

### Profile editing
Users can update their profile information. Profile data is persisted in Firestore under `users/{uid}`.

### Local persistence
Match session data is currently stored in `localStorage` so the app keeps session state across refreshes in the same browser.

### Firebase authentication
Users continue as a demo user through Firebase Anonymous Authentication. The app creates or loads the matching Firestore profile document after sign-in.

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

## Firebase

Firebase project:

```txt
drp-31-1c7dd
```

The app expects these Firebase services to be enabled:

- Anonymous Authentication
- Cloud Firestore
- Firebase Hosting

Recommended Firestore rules for the current implementation:

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, create, update: if request.auth != null && request.auth.uid == userId;
      allow delete: if false;
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Deployment

Production Firebase Hosting URL:

```txt
https://drp-31-1c7dd.web.app
```

Manual deployment:

```bash
npm run build
npx firebase-tools deploy --only hosting --project drp-31-1c7dd
```

GitHub Actions deployment uses the repository secret:

```txt
FIREBASE_SERVICE_ACCOUNT_DRP_31_1C7DD
```

Deployment flow:

- pushes to `staging` deploy to the Firebase Hosting preview channel `staging`
- pushes to `main` deploy to Firebase Hosting production

## Branching Workflow

This repository uses a two-PR promotion model:

```txt
feature branch -> PR -> staging -> PR -> main
```

- `staging` is the pre-production integration branch
- `main` is the production branch
- both `staging` and `main` are protected by repository rulesets
- both branches block deletion and force pushes
- production deployment is triggered from `main`

## Notes

- This repository appears to be adapted from a template, but the application itself is focused on badminton session coordination.
- Firebase currently handles authentication and profile persistence only.
- Match session persistence is still local and should be migrated to Firestore next.
