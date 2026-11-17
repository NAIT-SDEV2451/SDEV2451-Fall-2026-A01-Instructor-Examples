# Performance and Security — Query Optimization, Caching, Background Tasks, Transactions, Secrets, and Security Best Practices


## Prerequisites
- Create a new virtual environment and install the packages from the `requirements.txt` file.
- Load the sample data from `ticketmono_backend/`: run `python manage.py create_organizers`, then `python manage.py loaddata event_data`.

## Steps

TicketMono works. Attendees can buy tickets, organizers can create events, and we have a test suite that tells us when we break something. But "it works" isn't the same as "it's ready for real users". A real site has to stay fast with lots of data, keep data consistent when something fails part way through, and stay safe from people trying to break in.

In this example we make the TicketMono backend faster, more reliable and more secure. We stop making extra database queries, cache a busy endpoint, make orders save all or nothing, send confirmation emails in the background, move secrets out of the code, and add some security settings.

We'll spread this over two classes:

**Lesson 1: Performance**
- **Step 1** — Find and fix an N+1 query with `prefetch_related`
- **Step 2** — Cache the events list
- **Step 3** — Make order creation all or nothing with a transaction
- **Step 4** — Send an order confirmation email with a background task

**Lesson 2: Secrets and Security**
- **Step 5** — Move settings and secrets into environment variables
- **Step 6** — Backend and frontend security best practices
- **Step 7** — Commit, push, and open a pull request

> We do transactions (Step 3) before background tasks (Step 4) on purpose. The right way to queue a task depends on the transaction it's started from.

---

## Lesson 1: Performance

### 1. Find and fix an N+1 query with `prefetch_related` in the file `event_tickets/views.py`.

Fetching lots of rows is rarely what makes a Django API slow. Running one extra query for every row is. This is called the **N+1 problem**. You run 1 query to get a list, then N more queries, one for each item in it.

#### 1.1. Review what we already do on the events list.

`EventViewSet` already avoids this problem. Let's look at why.

```python
class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.select_related("venue", "organizer").prefetch_related(
        "ticket_tiers"
    )
```
Let's talk about what this code is doing.
- `EventListReadOnlySerializer` outputs each event's `venue`, `organizer` and `ticket_tiers`. Without help, Django would run a separate query for each of those, for every event.
- `select_related("venue", "organizer")` is for **foreign keys**, where each event has exactly one venue and one organizer. Django adds a SQL `JOIN` and gets everything in **one** query.
- `prefetch_related("ticket_tiers")` is for the **"many" side** of a relationship, where one event has many tiers. A join would repeat each event once per tier, so Django runs **one extra query** for all the tiers of all the events and matches them up in Python.
- The rule of thumb: use `select_related` when following a `ForeignKey` forward, and `prefetch_related` for reverse foreign keys and `ManyToManyField`s.
- `mine()` uses `.annotate(Count(...), Sum(...))` for the same reason. The database calculates the totals in the same query, so Python doesn't loop over every ticket.

#### 1.2. Write a test that shows the problem in the file `event_tickets/tests.py`.

The order detail endpoint doesn't have this protection yet. Before we fix it, let's prove it's a problem. `assertNumQueries` fails the test if the code runs a different number of queries than we expect.

```python
# ... other imports ...

class EventTicketsTestCase(APITestCase):
    # ... setUp and other tests ...

    def test_order_detail_query_count_does_not_grow_with_tickets(self):
        vip = TicketTier.objects.create(name='VIP', price='80.00', event=self.event)
        tickets = [Ticket.objects.create(tier=self.tier) for _ in range(3)]
        tickets += [Ticket.objects.create(tier=vip) for _ in range(3)]
        order = Order.objects.create(customer=self.user)
        order.tickets.set(tickets)

        self.client.force_authenticate(user=self.user)
        # 1 for the order, then 1 each for tickets, tiers and events.
        with self.assertNumQueries(4):
            response = self.client.get(f'/api/v1/orders/{order.id}/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['tickets']), 6)
```
Let's talk about what this code is doing.
- We build an order with 6 tickets across 2 tiers, so an N+1 problem will show up clearly.
- `with self.assertNumQueries(4):` counts every query run inside the block and fails if it isn't exactly 4.
- `force_authenticate` doesn't touch the database, so every query counted comes from the view itself.

Run the test now with `python manage.py test`. It fails with something like this:

```
AssertionError: 21 != 4 : 21 queries executed, 4 expected
```

That's 21 queries for 6 tickets. `TicketDetailSerializer` looks up each ticket's `tier`, `TicketTierDetailSerializer` looks up each tier's `event.name`, and `Order.total_price` loops over the tickets again for their prices. With 600 tickets that number would be well over 2,000.

#### 1.3. Fix it in the file `event_tickets/views.py`.

```python
class OrderViewSet(viewsets.ModelViewSet):
    # ... permission_classes and get_serializer_class ...

    def get_queryset(self):
        # Load every ticket, its tier and the tier's event up front, instead of
        # one query per ticket when the serializer and total_price walk them.
        return Order.objects.filter(customer=self.request.user).prefetch_related(
            "tickets__tier__event"
        )
```
Let's talk about what this code is doing.
- `"tickets__tier__event"` uses double underscores to follow a chain of relationships. Django prefetches `tickets`, then each ticket's `tier`, then each tier's `event`, with one query per level.
- The serializer and `total_price` both call `self.tickets.all()`. Once the data is prefetched, `.all()` reads from the prefetched cache instead of the database.
- Run the tests again. The query count is now **4** no matter how many tickets are in the order.
- **Caveat:** the cache only works if you call `.all()`. Calling `.filter()`, `.order_by()` or `.count()` on a prefetched relationship starts a brand new query.

---

### 2. Cache the events list in the files `ticketmono_backend/settings.py` and `event_tickets/views.py`.

The events list is the busiest endpoint in the app, because everyone lands on it. It's also the same for every user, and it only changes when an organizer creates or edits an event. That makes it a good fit for a **cache**: we build the response once, save it in memory, and hand back the saved copy until something changes.

#### 2.1. Configure the cache in the file `ticketmono_backend/settings.py`.

```python
# ... CORS_ALLOWED_ORIGINS ...

# Caching
# https://docs.djangoproject.com/en/6.0/topics/cache/
# Local memory is fine for one development server. In production you'd use a
# shared cache like Redis so every server sees the same data.

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
    }
}
```
Let's talk about what this code is doing.
- `LocMemCache` keeps cached values in the memory of the Django process. It's Django's default, but writing it out makes the choice visible.
- In production you'd usually run several server processes. Each `LocMemCache` is private to its process, so they'd each have their own copy and clearing one wouldn't clear the others. That's why real deployments use a shared cache such as **Redis** (`django.core.cache.backends.redis.RedisCache`) or **Memcached**. Our view code wouldn't need to change, only this setting.

#### 2.2. Serve the list from the cache in the file `event_tickets/views.py`.

```python
from django.core.cache import cache
# ... other imports ...

# Every user sees the same events list, so one cached copy can be shared.
EVENTS_LIST_CACHE_KEY = "events:list"
EVENTS_LIST_CACHE_SECONDS = 60 * 5


class EventViewSet(viewsets.ModelViewSet):
    # ... queryset, get_permissions, get_serializer_class ...

    def list(self, request, *args, **kwargs):
        data = cache.get(EVENTS_LIST_CACHE_KEY)
        if data is None:
            events = self.get_queryset()
            data = EventListReadOnlySerializer(events, many=True).data
            cache.set(EVENTS_LIST_CACHE_KEY, data, EVENTS_LIST_CACHE_SECONDS)
        return Response(data)
```
Let's talk about what this code is doing.
- This pattern is called **cache-aside**. We check the cache first. On a **miss** (`None`), we do the real work and save the result. On a **hit**, we skip the database completely.
- We cache the serialized `data` (plain lists and dicts), not the queryset. Serializing is part of the work we're saving.
- `EVENTS_LIST_CACHE_SECONDS` is a **timeout**. Even if we forget to clear the cache somewhere, the data is never more than 5 minutes out of date.
- **Caveat:** only cache responses that are the same for everyone. If the list showed something user-specific, like "events you have tickets for", one shared cache key would show one user's data to everyone. You'd need to put the user id in the key.

#### 2.3. Clear the cache when events change in the file `event_tickets/views.py`.

Caching is easy. Knowing when to throw the cached copy away is the hard part. This is called **cache invalidation**.

```python
class EventViewSet(viewsets.ModelViewSet):
    # ... other code ...

    def create(self, request, *args, **kwargs):
        # ... validate and save the event and its tiers ...

        cache.delete(EVENTS_LIST_CACHE_KEY)
        return Response(
            EventListReadOnlySerializer(event).data, status=status.HTTP_201_CREATED
        )

    # The cached list is out of date as soon as an event changes.
    def perform_update(self, serializer):
        super().perform_update(serializer)
        cache.delete(EVENTS_LIST_CACHE_KEY)

    def perform_destroy(self, instance):
        super().perform_destroy(instance)
        cache.delete(EVENTS_LIST_CACHE_KEY)
```
Let's talk about what this code is doing.
- `cache.delete(...)` removes the saved list, so the next `GET` is a miss and rebuilds it with the new data.
- `perform_update` and `perform_destroy` are hooks that `ModelViewSet` calls when saving and deleting. Overriding them lets us run code after the change without rewriting `update` or `destroy`.
- **Caveat:** changes made outside these views, such as in the Django admin or a management command, won't clear the cache. The 5-minute timeout is our safety net. The challenge at the end asks you to fix this properly.

#### 2.4. Test the cache in the file `event_tickets/tests.py`.

```python
from django.core.cache import cache
# ... other imports ...

class EventTicketsTestCase(APITestCase):
    def setUp(self):
        # The cache isn't reset between tests the way the database is.
        cache.clear()
        # ... the rest of setUp ...


class OrganizerEventsTestCase(APITestCase):
    def setUp(self):
        cache.clear()
        # ... the rest of setUp ...

    # ... other tests ...

    def test_events_list_is_served_from_cache(self):
        self.client.force_authenticate(user=self.user)
        first = self.client.get('/api/v1/events/')

        with self.assertNumQueries(0):
            second = self.client.get('/api/v1/events/')

        self.assertEqual(second.data, first.data)

    def test_creating_an_event_clears_the_events_cache(self):
        self.client.force_authenticate(user=self.organizer)
        self.client.get('/api/v1/events/')
        self.client.post('/api/v1/events/', self.payload, format='json')

        response = self.client.get('/api/v1/events/')

        names = [event['name'] for event in response.data]
        self.assertIn('New Event', names)
```
Let's talk about what this code is doing.
- `cache.clear()` in `setUp` is important. Django rolls back the **database** after every test, but the cache lives in memory and carries over. Without it, one test could get a cached list left behind by another and fail for no obvious reason.
- `assertNumQueries(0)` proves the second request never touched the database.
- The second test checks invalidation. If we forgot `cache.delete(...)` in `create`, the new event wouldn't appear.

---

### 3. Make order creation all or nothing with a transaction in the file `event_tickets/views.py`.

Look at how `OrderViewSet.create` worked before this step:

```python
tickets = []
for item in serializer.validated_data["items"]:
    tier = TicketTier.objects.get(id=item["ticket_tier_id"])
    for _ in range(item["quantity"]):
        tickets.append(Ticket.objects.create(tier=tier))

order = Order.objects.create(customer=request.user)
order.tickets.set(tickets)
```

Every `.create()` is saved to the database right away. Say an order has two items and the second one has a bad `ticket_tier_id`. The tickets for the first item are already saved, then `.get()` crashes with a 500 error. We end up with **orphan tickets** that belong to no order. A **transaction** groups several database changes so that either all of them are saved or none of them are.

#### 3.1. Wrap order creation in `transaction.atomic()`.

```python
from django.db import transaction
from rest_framework.exceptions import ValidationError
# ... other imports ...

class OrderViewSet(viewsets.ModelViewSet):
    # ... other code ...

    def create(self, request, *args, **kwargs):
        serializer = CreateNewOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # If anything fails part way through, none of the tickets or the order
        # are saved. An exception leaving the block rolls everything back.
        with transaction.atomic():
            tickets = []
            for item in serializer.validated_data["items"]:
                try:
                    tier = TicketTier.objects.get(
                        id=item["ticket_tier_id"], event_id=item["event_id"]
                    )
                except TicketTier.DoesNotExist:
                    raise ValidationError(
                        {"items": [f"Ticket tier {item['ticket_tier_id']} was not found for this event."]}
                    )
                for _ in range(item["quantity"]):
                    tickets.append(Ticket.objects.create(tier=tier))

            order = Order.objects.create(customer=request.user)
            order.tickets.set(tickets)

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
```
Let's talk about what this code is doing.
- `with transaction.atomic():` opens a database transaction. If the block finishes normally, everything inside is **committed** (saved). If **any exception** leaves the block, everything inside is **rolled back**, as if it never happened.
- We turn the missing tier into a `ValidationError`. It still leaves the `atomic` block, so the earlier tickets are rolled back. DRF then turns it into a clean `400 Bad Request` instead of a `500` crash.
- We also filter by `event_id=item["event_id"]`. Before, the `event_id` in the request was ignored completely, so a tier from a different event would have been accepted. Never trust that IDs in a request belong together. Check them.
- `EventViewSet.create` already uses `transaction.atomic()` for the same reason: an event without its ticket tiers would be broken.
- **Caveat:** a transaction only protects the database. Sending an email or calling another API can't be rolled back. That's exactly the problem we deal with in the next step.

#### 3.2. Test the rollback in the file `event_tickets/tests.py`.

```python
    def test_order_with_unknown_tier_saves_nothing(self):
        self.client.force_authenticate(user=self.user)
        payload = {
            'items': [
                {'event_id': self.event.id, 'ticket_tier_id': self.tier.id, 'quantity': 2},
                {'event_id': self.event.id, 'ticket_tier_id': 9999, 'quantity': 1},
            ]
        }
        response = self.client.post('/api/v1/orders/', payload, format='json')

        self.assertEqual(response.status_code, 400)
        self.assertEqual(Ticket.objects.count(), 0)
        self.assertEqual(Order.objects.count(), 0)
```
Let's talk about what this code is doing.
- The first item is valid and creates 2 tickets before the second item fails.
- `Ticket.objects.count() == 0` proves those 2 tickets were rolled back. Without `atomic()`, this test would crash with `DoesNotExist` and leave 2 orphan tickets behind.

---

### 4. Send an order confirmation email with a background task.

After someone buys tickets, we want to email them a confirmation. Sending email means talking to a mail server over the network. That can take seconds, and sometimes it fails. If we send it inside the request, the user sits on a loading spinner waiting for something they don't need to wait for, and a mail server outage would break checkout.

The fix is a **background task**. The view puts a small job in a **queue** and responds right away. A separate **worker** process picks the job up and sends the email.

```
Browser ──POST /orders/──▶ Django view ──save order──▶ Database
   ▲                           │
   └──── 201 (fast!) ──────────┤ enqueue task
                               ▼
                        Task queue (a database table)
                               │
                               ▼
                     Worker (db_worker) ──▶ sends email
```

Django 6.0 added a built-in **Tasks framework** (`django.tasks`). It gives us a standard way to define and queue tasks. Django only ships two backends, though:
- `ImmediateBackend` runs the task straight away, in the same process. It's handy for tests, but it doesn't actually run anything in the background.
- `DummyBackend` stores tasks and never runs them.

To get a real queue and worker, we'll use the `django-tasks-db` package. It stores queued tasks in a database table and gives us a `db_worker` command. Bigger projects often use Celery or RQ with Redis instead, but the idea is the same.

#### 4.1. Install the package.

```
pip install django-tasks-db
```

Then add `django-tasks-db==0.13.0` to `requirements.txt` (pip also installs `django-stubs-ext` and `typing_extensions` with it).

#### 4.2. Configure tasks and email in the file `ticketmono_backend/settings.py`.

```python
INSTALLED_APPS = [
    # ... other apps ...
    "corsheaders",
    "django_tasks_db",
    "core",
    "event_tickets",
]

# ... other settings ...

# Background tasks
# https://docs.djangoproject.com/en/6.0/topics/tasks/
# The database backend stores queued tasks in a table. Run a worker with
# `python manage.py db_worker` to process them.

TASKS = {
    "default": {
        "BACKEND": "django_tasks_db.DatabaseBackend",
    }
}


# Email
# The console backend prints emails in the terminal instead of sending them.

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
DEFAULT_FROM_EMAIL = "TicketMono <tickets@ticketmono.example>"
```
Let's talk about what this code is doing.
- `django_tasks_db` is added to `INSTALLED_APPS` because it has its own model (the table queued tasks are saved in) and its own `db_worker` management command.
- `TASKS` works like `DATABASES` or `CACHES`: a dictionary of named backends, with `"default"` used unless a task says otherwise.
- The **console email backend** prints each email to the terminal instead of sending it. We can see exactly what would be sent without setting up a real mail server.
- `DEFAULT_FROM_EMAIL` is used when `send_mail` is given `from_email=None`.

Create the task table:

```
python manage.py migrate
```

#### 4.3. Write the task in a new file `event_tickets/tasks.py`.

```python
from django.core.mail import send_mail
from django.tasks import task

from .models import Order


@task
def send_order_confirmation(order_id):
    # Tasks receive the id, not the Order itself. Arguments are stored as JSON
    # until a worker picks the task up, so they have to be simple values.
    order = (
        Order.objects.select_related("customer")
        .prefetch_related("tickets__tier__event")
        .get(pk=order_id)
    )

    if not order.customer.email:
        return

    lines = [
        f"{ticket.tier.event.name}: {ticket.tier.name} (${ticket.tier.price})"
        for ticket in order.tickets.all()
    ]
    message = (
        f"Hi {order.customer.username},\n\n"
        f"Thanks for your order! Here are your tickets:\n\n"
        + "\n".join(lines)
        + f"\n\nTotal: ${order.total_price}\n"
    )

    send_mail(
        subject=f"TicketMono order #{order.pk} confirmed",
        message=message,
        from_email=None,
        recipient_list=[order.customer.email],
    )
```
Let's talk about what this code is doing.
- `@task` turns a normal function into a Django task. You can still call it like a normal function, but you can also call `send_order_confirmation.enqueue(...)` to queue it.
- We pass `order_id`, **not** the `Order` object. Queued tasks are saved as JSON until a worker runs them, possibly much later, so the arguments must be simple values like numbers and strings. Loading the order fresh in the task also means we get its latest data.
- We use `select_related` and `prefetch_related` here too (Step 1 again!). Background code still benefits from fast queries.
- Users who registered without an email are skipped instead of crashing the task.

#### 4.4. Queue the task when an order is created in the file `event_tickets/views.py`.

```python
from .tasks import send_order_confirmation
# ... other imports ...

class OrderViewSet(viewsets.ModelViewSet):
    # ... other code ...

    def create(self, request, *args, **kwargs):
        # ... validate the request ...

        with transaction.atomic():
            # ... create the tickets and order ...

            # Queue the email only once the order is really saved.
            transaction.on_commit(lambda: send_order_confirmation.enqueue(order.id))

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
```
Let's talk about what this code is doing.
- `send_order_confirmation.enqueue(order.id)` adds the task to the queue and returns straight away. It doesn't send the email itself.
- `transaction.on_commit(...)` waits to run the function until the transaction **commits**. Here's why that matters:
    - If we enqueued inside the transaction, a fast worker could pick up the task **before the order is saved** and fail with `Order.DoesNotExist`.
    - If the transaction rolled back after we enqueued, the customer would get a confirmation email for an order that **doesn't exist**.
- `on_commit` takes a function with no arguments, so we wrap the call in a `lambda`.
- This is the connection to Step 3: database changes can be rolled back, but side effects like emails can't. Wait until the data is safely saved, then trigger them.

#### 4.5. Run the worker.

You need **two terminals** now, both in `ticketmono_backend/` with the virtual environment activated.

Terminal 1, the web server:
```
python manage.py runserver
```

Terminal 2, the worker:
```
python manage.py db_worker
```

Start the frontend (`npm run dev` in `ticketmono_frontend/`), log in as a user **who has an email address**, and buy some tickets. The checkout finishes right away, and a moment later the email shows up in the **worker's** terminal, not the server's:

```
Task id=0cf325ae-... path=event_tickets.tasks.send_order_confirmation state=RUNNING
Subject: TicketMono order #1 confirmed
From: TicketMono <tickets@ticketmono.example>
To: demo@example.com

Hi demo_worker,

Thanks for your order! Here are your tickets:

Demo Show: GA ($25.00)

Total: $25.00
-------------------------------------------------------------------------------
Task id=0cf325ae-... path=event_tickets.tasks.send_order_confirmation state=SUCCESSFUL
```

Try these to see the queue in action:
- **Make the task slow.** Add `import time` and `time.sleep(5)` at the top of `send_order_confirmation`. Checkout is still instant. Only the worker waits.
- **Stop the worker** (`Ctrl+C`) and place an order. Checkout still works. Start the worker again and the email it missed gets sent. Nothing is lost, because the task is saved in the database.
- **Look at the queue** in the Django admin. `django-tasks-db` adds a page listing every task and its status.

Remember to remove the `time.sleep(5)` when you're done.

#### 4.6. Test the email in the file `event_tickets/tests.py`.

```python
from django.core import mail
from django.test import override_settings
# ... other imports ...

class EventTicketsTestCase(APITestCase):
    def setUp(self):
        cache.clear()
        self.user = User.objects.create_user(
            username='testuser',
            email='testuser@example.com',
            password='testpass123',
            role='user',
        )
        # ... the rest of setUp ...

    @override_settings(
        TASKS={'default': {'BACKEND': 'django.tasks.backends.immediate.ImmediateBackend'}}
    )
    def test_create_order_emails_confirmation_after_commit(self):
        self.client.force_authenticate(user=self.user)
        payload = {
            'items': [
                {'event_id': self.event.id, 'ticket_tier_id': self.tier.id, 'quantity': 2},
            ]
        }
        with self.captureOnCommitCallbacks() as callbacks:
            response = self.client.post('/api/v1/orders/', payload, format='json')

        # Nothing is sent until the transaction commits.
        self.assertEqual(response.status_code, 201)
        self.assertEqual(len(mail.outbox), 0)

        for callback in callbacks:
            callback()

        self.assertEqual(len(mail.outbox), 1)
        email = mail.outbox[0]
        self.assertEqual(email.to, ['testuser@example.com'])
        self.assertIn(f"order #{response.data['id']}", email.subject)
        self.assertIn('Total: $50.00', email.body)
```
Let's talk about what this code is doing.
- We give the test user an email address in `setUp`, because the task skips users who don't have one.
- `@override_settings(TASKS=...)` switches this one test to the `ImmediateBackend`, so the task runs straight away instead of waiting for a worker that isn't running.
- Each test runs inside a transaction that never commits, so `on_commit` callbacks would normally never run. `self.captureOnCommitCallbacks()` collects them so we can decide when to run them.
- Checking `len(mail.outbox) == 0` **before** running the callbacks proves the email waits for the commit. If someone removed `on_commit`, this check would fail.
- During tests, Django swaps in an email backend that saves emails to `mail.outbox` instead of printing or sending them.

---

## Lesson 2: Secrets and Security

### 5. Move settings and secrets into environment variables in the file `ticketmono_backend/settings.py`.

Open `settings.py` and look at the top:

```python
SECRET_KEY = "django-insecure-34dih9#1+q0qg8)4tc^q7c!o74e%!2sgb6_(&jecqd0cfxqw3+"
DEBUG = True
ALLOWED_HOSTS = []
```

That `SECRET_KEY` signs our JWTs. Anyone who has it can create a valid token for **any user**, including an organizer. Right now it's committed to Git, so it's in every copy of the repository and every fork, forever. Deleting it in a later commit doesn't help either, because it's still in the history.

The fix is to keep **configuration in the environment, not in the code**. The code reads values like the secret key from **environment variables**, and each place the code runs (your laptop, a test server, production) sets its own values.

#### 5.1. Install `python-dotenv`.

Setting environment variables by hand every time you open a terminal gets old fast. `python-dotenv` reads them from a `.env` file instead.

```
pip install python-dotenv
```

Then add `python-dotenv==1.2.4` to `requirements.txt`.

#### 5.2. Create the file `.env.example` next to `manage.py`.

```
# Copy this file to .env and fill in real values.
# .env is in .gitignore, so it never gets committed. This example file does.

# Generate a new one with:
# python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
DJANGO_SECRET_KEY=change-me

DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
```
Let's talk about what this file is doing.
- `.env.example` is **committed**. It lists every variable the project needs, with fake or safe values, so a new teammate knows what to set.
- The real `.env` is **never committed**. Check that `.env` is in your `.gitignore` (it already is in this repo).
- Make your own copy and generate a real secret key:

```
cp .env.example .env
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Paste the generated key in place of `change-me` in `.env`.

#### 5.3. Read the values in the file `ticketmono_backend/settings.py`.

```python
import os
from datetime import timedelta
from pathlib import Path

from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Read the .env file next to manage.py into os.environ.
# Real environment variables win over values in the file.
load_dotenv(BASE_DIR / ".env")

# SECURITY WARNING: keep the secret key used in production secret!
# No default on purpose: the server refuses to start without one.
SECRET_KEY = os.environ["DJANGO_SECRET_KEY"]

# SECURITY WARNING: don't run with debug turned on in production!
# Off unless the environment explicitly turns it on.
DEBUG = os.environ.get("DJANGO_DEBUG", "False") == "True"

ALLOWED_HOSTS = os.environ.get("DJANGO_ALLOWED_HOSTS", "").split(",")

# ... other settings ...

CORS_ALLOWED_ORIGINS = os.environ.get(
    "CORS_ALLOWED_ORIGINS", "http://localhost:5173"
).split(",")

# ... other settings ...

EMAIL_BACKEND = os.environ.get(
    "EMAIL_BACKEND", "django.core.mail.backends.console.EmailBackend"
)
```
Let's talk about what this code is doing.
- `load_dotenv(...)` copies each line of `.env` into `os.environ`. If a variable is already set in the real environment, it **isn't** overwritten. That's how a hosting provider's settings win over a stray `.env` file.
- `os.environ["DJANGO_SECRET_KEY"]` uses square brackets, so it raises a `KeyError` if the variable is missing. That's on purpose. A server that won't start is much better than a server quietly running with a weak default key.
- `os.environ.get("DJANGO_DEBUG", "False")` uses a **safe default**. If someone forgets to set it, debug mode is **off**. Environment variables are always strings, so we compare with `== "True"` instead of trusting `bool("False")`, which is `True`!
- `.split(",")` turns `"localhost,127.0.0.1"` into a list, because environment variables can't hold lists.
- `from datetime import timedelta` used to sit in the middle of the file. Move it up to the top with the other imports.
- Delete the old hard-coded `SECRET_KEY`. Make a **new** key for any real deployment, because the old one is public now.

Restart `runserver`. Then try renaming `.env` and starting it again to see the `KeyError`.

#### 5.4. What about the frontend?

Open `ticketmono_frontend/src/api/client.js`:

```javascript
// Fall back to the local Django dev server if the env variable is not set.
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'
```

Vite also reads `.env` files, but only variables that start with `VITE_` are passed to your code. **Every `VITE_` variable gets built into the JavaScript bundle that's sent to the browser**, so anyone can read it in DevTools.
- An API URL is fine there, because it isn't a secret.
- An API key, a database password or the Django `SECRET_KEY` must **never** go in a `VITE_` variable. If the frontend needs to use a secret service, the request should go through your backend, which keeps the secret.

Real projects take this further with tools like **AWS Secrets Manager**, **Azure Key Vault**, **HashiCorp Vault**, or the environment settings in hosting platforms like Render and Railway. They store secrets encrypted, control who can read them, and make it easy to **rotate** (replace) a key when it leaks.

---

### 6. Backend and frontend security best practices.

Django and React already protect against a lot by default, but not everything. Let's fill in a few gaps in TicketMono.

#### 6.1. Enforce password rules on registration in the file `core/serializers.py`.

`settings.py` has a list of `AUTH_PASSWORD_VALIDATORS` (minimum length, not too common, not all numbers, not too similar to the username). Those only run automatically in Django's **own** forms, like the admin. Our API's register endpoint never calls them, so `"password"` is accepted right now.

```python
from django.contrib.auth.password_validation import validate_password
# ... other imports ...

class UserRegistrationSerializer(serializers.ModelSerializer):
    # ... password field and Meta ...

    def validate_password(self, value):
        # Run the AUTH_PASSWORD_VALIDATORS from settings.py (too short, too
        # common, all numbers...). They only run automatically in Django's
        # own forms, so an API has to call them itself.
        validate_password(value)
        return make_password(value)
```
Let's talk about what this code is doing.
- Django's `validate_password(value)` runs every validator in `AUTH_PASSWORD_VALIDATORS`. If any of them fail, it raises a `ValidationError`, and DRF returns it as a `400` with a helpful message under `"password"`.
- The serializer method is also called `validate_password`. DRF calls a `validate_<field>` method automatically for each field. Inside it, `validate_password(value)` refers to the **imported** Django function, not the method, because methods are reached with `self.`.
- `make_password(value)` still hashes the password, so we never store it as plain text.

#### 6.2. Rate limit the API in the files `ticketmono_backend/settings.py`, `core/views.py` and `core/urls.py`.

Without limits, an attacker can try thousands of passwords per minute against `/auth/login/`. That's called a **brute force** attack. **Throttling** limits how many requests a client can make in a period of time.

```python
# ticketmono_backend/settings.py
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    # Limit how often a client can call the API so one client can't flood it.
    "DEFAULT_THROTTLE_CLASSES": (
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
        "rest_framework.throttling.ScopedRateThrottle",
    ),
    "DEFAULT_THROTTLE_RATES": {
        "anon": "100/hour",
        "user": "1000/hour",
        # Login and register are tighter to slow down password guessing.
        "auth": "10/minute",
    },
}
```

```python
# core/views.py
from rest_framework_simplejwt.views import TokenObtainPairView
# ... other imports ...


class UserRegistrationView(APIView):
    permission_classes = (AllowAny,)
    throttle_scope = "auth"

    # ... post ...


class LoginView(TokenObtainPairView):
    # Uses the tighter "auth" rate from settings.py to slow down password guessing.
    throttle_scope = "auth"
```

```python
# core/urls.py
from rest_framework_simplejwt.views import TokenRefreshView

from core.views import LoginView, MeView, UserRegistrationView

urlpatterns = [
    path("register/", UserRegistrationView.as_view(), name="auth-register"),
    path("login/", LoginView.as_view(), name="auth-login"),
    # ... other urls ...
]
```
Let's talk about what this code is doing.
- `AnonRateThrottle` limits clients who aren't logged in (by IP address). `UserRateThrottle` limits logged-in users (by user id). These apply to every view.
- `ScopedRateThrottle` only applies to views that set a `throttle_scope`. Its rate comes from the matching key in `DEFAULT_THROTTLE_RATES`, which here is `"auth": "10/minute"`.
- When a client goes over the limit, DRF returns **`429 Too Many Requests`** with a `Retry-After` header.
- We subclass `TokenObtainPairView` as `LoginView` just to add `throttle_scope`, and point the `login/` URL at it.
- Throttle counts are stored in the **cache** from Step 2. That's another reason to use a shared cache like Redis in production. With `LocMemCache`, each server process counts separately.

#### 6.3. Turn on production security settings in the file `ticketmono_backend/settings.py`.

```python
# Production security
# Only turned on when DEBUG is off, because they need HTTPS to work.
# Run `python manage.py check --deploy` to see what's still missing.

if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 60 * 60 * 24 * 30
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
```
Let's talk about what this code is doing.
- `SECURE_SSL_REDIRECT` sends any `http://` request to `https://`, so passwords and tokens are always **encrypted in transit**.
- `SESSION_COOKIE_SECURE` and `CSRF_COOKIE_SECURE` stop the browser from sending those cookies over plain HTTP.
- `SECURE_HSTS_SECONDS` tells browsers "only ever use HTTPS for this site" for the next 30 days, even if the user types `http://`.
- They're inside `if not DEBUG:` because your local `runserver` doesn't support HTTPS. Turning them on locally would redirect you to a page that doesn't load.

Django has a built-in checklist. Compare the two:

```
python manage.py check --deploy
```
```
DJANGO_DEBUG=False python manage.py check --deploy
```

(On Windows PowerShell, use `$env:DJANGO_DEBUG="False"; python manage.py check --deploy`, then `Remove-Item Env:DJANGO_DEBUG`.)

With debug on you'll see several warnings. With debug off, only one is left: `SECURE_HSTS_PRELOAD`. That's a bigger commitment that you'd only turn on deliberately for a real domain.

#### 6.4. Test the new rules in the file `core/tests.py`.

```python
from django.core.cache import cache
# ... other imports ...


class UserRegistrationViewTestCase(APITestCase):
    url = "/api/v1/auth/register/"

    def setUp(self):
        # Throttle counts live in the cache, which isn't reset between tests.
        cache.clear()

    # ... other tests ...

    def test_register_rejects_common_password(self):
        payload = {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "password",
        }
        response = self.client.post(self.url, payload)

        self.assertEqual(response.status_code, 400)
        self.assertIn("password", response.data)
        self.assertEqual(User.objects.count(), 0)


class LoginThrottleTestCase(APITestCase):
    url = "/api/v1/auth/login/"

    def setUp(self):
        cache.clear()

    def test_login_is_throttled_after_too_many_attempts(self):
        payload = {"username": "nobody", "password": "wrong-password"}
        for _ in range(10):
            response = self.client.post(self.url, payload)
            self.assertEqual(response.status_code, 401)

        response = self.client.post(self.url, payload)

        self.assertEqual(response.status_code, 429)
```
Let's talk about what this code is doing.
- `"password"` is 8 characters, so it passes the serializer's `min_length=8`. It's only rejected because Django's `CommonPasswordValidator` now runs, so this test would fail without Step 6.1.
- The throttle test makes 10 bad login attempts (each a `401`), then checks the 11th is blocked with a `429`.
- `cache.clear()` in `setUp` is needed again. Without it, register attempts from other tests count toward the same limit, and tests start failing depending on the order they run in.

Run the whole suite with `python manage.py test`. All 30 tests should pass.

#### 6.5. Security we already get for free, and what to watch for.

Not everything needs new code. Know what your tools already protect you from, so you don't accidentally turn it off.

**Backend**
- **SQL injection:** the Django ORM always sends values separately from the SQL (**parameterized queries**), so `Event.objects.filter(name=user_input)` is safe. The risk comes back if you build SQL yourself with f-strings in `.raw()` or `cursor.execute()`. Don't.
- **Authorization:** being logged in isn't the same as being allowed. Our `IsEventOrganizer` permission and `get_queryset()` filtering (`Order.objects.filter(customer=request.user)`) stop users from reading or editing other people's data. Every ViewSet should set its permissions explicitly.
- **CSRF:** Django's CSRF protection is for cookie-based sessions. Our API sends the JWT in an `Authorization` header, which the browser never adds by itself, so CSRF attacks don't apply to it the same way.
- **Dependencies:** your packages can have vulnerabilities too. Run `pip list --outdated` and keep `requirements.txt` up to date.

**Frontend**
- **XSS (Cross-Site Scripting):** React escapes everything you render with `{}`. If an organizer names an event `<script>alert(1)</script>`, React shows that text instead of running it. The escape hatch, `dangerouslySetInnerHTML`, turns that protection off. Avoid it, especially with user-provided content.
- **Where tokens live:** `src/api/tokenStorage.js` keeps our JWTs in `localStorage`. That's simple, but any JavaScript running on the page can read `localStorage`. If an attacker ever got a script onto the page through XSS, they could steal the tokens. The common alternative is an **httpOnly cookie**, which JavaScript can't read, but then you need CSRF protection again. Neither is perfect. Know the trade-off you're making.
- **Content Security Policy (CSP):** a response header that tells the browser which sources scripts are allowed to load from. It's a second line of defence if XSS gets through.
- **Hiding a button isn't security:** `OrganizerRoute` hides organizer pages from regular users, but anyone can call the API directly with Postman or `curl`. The backend permission checks are what actually protect the data.
- **Dependencies:** run `npm audit` in `ticketmono_frontend/` to check for known vulnerable packages.

---

### 7. Commit, push, and open a pull request.

Check that `.env` is **not** in the list of changes, then commit everything else:

```
git status
git add .
git commit -m "Add query optimization, caching, background emails, transactions and security settings"
git push --set-upstream origin <your-branch-name>
```

Open a pull request on GitHub. In the description, tell your reviewer that they need to copy `.env.example` to `.env`, run `pip install -r requirements.txt` and `python manage.py migrate`, and start `python manage.py db_worker` in a second terminal.

## Challenge/Exercise

### 1. Email ticket holders when an event changes
- When an organizer changes an event's `date_time` or `venue`, queue a task that emails **every** attendee with a ticket to that event.
- Only queue it when one of those fields actually changed, not on every save.
- Use `transaction.on_commit` so nobody is emailed about a change that was rolled back.
- Load all the ticket holders with as few queries as you can, and prove it with `assertNumQueries`. Each person should get only one email, even if they bought several tickets.
- Write a test that uses `captureOnCommitCallbacks` and `mail.outbox` to check the right people are emailed.

### 2. Clear the events cache no matter how an event changes
- Right now, editing an event in the Django admin leaves the cached events list out of date for up to 5 minutes.
- Use Django **signals** (`post_save` and `post_delete`) on `Event` and `TicketTier` to clear `EVENTS_LIST_CACHE_KEY` whenever either one changes, from anywhere.
- Remove the `cache.delete(...)` calls from the views once the signals cover them, and check that your Step 2 tests still pass.

## Conclusion

In this example we learned about:
- Spotting **N+1 queries** and fixing them with `select_related` (foreign keys, one `JOIN`) and `prefetch_related` (many-sides, one extra query per relationship), and locking the fix in with `assertNumQueries`.
- **Caching** a busy, shared response with Django's low-level cache API (`cache.get`, `cache.set`, `cache.delete`), including timeouts and cache invalidation.
- Using **`transaction.atomic()`** so related database changes are saved all together or not at all, and that any exception leaving the block rolls them back.
- Moving slow work out of the request with Django 6's **Tasks framework** (`@task`, `.enqueue()`), using `django-tasks-db` and `db_worker` as a real queue and worker.
- Queuing tasks with **`transaction.on_commit`** so they only run once the data they depend on is saved.
- Keeping **secrets and configuration in environment variables** with `.env` and `python-dotenv`, committing a `.env.example` instead of the real values, and failing loudly when a required secret is missing.
- Backend security: running Django's **password validators** in the API, **throttling** login and register, turning on **HTTPS-only settings** in production, and checking with `manage.py check --deploy`.
- Frontend security: React's built-in XSS protection, the risk of `dangerouslySetInnerHTML`, the `localStorage` vs httpOnly cookie trade-off, and that hiding UI is never a replacement for backend permissions.

Some things to use with caution:
- Prefetched data is only used by `.all()`. Calling `.filter()` or `.count()` on a prefetched relationship runs a new query.
- Only cache responses that are the same for every user, unless the cache key includes the user.
- `LocMemCache` is per process. Production needs a shared cache like Redis, for cached data **and** for throttle counts.
- The cache isn't reset between tests the way the database is. Call `cache.clear()` in `setUp`.
- Transactions can't undo side effects like emails. Trigger those with `on_commit`.
- Task arguments must be JSON-serializable. Pass ids, not model instances.
- Nothing runs in the background unless a worker is running. With no `db_worker`, tasks just wait in the queue.
- Anything in a `VITE_` variable is public. A secret that was ever committed is leaked: replace it, don't just delete it.
