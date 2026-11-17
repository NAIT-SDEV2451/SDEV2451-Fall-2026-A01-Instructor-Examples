# Workflow

- Plan before editing, unless it's a small fix.
- Stop and ask before:
  - adding a dependency
  - changing an API URL or response shape
  - changing a model or adding a migration
  - changing, skipping or deleting a test
  - adding anything that wasn't requested
- Reuse existing code before writing new code.
- Don't change files through shell commands when the edit tool can do it, so changes appear as reviewable diffs.
- Only say tests pass after running them. Report failures as they are.
- Ask before committing or pushing.