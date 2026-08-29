---
name: micro-commits
description: "Guidelines and procedures for executing granular, atomic micro-commits following Conventional Commits standards."
---

# Micro-Commits Workflow & Rules

This skill governs creating clean, atomic, logical micro-commits with standard Conventional Commit messages.

## Core Rules for Micro-Commits

1. **Atomicity**: Each commit must represent a single logical change or concern (e.g. don't mix UI changes with backend models or sync logic).
2. **Conventional Commits Specification**:
   - Format: `<type>(<scope>): <short imperative summary>`
   - Types:
     - `feat`: New feature or user-facing capability
     - `fix`: Bug fix or error prevention
     - `refactor`: Code changes that neither fix a bug nor add a feature
     - `style`: Formatting, CSS, visual enhancements
     - `docs`: Documentation, guides, comments
     - `chore`: Build scripts, dependencies, configuration, release packaging
     - `test`: Adding or updating test cases
   - Scopes examples:
     - `extension`, `popup`, `dashboard`, `links`, `sync`, `frontend`, `server`, `models`
3. **Commit Message Conventions**:
   - Use lowercase imperative mood in the subject (e.g. `feat(links): add right-click link saver manager` instead of `Added link saver`).
   - No trailing period in the subject line.
   - Include clear description in commit body if the change warrants additional context.
4. **Verification Before Commit**:
   - Run typechecking / syntax checks / tests before committing to guarantee green build state on every commit.
