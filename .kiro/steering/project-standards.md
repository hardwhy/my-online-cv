# Project Git Workflow

When the user asks to "ship", "commit", or "prepare a PR", follow these steps:

1. **Atomic Commits**: NEVER commit everything in one go if changes are unrelated. Break them down into logical units.
2. **Review Changes**: Before committing, run `git status` and `git diff --cached` to verify what's being staged.
3. **Checkout**: Always check if we should be on a new feature branch.
4. **Commit**: Use descriptive, conventional commit messages (e.g., `feat:`, `fix:`, `refactor:`).
5. **Push**: Push the current branch to `origin`.
6. **Pull Request**: If the GitHub CLI (`gh`) is available, propose creating a PR.

# Commit Planning

For large changesets, PROPOSE a "Commit Plan" to the user first:
- Group related file changes.
- Suggest a message for each group.
- Wait for user confirmation before executing.

# Coding Standards

- Use shared components from `@web-cv/shared-ui` whenever possible.
- Follow the Tailwind utility patterns defined in `packages/shared-ui/src/styles/base.css`.
- Maintain dark mode compatibility using `dark:` variants.
