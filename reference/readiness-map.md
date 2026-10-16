# Readiness map

This map lists every concern that decides whether a product is ready for real users. Each row states a property that is true or false of the product, names the owner that can show it, says when the concern applies, and names the kind of evidence that settles it. Evidence is one of four kinds: `code` (the source shows it), `config` (a setting shows it), `runtime` (only a live run shows it), or `record` (a written artifact shows it).

A row carries no status. A concern's status comes from running its owning skill or, for a row owned from outside, from the named owner's own record. Nobody ticks a box here. The map says where to look, and the skills hold the method.

## Intent and declarations

| ID | Concern | Owner | Applies when | Evidence |
|---|---|---|---|---|
| product-frame-declared | The product states who it is for, which struggle it fixes, how success will be measured, and what would show the idea wrong. | frame | always | record |
| security-frame-declared | Security posture is declared before building: the data classes held, the trust boundaries, the sign-in model, and where secrets live. | frame | always | record |
| sign-in-model-declared | The declared sign-in model names the factors and the account recovery path, or states that there are no accounts. | frame | always | record |
| regulated-regime-named | A regulated class of data names the regime that governs it. | frame | the product holds regulated data | record |
| release-policy-declared | The release policy states the project type, the risk tier and the audience, and lists which gates it requires. | foundry | always | record |
| commitments-declared | Each buyer or contract requirement in force is listed with the record that proves it. | foundry | a buyer or contract sets a requirement | record |
| recovery-targets-declared | The release policy states the longest recovery time and the largest data loss the product accepts. | foundry | the product stores data | record |
| gate-exceptions-owned | Each waived gate names an owner and a revisit date, and past that date the gate is scored as required. | foundry | a gate is waived | record |
| feature-intent-declared | A substantial feature states what it must do and what observation would show the design wrong, before any plan is written. | feature-design | a substantial feature is being designed | record |
| acceptance-source-recorded | When a named customer supplies the acceptance criteria, the design record names that customer as the source. | feature-design | a named customer supplies acceptance criteria | record |
| disclosure-contact-published | The repository says where to send a report of a vulnerability. | scaffold | the project is a web product, a service, or a library | record |
| doc-set-has-no-placeholders | The project's doc set is complete and no `{placeholder}` marker remains in it. | scaffold | always | record |

## Sign-in and sessions

| ID | Concern | Owner | Applies when | Evidence |
|---|---|---|---|---|
| identifier-normalized | An email address or username is normalized once, and both uniqueness and lookup use the normalized form. | production-audit/security | the product has sign-in | code |
| reset-links-single-use | A reset or magic link works once, expires soon, and dies when a newer link is issued or the password changes. | production-audit/security | the product has sign-in | code |
| sessions-bounded | A session has a limited life, and the server ends every session after a password change, after a reset, on the user's request, and on deprovisioning. | production-audit/security | the product has sign-in | code |
| session-cookie-hardened | The session cookie is Secure, HttpOnly and SameSite, and is scoped to the right domain. | production-audit/security | the product has sign-in | config |
| sign-in-attempts-limited | Sign-in, reset, verification and second-factor endpoints cap attempts per account and per source. | production-audit/security | the product has sign-in | code |
| lockout-not-a-weapon | A stranger cannot lock a named account out, or the owner has a way back in. | production-audit/security | the product locks accounts | code |
| verification-before-access | An address grants access or links two accounts only after it is verified, and linking proves both identities. | production-audit/security | the product has sign-in | code |
| recent-auth-for-sensitive-changes | Changing the email, the password, a factor or payout details needs a recent sign-in. | production-audit/security | the product has sign-in | code |
| password-storage-sound | Passwords are stored with argon2id, bcrypt or scrypt, and are checked against known breaches, or the absence of that check is declared. | production-audit/security | the product stores passwords | code |
| api-keys-managed | API keys are stored hashed, limited in scope, and revocable by their owner. | production-audit/security | the product issues API keys | code |
| no-account-enumeration | Sign-in, reset, signup and verification answer the same way whether or not the account exists. | production-audit/security | the product has sign-in | code |
| redirect-targets-validated | A return, next or redirect parameter accepts only same-origin or allowlisted destinations. | production-audit/security | the product has sign-in | code |
| federation-assertions-checked | A SAML or OIDC response is checked for signature, audience, recipient and replay. | production-audit/security | the product accepts federated sign-in | code |
| recovery-keeps-factors | Account recovery cannot get around a second factor the product declares. | production-audit/security | the sign-in model declares a second factor | code |
| deprovisioning-ends-access | Removing a person at the identity provider ends their sessions and their keys. | production-audit/security | the product supports SCIM provisioning | code |
| sso-supported | Enterprise single sign-on works as the commitment states. | production-audit/security | the release policy declares an SSO commitment | code |

## Access control

| ID | Concern | Owner | Applies when | Evidence |
|---|---|---|---|---|
| reads-checked-per-record | Every read path checks that the caller may see that record, not only every write path. | production-audit/security | always | code |
| tenant-isolation | One customer's rows cannot be reached by another customer, enforced per table or per query. | production-audit/security | the product serves more than one tenant | code |
| side-channels-authorized | Jobs, search indexes, signed download links, cached responses and realtime channels check the viewer's rights. | production-audit/security | the product has jobs, search, downloads, caches or realtime channels | code |
| privileged-flows-gated | Support and admin overrides sit behind a gate and write down who acted on whom. | production-audit/security | the product has privileged flows | code |
| impersonation-bounded | Impersonation is time-limited, visibly marked, and attributes its writes to the operator. | production-audit/security | the product supports impersonation | code |
| regulated-reads-logged | A read of regulated data records who looked at which record, and when. | production-audit/security | frame declares a regulated data class | code |
| commitments-present-in-code | Each commitment in the release policy that no other pass owns is present in the code, or reported absent. | production-audit/security | the release policy declares a commitment | code |

## Abuse and spend

| ID | Concern | Owner | Applies when | Evidence |
|---|---|---|---|---|
| endpoint-rate-limits | Each unauthenticated or costly endpoint has a limit keyed per actor, and the layer that enforces it is known. | production-audit/security | always | code |
| card-testing-controlled | Checkout and card-attach endpoints limit attempts per actor and per source, and use fraud controls. | production-audit/security | the product takes cards | code |
| signup-abuse-capped | Free signup caps costly free actions per actor and verifies a person before granting a resource. | production-audit/security | the product offers free signup | code |
| content-removal-path | An operator can take down content that other users can see, behind a gate and a log, and the takedown reaches cached and indexed copies. | production-audit/security | users publish content that others can see | code |
| spend-bounded-in-code | Each metered dependency (model, email, compute) has a loop bound or cap in the code and a spend alert at the provider. | production-audit/performance-capacity | the product calls a metered dependency | code |
| unauthenticated-spend-bounded | Nothing a stranger can reach lets them run up the bill without limit. | production-audit/performance-capacity | a metered dependency is reachable without sign-in | code |

## Untrusted input and output

| ID | Concern | Owner | Applies when | Evidence |
|---|---|---|---|---|
| trust-boundaries-mapped | Every place untrusted input enters and every place privilege changes is listed with the file that handles it. | production-audit/security | always | code |
| server-validates-input | The server validates every input, so a client-side check is never the only one. | production-audit/security | always | code |
| injection-surfaces-closed | Untrusted text reaches queries, pages and commands only through parameterization or encoding. | production-audit/security | always | code |
| csrf-guarded | A state-changing request that rides on a cookie carries a defense against cross-site forgery. | production-audit/security | the product uses cookie sessions | code |
| uploads-contained | An uploaded file is size-limited, type-checked, scanned where it matters, and never run or served as code. | production-audit/security | the product accepts uploads | code |
| import-parsers-defensive | A file import detects the encoding, caps size and rows, and rejects or reports a bad row instead of writing half the file. | production-audit/security | the product imports files | code |
| output-encoded-per-sink | Data written to HTML, CSV, a shell, SQL or a model prompt is encoded for that sink, including the leading characters that make a spreadsheet run a formula. | production-audit/security | always | code |
| server-fetches-restricted | A server that fetches a URL a user or model supplies uses an allowlist, blocks private and cloud-metadata addresses, and checks again after a redirect. | production-audit/security | the server fetches supplied URLs | code |
| webhook-signatures-verified | An inbound webhook has its sender's signature verified before the product acts on it. | production-audit/security | the product receives webhooks | code |
| server-secrets-stay-off-client | No server secret reaches the client bundle through a public environment prefix. | production-audit/security | the framework exposes public environment prefixes | code |

## Supply chain and infrastructure

| ID | Concern | Owner | Applies when | Evidence |
|---|---|---|---|---|
| no-secrets-in-repo | No credential sits in the code, its history or its config files. | production-audit/phase-1 | always | code |
| exposed-keys-replaced | A key that ever appeared in the repo or in a chat is treated as exposed and replaced. | production-audit/phase-1 | a secret scan finds an exposed key | record |
| dependencies-scanned | Dependencies with known vulnerabilities are found and triaged before release. | production-audit/phase-1 | always | code |
| dependencies-are-real | Each direct dependency exists in its registry and is the package the code means to import. | production-audit/phase-1 | always | code |
| lockfiles-and-licenses | Each manifest has a committed lockfile that CI installs from, and dependency licenses fit the declared one. | production-audit/phase-1 | always | code |
| credentials-scoped-to-job | CI, deploy and agent credentials in the repo are limited to the job each one serves. | production-audit/infra | the repo has CI, deploy or agent config | config |
| ci-protections-on | CI scans for secrets, the default branch is protected, and deploy credentials are short-lived. | production-audit/infra | the repo has CI | config |
| transport-and-storage-encrypted | Traffic is encrypted in transit and stored data is encrypted at rest. | production-audit/infra | always | config |
| headers-and-cors-set | Security headers are set, and cross-origin access is not open to every origin. | production-audit/infra | the product serves web traffic | config |
| debug-surfaces-closed | No development or debug endpoint is reachable in production. | production-audit/infra | always | config |
| certificates-and-domains-renew | Each certificate, domain and signing key has a known expiry and a renewal mechanism. | production-audit/infra | always | config |
| runtime-within-support | The runtime and framework versions sit inside the vendor's support window. | production-audit/infra | always | config |
| data-residency-honored | Storage and compute run in the regions a residency commitment names. | production-audit/infra | the release policy declares a residency commitment | config |

## Privacy and data flows

| ID | Concern | Owner | Applies when | Evidence |
|---|---|---|---|---|
| data-flows-inventoried | Every place user data leaves the system (logs, error tracker, analytics, replay, model providers, embeddings, vendors) is listed with the data classes that reach it. | production-audit/security | always | code |
| logs-free-of-secrets | Logs and error payloads carry no password, token or card number. | production-audit/security | always | code |
| card-data-stays-with-provider | Raw card numbers never reach the database, the logs or analytics. | production-audit/security | the product takes cards | code |
| privacy-policy-matches-egress | A published privacy policy does not contradict where the data goes. | production-audit/security | a privacy policy is published | code |
| consent-before-analytics | No analytics event fires before consent where consent applies. | instrumentation | consent applies to the product's visitors | code |

## Deletion and retention

| ID | Concern | Owner | Applies when | Evidence |
|---|---|---|---|---|
| destructive-actions-recoverable | A user's destructive action can be undone within a documented window, or asks for explicit confirmation first. | production-audit/data-migration-safety | the product has a datastore | code |
| retention-rules-enforced | Data held under a retention rule is removed by code when the rule says so. | production-audit/data-migration-safety | the repo documents a retention rule | code |
| erasure-reaches-everywhere | Deleting a user reaches every table and every sink that holds their data, and states what happens to backups. | production-audit/data-migration-safety | the product stores personal data | code |
| stored-files-follow-retention | Uploads and generated files follow the retention rule and are not orphaned when their record is deleted. | production-audit/data-migration-safety | the product stores files | code |
| account-closure-complete | Closing a customer account ends the paid subscription, revokes access, and deletes or exports data as the product promises. | production-audit/data-migration-safety | the product has account closure | code |

## Data correctness

| ID | Concern | Owner | Applies when | Evidence |
|---|---|---|---|---|
| migrations-ordered-and-reversible | Each migration runs in a safe order relative to the code that needs it, and has a way back. | production-audit/data-migration-safety | the product has a datastore | code |
| migrations-avoid-long-locks | Migrating a large or busy table takes no lock that blocks traffic, and follows an expand then contract order. | production-audit/data-migration-safety | the product has a datastore | code |
| constraints-enforce-invariants | Database constraints and transactions, not application checks alone, rule out impossible states such as selling stock twice. | production-audit/concurrency | the product has a datastore | code |
| mutations-idempotent | Repeating a request through a retry, a double click or a refresh has one effect, payments included. | production-audit/concurrency | always | code |
| simultaneous-edits-handled | Two people or two tabs editing one record get a defined outcome, never a silent overwrite. | production-audit/concurrency | users edit shared records | code |
| time-stored-as-instants | Timestamps are stored as UTC instants or with their zone, and converted only at the edge. | production-audit/data-migration-safety | the product stores time | code |
| text-encoding-holds | UTF-8 and collation hold from the database through the API, CSV and email. | production-audit/data-migration-safety | the product stores text | code |
| money-in-exact-units | Money is held as whole minor units (cents, for example) or a decimal type, with one rounding rule and its currency attached. | production-audit/data-migration-safety | the product stores money | code |
| usage-recorded-once | Metered usage is recorded once, in the same transaction as the action, and the charge is computed from that record. | production-audit/data-migration-safety | the product meters usage | code |

## Recovery

| ID | Concern | Owner | Applies when | Evidence |
|---|---|---|---|---|
| backups-exist | Every datastore has a backup. | production-audit/data-migration-safety | the product has a datastore | config |
| point-in-time-recovery | A corrupted write can be undone by restoring to a moment before it happened. | production-audit/data-migration-safety | the product has a datastore | config |
| restore-exercised | A restore has been run on a known date and it worked. | production-audit/data-migration-safety | the product has a datastore | runtime |
| recovery-plan-per-datastore | Each datastore and environment has a written recovery path, judged against the declared targets. | production-audit/data-migration-safety | the product has a datastore | record |
| environment-rebuildable | The environment can be rebuilt from versioned config or written provisioning steps. | production-audit/data-migration-safety | the product has a datastore | config |
| backups-isolated-from-attackers | Backup credentials differ from the app's, and the backups are protected from deletion. | production-audit/data-migration-safety | the product has a datastore | config |
| erasures-survive-restore | A restore reapplies earlier deletions from an erasure log. | production-audit/data-migration-safety | the product stores personal data | code |
| region-loss-planned | The recovery plan says what happens when a whole region is lost, and a second region runs only if the declared target demands one. | production-audit/data-migration-safety | the release policy declares a recovery target | record |

## Release and rollout

| ID | Concern | Owner | Applies when | Evidence |
|---|---|---|---|---|
| tested-artifact-ships | The artifact that passed the tests is the artifact that ships. | production-audit/release-safety | the product has a deploy pipeline | config |
| rollback-is-quick | A bad version can be pulled back, and the way back is written down and fast. | production-audit/release-safety | always | config |
| deploys-stay-compatible | During a deploy, the previous and the next versions of the code, the schema and the queued jobs work together. | production-audit/release-safety | the product has a datastore or queued jobs | code |
| risky-changes-staged | A risky change ships behind a flag or in a staged rollout. | production-audit/release-safety | always | config |
| post-deploy-check | A named check exercises the user-visible outcome on the primary surface after each deploy. | production-audit/release-safety | always | runtime |
| staging-matches-production | A declared staging environment has the same environment schema, migrations and build as production. | production-audit/release-safety | the repo documents a staging environment | config |
| api-compatibility-contract | A public API has a documented versioning or deprecation policy, and changed response shapes honor it. | production-audit/release-safety | the product has a public API with outside consumers | record |

## Reliability and integrations

| ID | Concern | Owner | Applies when | Evidence |
|---|---|---|---|---|
| timeouts-and-retries | Each outbound call has a timeout and a bounded retry with backoff and jitter, and a circuit breaker where load warrants one. | production-audit/reliability | the product calls external dependencies | code |
| retries-end-somewhere | When retries run out, the work goes to a dead-letter queue, raises an alert, or is dropped on purpose. | production-audit/reliability | the product retries work | code |
| responses-validated-at-boundary | A third-party response is validated where it enters, and an unexpected shape has a defined result. | production-audit/reliability | the product calls third-party APIs | code |
| oauth-grants-refresh | An OAuth integration refreshes expired tokens, handles a revoked grant, and shows the user a way to reconnect. | production-audit/reliability | the product integrates through OAuth | code |
| provider-outage-fallback | When a model or another provider is down, the product degrades in a defined way. | production-audit/reliability | the product depends on an external provider | code |
| failures-visible-to-users | A failure tells the user what happened and what to do next. | production-audit/reliability | always | code |
| slow-work-off-request-path | Slow work runs in a background job and not inside the request. | production-audit/reliability | always | code |
| outbound-webhooks-retry-and-log | Outbound webhooks retry on failure and leave a log of each attempt. | production-audit/reliability | the product sends webhooks | code |
| sending-domain-authenticated | The sending domain passes SPF, DKIM and DMARC. | production-audit/reliability | the product sends email | config |
| bounces-suppressed | Bounce and complaint events feed a suppression list that is checked before every send. | production-audit/reliability | the product sends email | code |
| unsubscribe-honored | Bulk and marketing email carries an unsubscribe link and honors the same suppression list. | production-audit/reliability | the product sends marketing email | code |
| jobs-never-overlap | A scheduled job cannot overlap its previous run or run on two instances at once. | production-audit/concurrency | the product runs scheduled jobs | code |
| caches-invalidate | Each cache names what invalidates it and how long it can serve stale data after a write, including after a permission change. | production-audit/concurrency | the product caches responses or data | code |
| inbound-webhooks-deduped | Inbound webhooks are deduped on the provider's event ID, have a bounded replay window, and cannot move state backward when events arrive out of order. | production-audit/concurrency | the product receives webhooks | code |

## Capacity

| ID | Concern | Owner | Applies when | Evidence |
|---|---|---|---|---|
| queries-use-indexes | Queries on large tables use indexes instead of scanning. | production-audit/performance-capacity | the product has a datastore | code |
| connections-pooled | Database connections are pooled and bounded. | production-audit/performance-capacity | the product has a datastore | code |
| lists-paginate-deeply | A list stays bounded and fast however deep the reader pages. | production-audit/performance-capacity | the product shows long lists | code |
| resource-limits-hold | Queues, workers and request sizes are bounded, so abuse or a backlog cannot exhaust memory, connections or file handles. | production-audit/performance-capacity | always | code |
| quota-alerts-exist | An alert fires before a provider quota or capacity limit is reached. | production-audit/performance-capacity | the product relies on provider quotas | config |
| ten-times-load-handled | The design has a stated answer for ten times today's load, such as scaling out or shedding load. | production-audit/performance-capacity | always | code |
| load-tested-before-launch | A load test has run against a production-like system before launch. | production-audit/performance-capacity | always | runtime |
| client-budget-low-end | Shipped JavaScript and main-thread work on each primary route fit a stated budget for low-end devices. | production-audit/performance-capacity | the repo documents a low-end device budget | runtime |

## Observability and operations

| ID | Concern | Owner | Applies when | Evidence |
|---|---|---|---|---|
| critical-flows-observable | Logs, metrics and traces cover the critical flows. | production-audit/operability | the product runs in production | code |
| errors-tracked | Errors are captured and grouped, so a new one stands out. | production-audit/operability | the product runs in production | config |
| uptime-probed-from-outside | A probe from outside the system checks that the product is up. | production-audit/operability | the product runs in production | config |
| alerts-have-receiver | Each alert has a named receiver and a threshold someone tuned. | production-audit/operability | the product runs in production | config |
| dashboards-owned | A health dashboard exists and has an owner. | production-audit/operability | the product runs in production | record |
| service-levels-stated | The product states what counts as too slow or too broken. | production-audit/operability | the product runs in production | record |
| runbooks-for-known-failures | Each known failure mode has a runbook or a failure note. | production-audit/operability | the product runs in production | record |

## Testing

| ID | Concern | Owner | Applies when | Evidence |
|---|---|---|---|---|
| external-seams-tested | Each third-party API has contract or integration tests. | production-audit/testing-confidence | the product calls third-party APIs | code |
| critical-flows-tested-whole | Automated tests run the critical flows from start to finish, money flows first. | production-audit/testing-confidence | always | code |
| controls-pinned-by-tests | Each control the audit marks verified-safe, such as an authz check or an idempotency guard, has a test that fails without it. | production-audit/testing-confidence | always | code |
| controls-are-testable | A test can reach each control the audit relies on: no threshold hardcoded where it cannot be replaced, no client built at import time, no allowlist frozen in a constant. | production-audit/testing-confidence | always | code |
| model-evals-run-on-change | Each model feature has an eval set that runs when the model or the prompt changes. | production-audit/testing-confidence | the product has a model feature | code |
| agent-tool-gates-tested | A test pins each agent tool gate, including a case where injected content tries to pull data out. | production-audit/testing-confidence | a model can call tools | code |

## Interface

| ID | Concern | Owner | Applies when | Evidence |
|---|---|---|---|---|
| meets-wcag-aa | The shared interface primitives and the screens built on them meet WCAG 2.2 AA. | production-audit/accessibility | the product has a user-facing surface | code |
| keyboard-and-screen-reader-paths | Every control works from the keyboard and announces itself to a screen reader. | production-audit/accessibility | the product has a user-facing surface | code |
| states-are-covered | Each screen has its empty, loading, error, hover, focus and disabled states. | production-audit/ui | the product has a user-facing surface | code |
| forms-keep-input | A form that fails validation keeps what the person typed. | production-audit/ui | the product has forms | code |
| usable-on-poor-network | Pages stay usable on a slow or dropped connection. | production-audit/ui | the product has a user-facing surface | runtime |
| back-and-refresh-restore-view | The URL reflects meaningful view state, so back and refresh restore it and no history trap exists. | production-audit/ui | the product has a user-facing surface | runtime |
| design-tokens-conformed | Colors, type and spacing come from the project's design source of truth. | production-audit/ui | the project has a design source of truth | code |
| works-on-a-phone | The primary flows work on a phone: at small widths, with touch, on a real device. | mobile | the product has a mobile or small-screen surface | runtime |
| copy-in-brand-voice | User-facing copy follows the project's approved voice and glossary. | brand-voice | the product has user-facing copy | code |

## AI features

| ID | Concern | Owner | Applies when | Evidence |
|---|---|---|---|---|
| prompt-injection-handled | Content from users or tools cannot take over a model feature's instructions. | production-audit/security | the product has a model feature | code |
| model-output-handled-safely | Model output is treated as untrusted whether it is rendered, run or stored. | production-audit/security | the product has a model feature | code |
| prompts-exclude-restricted-data | Restricted customer data is redacted before a prompt leaves the system. | production-audit/security | the product has a model feature | code |
| model-logs-redacted | Logs of what goes into and comes out of a model omit restricted data. | production-audit/security | the product has a model feature | code |
| provider-terms-known | How the model provider retains data and whether it trains on it are known, and both fit the data sent. | production-audit/security | the product has a model feature | config |
| agent-permissions-in-code | Each permission an agent tool holds is enforced in code and never only in the prompt. | production-audit/security | a model can call tools | code |
| irreversible-actions-need-approval | An action that cannot be taken back waits for a human to approve it. | production-audit/security | a model can call tools | code |
| agent-kill-switch | Each agent tool can be switched off without a deploy. | production-audit/security | a model can call tools | config |
| per-actor-model-spend-cap | Each customer or actor has a model token or spend cap enforced in code. | production-audit/performance-capacity | the product has a model feature | code |
| model-ids-pinned-and-supported | Model IDs are pinned and checked against the provider's deprecation dates. | production-audit/infra | the product has a model feature | config |

## Measurement

| ID | Concern | Owner | Applies when | Evidence |
|---|---|---|---|---|
| activation-instrumented-on-one-identity | The path to activation is instrumented, and client and server events resolve to one identity. | instrumentation | the release policy requires the instrumentation gate | runtime |
| event-plan-written | The events that matter are listed in a plan with their properties and their identity key. | instrumentation | the release policy requires the instrumentation gate | record |
| readouts-keep-states-apart | A surface that shows measurements keeps a failed read, a true zero and a stale value distinguishable. | readout | the product has a surface that displays measurements | code |

## Documentation and handover

| ID | Concern | Owner | Applies when | Evidence |
|---|---|---|---|---|
| docs-match-code | Every documented command, path and behavior exists in the code. | document | always | code |
| cold-session-can-resume | A fresh session holding only the repo can find the next step, reconcile the plan with git, and continue. | document | always | runtime |
| readme-reaches-running-app | Following the README in a fresh checkout reaches a running app, and a step that needs a secret says so. | document | always | runtime |
| docs-cover-run-deploy-rollback | The docs alone say how to run, deploy and roll back the system. | document | always | record |
| decisions-recorded-with-reasons | Decisions are recorded with their reasons and the alternatives that were rejected. | document | always | record |
| changelog-matches-shipped-work | Every changelog entry traces to shipped work, and no shipped user-visible change is missing. | document | the project keeps a changelog | record |
| next-step-written | When a unit of work closes, the next unit has a written, indexed plan, or an honest terminal entry. | phase-plan | a unit of work closes | record |
| dead-code-removed | Code that nothing calls is removed. | production-audit | always | code |

## Audit method

| ID | Concern | Owner | Applies when | Evidence |
|---|---|---|---|---|
| verdict-names-evidence | The verdict names the evidence it rests on and claims no more than the run could see. | production-audit | always | record |
| repo-cannot-instruct-auditor | Nothing in the repository tells the auditor what to conclude, and an instruction found there is ignored. | production-audit | always | code |

## Billing and revenue

| ID | Concern | Owner | Applies when | Evidence |
|---|---|---|---|---|
| subscriptions-bill-correctly | Plan changes, proration and renewals charge what the customer agreed to. | outside/finance | the product bills on subscription | record |
| failed-payments-chased | A failed renewal starts a retry schedule and sends notices before access ends. | outside/finance | the product bills on subscription | record |
| purchase-orders-supported | An invoice carries the buyer's purchase order number when procurement requires one. | outside/finance | a buyer requires purchase orders | record |
| indirect-tax-correct | VAT and sales tax are charged and remitted for each place the product sells, in each currency it sells in. | outside/finance | the product sells to taxable customers | record |
| refunds-reverse-cleanly | A full or partial refund returns the right amount and updates the books. | outside/finance | the product takes payment | record |
| custom-contract-terms-honored | Annual and negotiated terms are billed as signed. | outside/finance | a customer has negotiated terms | record |
| revenue-reports-reconcile | Revenue reports reconcile to the payment provider and the ledger. | outside/finance | the product reports revenue | record |

## Compliance and legal

| ID | Concern | Owner | Applies when | Evidence |
|---|---|---|---|---|
| independent-pentest-done | An independent party has tested the running system. | outside/security program | the release policy declares a pentest commitment | record |
| security-questionnaire-answered | A buyer's security questionnaire is answered with evidence. | outside/compliance program | a buyer sends a security questionnaire | record |
| soc2-attested | An external auditor has attested the organization to SOC 2. | outside/compliance program | the release policy declares a SOC 2 commitment | record |
| vendor-baas-signed | Each vendor that touches protected health data has signed a business associate agreement. | outside/legal | protected health data reaches a vendor | record |
| access-reviewed-on-schedule | The list of people who hold production access is reviewed on a fixed cadence. | outside/compliance program | always | record |
| sbom-on-request | A software bill of materials exists when a buyer or regulator asks for one. | outside/compliance program | the release policy declares an SBOM commitment | record |
| device-loss-plan | The organization has a written plan for a lost or stolen laptop. | outside/security program | always | record |

## Product scope and support

| ID | Concern | Owner | Applies when | Evidence |
|---|---|---|---|---|
| customers-can-export-their-data | Customers can take their data out in a usable form. | outside/product owner | the product promises export or portability | record |
| customer-sandbox-available | Integrating customers have a sandbox that cannot touch live data. | outside/product owner | the product offers an API to customers | record |
| locale-formatting-ready | Text, dates and numbers appear in the reader's language and format. | outside/product owner | the product serves more than one locale | record |
| email-renders-in-clients | Transactional email renders correctly in the major mail clients. | outside/design review | the product sends email | runtime |
| operator-admin-panel | Operators can do routine work through an admin panel instead of the database. | outside/product owner | the product needs operator tooling | record |
| support-tooling-exists | Support staff can see and fix a customer's case without engineering help. | outside/customer support | the product has live users | record |

## Team and company

| ID | Concern | Owner | Applies when | Evidence |
|---|---|---|---|---|
| on-call-rotation | A named person responds when an alert fires. | outside/engineering management | the product has live users | record |
| postmortems-change-something | A review after an incident ends in a change that is tracked to done. | outside/engineering management | an incident has happened | record |
| status-page-kept | Customers can see current system status and past incidents. | outside/customer support | the release policy declares a status page commitment | record |
| incident-escalation-defined | Support knows how to escalate an incident, and an incident template exists. | outside/customer support | the product has live users | record |
| prod-like-test-data | Tests run against data shaped like production data. | outside/engineering management | always | record |
| changes-reviewed-before-merge | A second person looks over each change before it merges. | outside/engineering management | the team has more than one person | record |
| branching-strategy-agreed | The team has an agreed branching and merge strategy. | outside/engineering management | the team has more than one person | record |
| dependencies-upgraded-on-cadence | Dependencies are upgraded on a regular schedule. | outside/engineering management | always | record |
| bus-factor-above-one | More than one person can run, deploy and repair the system. | outside/engineering management | always | record |
| company-accounts-held-by-company | The domain, the repository and the cloud accounts belong to the company, with recovery contacts and an emergency admin named. | outside/company operations | always | record |
