---
name: Safe Git Commit Workflow
description: Procedures for ensuring git commits are successful before pushing.
---

# Safe Git Commit Workflow

This skill defines the mandatory workflow for committing and pushing code changes.

## Rules

1.  **Never Auto-Push**: Do not chain `git push` immediately after `git commit` in the same execution step if there is a risk of the commit failing (e.g., due to linting or pre-commit hooks).
2.  **Check Commit Status**: Always run `git commit` first and WAIT for the process to complete.
3.  **Handle Errors**:
    - Check the output of `git commit`.
    - If it contains errors (Lint failures, Prettier checks, etc.), **DO NOT PUSH**.
    - Diagnose and fix the errors strictly.
    - Retry the commit.
4.  **Push Only on Success**: Only execute `git push` after a successful `git commit` (exit code 0).

## Procedure

1.  **Stage**: `git add .` (or specific files)
2.  **Commit**: `git commit -m "..."`
3.  **Verify**: Read output.
    - _Failure_: Fix issues -> Retry Step 1/2.
    - _Success_: Proceed.
4.  **Push**: `git push`
