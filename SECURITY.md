# Security Policy

Foundry is a security and quality auditing suite, so its own security is held
to the bar it sets. If you find a vulnerability, please report it privately.

## Reporting a vulnerability

Use GitHub's private vulnerability reporting: open the **Security** tab of this
repository and choose **Report a vulnerability**. That creates a private
advisory only the maintainers can see, so the issue is never exposed before it
is fixed.

Please do not open a public issue for a security problem.

Include what you found, where (a file and line, or a URL), and how to reproduce
it. We aim to acknowledge within a few days.

## Scope

- **The skills** run locally inside your own Claude Code. They read your code
  and report on it; they send nothing anywhere and require no account.
- **The site** hosts published audit reports. A report is private to its owner
  behind Supabase magic-link sign-in; only the public example reports are
  ungated, and non-owner report URLs return 404.

Generally out of scope: issues that require an already-compromised machine or a
self-inflicted action, and missing hardening with no demonstrated impact (a
note is still welcome).

## Supported versions

This is an early release (v0.1.0). The latest `main` is the supported version,
and fixes land there.
