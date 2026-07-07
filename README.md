# Pulse Web — Next.js Frontend

The web client of **Pulse**, a TikTok-style social platform. Built with the Next.js App Router; every piece of data flows through the NestJS REST API (the browser never talks to Firebase or PostgreSQL directly).

**Live site:** `http://<YOUR_ELASTIC_IP>` ← update after deployment

---

## Project Overview
A fully responsive social app: auth, infinite-scroll feed, search, profiles with media upload, notifications, direct messages, and settings — themed in a professional **purple & orange** palette with light and dark modes.

## Features Implemented
- **Auth pages** — login & sign-up with client + server validation, loading states, friendly error messages (invalid credentials, weak password, taken username), and a 3D animated "Pulse orb" hero panel
- **Home feed** — avatar, username, caption, media, functional **Like / Comment / Save / Share** (optimistic updates + toasts), infinite scrolling via IntersectionObserver, manual refresh, skeleton loaders, empty state
- **Search** — debounced user search with result cards linking to profiles
- **Profile** — details via API, **Posts / Saved** tab switcher (animated pill), create post with media upload through the Upload API → Firebase Storage, edit profile with avatar upload
- **Notifications** — list with unread badges, per-item and mark-all-read
- **Messages** — conversation list with unread counts, chat thread with bubbles, start new chats via user search
- **Settings** — light/dark theme toggle, notification toggle, language selector, logout (calls Auth API + clears session)
- **Design system** — reusable Button, Avatar (with signature gradient ring), Card, Modal/bottom-sheet, Toast, Skeleton, ThemeToggle, SearchInput, TabSwitcher, EmptyState
- **Responsive** — persistent sidebar on desktop, top bar + bottom nav on small screens; works from small laptops to widescreens
- Framer Motion micro-interactions · Zustand state management · reduced-motion respected · keyboard-focus rings

## Technology Stack
Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion · Zustand · Axios · next-themes · lucide-react · Docker · PM2 · GitHub Actions + webhook auto-deploy

## Theming
Purple `#7C3AED` (primary) → Fuchsia → Orange `#F97316` (accent) gradient signature; light surface `#FAF8FF`, dark surface `#0D0916`. Toggle persists via `next-themes` (class strategy).

## Installation
```bash
git clone <this-repo> && cd pulse-frontend
npm install
cp .env .env      # set NEXT_PUBLIC_API_URL
```

## Run (local dev)
```bash
npm run dev               # http://localhost:3000  (backend must be running)
```
Production build: `npm run build && npm start`

## Environment Variables
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the NestJS API, e.g. `http://localhost:4000/api` or `http://<EIP>/api` |

## AWS EC2 Deployment
1. Provision the instance with the Terraform in `infrastructure/` (Docker/Node/Nginx pre-installed via user-data).
2. Clone to `~/apps/pulse-frontend`.
3. Build & run:
   ```bash
   docker build -t pulse-web --build-arg NEXT_PUBLIC_API_URL="http://<EIP>/api" .
   docker run -d --name pulse-web --restart always -p 127.0.0.1:3000:3000 pulse-web
   ```
4. Nginx proxies `/ → 127.0.0.1:3000` (config provided in `infrastructure/nginx/pulse.conf`).
5. **Auto-deploy on push:** GitHub Actions workflow (secrets: `EC2_HOST`, `EC2_SSH_KEY`, `NEXT_PUBLIC_API_URL`) **or** the GitHub webhook listener on the server — both included.
6. PM2 alternative (no Docker): `npm ci && npm run build && pm2 start ecosystem.config.js && pm2 save`.

## Design Decisions
- **All data through the NestJS API** — a single Axios client attaches the Firebase ID token and auto-redirects to login on 401
- **Optimistic UI** for likes/saves — instant feedback, rollback + toast on failure
- **Signature "pulse ring"** (conic purple→orange gradient) unifies avatars, active states and CTAs so the palette reads as identity, not decoration
- **Bottom-sheet modals on mobile**, centered dialogs on desktop — one component, two behaviors
- **Zustand with persist** for the session — tiny, no boilerplate, survives refresh

## Future Improvements
Real-time messages via WebSockets · i18n wiring for the language selector · PWA/push notifications · video feed with snap-scroll (true TikTok mode) · image optimization via Next `<Image>` + CDN

## Screenshots
Add these after deployment (required by the assessment): Home, Profile, Messages, Dark Mode — place them in `/screenshots` and embed here.
