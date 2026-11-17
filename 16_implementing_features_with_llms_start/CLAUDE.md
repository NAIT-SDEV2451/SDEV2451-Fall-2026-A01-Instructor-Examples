# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

TicketMono is a course teaching project (SDEV2451): a Django REST Framework backend and a React + Vite frontend for browsing events and ordering tickets. Solutions should match the level and style of the existing code. The root `README.md` is the lesson handout, not project documentation.

## Commands

Backend (run from `ticketmono_backend/` with `venv` active):
- `python manage.py migrate` then `python manage.py runserver` (port 8000)
- Sample data: `python manage.py create_organizers` then `python manage.py loaddata event_data.json` (organizers `alice_organizer` / `Organizer@100`, `bob_organizer` / `Organizer@101`; there are no sample orders)
- Tests: `python manage.py test`; single test: `python manage.py test event_tickets.tests.EventTicketsTestCase.<test_name>`
- Coverage: `coverage run manage.py test`, `coverage report`, `coverage html` (configured in `.coveragerc`)

Frontend (run from `ticketmono_frontend/`):
- `npm run dev` (port 5173, the only CORS-allowed origin), `npm run build`, `npm run lint`
- Tests: `npm run test:run`; single file: `npm run test:run -- src/__tests__/EventCard.test.jsx`

## Architecture

**Backend.** Two apps. `core` holds `CustomUser` (with `role`: `user` or `event_organizer`) and auth endpoints under `/api/v1/auth/` (register, SimpleJWT login/refresh, `me`). `event_tickets` holds Venue → Event → TicketTier → Ticket, plus Order (M2M to Ticket, `total_price` computed). Its ViewSets are registered on a router at `/api/v1/`. Creating an order takes `{items: [{ticket_tier_id, quantity}]}` and creates one `Ticket` row per quantity. SQLite, JWT auth only.

Known gap: `EventViewSet` is a full `ModelViewSet` with only `IsAuthenticated`, so any logged-in user can edit or delete any event.

**Frontend.** Data flows `src/api/*.js` → `src/hooks/use*.js` (TanStack Query) → `src/pages/`. All requests go through `api/client.js`, which attaches the Bearer token from `localStorage` (`api/tokenStorage.js`) and does a single deduplicated silent refresh on 401 through callbacks registered by `AuthProvider`. API functions return parsed JSON and throw on non-OK responses. `CartContext` keeps the cart in memory only, keyed `${eventId}-${tierId}`. Routes in `App.jsx` are wrapped in `ProtectedRoute`, except login and register. Styling uses Tailwind v4 and daisyUI.

**Frontend tests.** Vitest + jsdom + Testing Library. MSW mocks the network (`src/test/handlers.js`, `server.js`, wired up in `setup.js`). Render with `renderWithProviders` from `src/test/`, which supplies QueryClient (no retries) and MemoryRouter but not Auth or Cart providers.

**Backend tests.** `APITestCase` with shared data in `setUp` and `force_authenticate`.
