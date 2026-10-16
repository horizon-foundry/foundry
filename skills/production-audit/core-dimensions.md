# Core dimensions

Each section holds the rows and checks beyond that dimension's SKILL.md bullet.

## security: base pass

**Authz matrix.** One row per endpoint, page loader, fetch-by-ID, action, and privileged flow. Add rows for side channels: jobs acting for a user, search indexes, signed download URLs, cached responses, realtime channels. Reads of a declared regulated data class add an access-logged column (actor, record, time). A privileged support flow (impersonation, admin override) gets a row naming its gate and the audit-log write for actor and target; impersonation is time-boxed, visibly marked, and its writes are attributed to the operator.

**Abuse table.** One row per unauthenticated or costly endpoint other than the auth flows (their attempt limits are the authentication pass): its limit, keyed per actor, and the layer it lives at. Checkout and card-attach rows add per-actor and per-source limits and bot or provider fraud controls (a live attack is `notAssessed`). Signup and free-tier rows add per-actor caps on costly free actions and verification before a resource grant. Where user content is visible to others: an operator removal path exists in code, is authz-gated and logged, and reaches derived copies (cache, CDN, search).

**Trust-boundary additions.** Import parsers: encoding detection, size and row limits, and malformed rows rejected or reported. Output sinks with their encoding: HTML, CSV formula prefix, shell, SQL, model prompt. Outbound fetchers of a user- or model-supplied URL: allowlist, private and metadata address block, re-check after redirect. Framework public env prefixes (`NEXT_PUBLIC_`, `VITE_`, `EXPO_PUBLIC_`, `PUBLIC_`): report any server secret that reaches the client bundle. Inbound webhooks verify the sender's signature before acting. Uploads have a size and type limit, are stored where they cannot run or be served as code, and are scanned where the declared data class calls for it.

**Declared commitments.** One row per entry in the release policy's `commitments:` that no other pass or dimension owns (residency is infra's), such as an SSO requirement on an app with no federation code: present in the code or absent.

## security: authentication pass

**Authentication lifecycle table.** With managed auth (Supabase, Clerk, Auth0), prune the rows the provider owns, each with a reason, and keep the ones the app wires (redirects, linking, session revocation, enumeration). One row per auth flow, including each credential kind. Properties per row, where they apply:

- The identifier is normalized once, and uniqueness and lookup use the normalized form.
- Reset and magic-link tokens expire, are single use, and a newer token or a password change invalidates them.
- Session lifetime is bounded. All sessions are revoked server-side on password change, reset, user request, and SCIM deprovisioning where SCIM exists. The session cookie is Secure, HttpOnly, SameSite, and domain-scoped.
- Attempt limits per account and per source on login, reset, verify, and MFA, with the layer. Lockout cannot be triggered by a third party against a named account, or an owner recovery path exists.
- An address grants access or links accounts only after verification, and linking proves both identities. Email, password, factor, and payout changes need recent authentication.
- Password hash algorithm and parameters (argon2id, bcrypt, scrypt), and a breached-password check or its declared absence. API keys are stored hashed, scoped, and revocable.
- Login, reset, signup, and verify answer the same for known and unknown identifiers (timing parity is runtime: `notAssessed` on a static run). Every return, next, or redirect parameter is validated against same-origin or an allowlist.
- Account recovery cannot bypass a factor that frame's authn line declares.
- With SAML or OIDC federation: assertion signature, audience, recipient, and replay checks.

## security: egress pass

**Sensitive-data egress map**. One row per sink: logs (including error payloads and full URLs with query strings), error tracker, analytics, session replay, each LLM call (prompt, and prompt or output logging), embeddings and vector stores, vendors. Columns: data classes reaching it (from frame's data-classification line) x redaction point. No password, token, or raw card data (PAN, CVC) reaches the database, logs, or analytics; the provider tokenizes cards. An LLM row adds the provider's retention and training settings (`configuration-confirmed`, or `notAssessed` for contract terms). Where a privacy policy is published, compare it to the map: an undisclosed sink or data class is a finding.

## security: agent tools pass

**Agent tool authority table**. One row per tool: effect, reversibility, the gate in code (allowlist, scope, human approval for an irreversible effect), and a kill switch.

## concurrency

A scheduled job overlapping its previous run, or running on two instances, has an overlap lock or an idempotent run key. Each cache names its invalidation trigger and its stale window after a write, including after an authz change. Inbound webhooks are deduped on the provider event ID, have a bounded replay window, and cannot regress state when events arrive out of order.

## reliability

The failure-path table gains two columns: what happens after retries exhaust (dead-letter, alert, or explicit drop), and whether the response is validated at the boundary, with the behavior on an unexpected shape. Add a row per OAuth integration (refresh on expiry, revoked-grant handling, a user-visible reconnect state). The email row adds: the sending domain authenticated with SPF, DKIM, and DMARC (DNS state `configuration-confirmed` or `notAssessed`); bounce and complaint events feed a suppression list checked before send; bulk and marketing sends carry unsubscribe and check the same list. Slow work (email, model calls, exports) runs off the request path. Outbound webhooks record each delivery and retry failures on a schedule.

## infra

- **Expiry inventory:** TLS certificates (auto-renew set), domains, signing keys, provider tokens, pinned model IDs against provider deprecation (an unpinned alias is a silent-change risk), and runtime and framework versions against vendor end of life. Each row names its renewal mechanism. Registrar and DNS state is `notAssessed` on a static run.
- **Credential scope:** CI, deploy, and agent configs in the repo (workflow tokens, MCP and agent settings), each scoped to its job. Operator machine state is `notAssessed`.
- **CI protections:** secret scanning runs, the default branch is protected, deploy credentials are short-lived (OIDC). Repo settings are `configuration-confirmed` by a read-only API call, else `notAssessed`.
- **Residency:** a declared region commitment is checked against storage and compute region config.
- **Transport and origins:** TLS everywhere with HSTS, and data stores encrypted at rest (`configuration-confirmed`, else `notAssessed`). CORS on credentialed routes allows named origins only.

## ui

Navigation state: the URL reflects meaningful view state, back and refresh restore it, and there is no history trap. A slow or failed request shows a state, never a hang. `--runtime` confirms both; otherwise `needs-verification`.

## Stored values

data-migration-safety checks these when it applies, otherwise reliability does. Timestamps are stored as UTC instants (or with a zone), and converted only at the edge. UTF-8 and collation hold end to end (database, API, CSV, email). Money is in integer minor units or a decimal type, with one rounding rule and the currency carried with the amount. Usage is recorded once, in the same transaction as the metered action, and the charge is computed from that record.
