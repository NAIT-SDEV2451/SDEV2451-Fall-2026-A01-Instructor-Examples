# TicketMono

A ticket sales app built during SDEV2451. Attendees browse events and buy tickets. Event organizers manage their own events.

This is a course project, so keep solutions at the level of the existing code. Prefer the simple approach, and explain anything new you introduce.

## Layout

- `ticketmono_backend/`: Django and Django REST Framework API. `core` holds users and auth; `event_tickets` holds events, venues, tiers, tickets and orders.
- `ticketmono_frontend/`: React with Vite, TanStack Query, Tailwind and daisyUI.

## Commands

Backend, from `ticketmono_backend/`:

- Run the server: `python manage.py runserver`
- Run the tests: `python manage.py test`
- Load sample data, in this order: `python manage.py create_organizers`, then `python manage.py loaddata event_data`

Frontend, from `ticketmono_frontend/`:

- Run the dev server: `npm run dev`
- Run the tests: `npm run test:run`

## Things you can't tell from the code

- User roles are `user` and `event_organizer`. The sample organizers are `alice_organizer` and `bob_organizer`.
- Sample data has no orders, so sales totals stay at zero until someone buys tickets.
