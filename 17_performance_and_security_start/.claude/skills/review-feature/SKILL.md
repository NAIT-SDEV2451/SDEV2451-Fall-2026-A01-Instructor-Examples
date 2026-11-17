---
description: Runs the tests and reviews the current branch against the plan and rules, filling in the scorecard with evidence.
disable-model-invocation: true
---

In `ticketmono_backend`, run `coverage run manage.py test` and `coverage report`. In `ticketmono_frontend`, run `npm run test:run`.

Then compare `git diff main` against the plan and the rules in `.claude/rules/`.

Give a yes or no, with evidence from the code, for each item:

1. Followed the plan without quiet additions
2. Reused existing code and patterns instead of duplicating
3. Followed the rules
4. Tests pass, new backend code is covered, and tests would fail if the feature broke
5. Security holds at the API: roles and ownership are enforced on the server, not just hidden in the UI
6. Data is right, including edge cases

Point out what you're unsure of rather than guessing. Don't fix anything or change any files; report only.
