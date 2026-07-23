---
name: instrumentation
description: Use when adding analytics or event tracking, instrumenting a funnel or an activation flow, wiring a product-analytics tool (PostHog, etc.), or when you need to measure whether a feature works. Covers defining events before building, one identity model across client and server (keyed on the right entity per event, not always the user), reliable server-side capture, operational governance (schema versioning, dedup, a named owner), and measuring activation over vanity.
---

# instrumentation

> **Using this skill:** announce "Using instrumentation", make a todo per numbered step in `## Steps`, and do not skip the gates. This skill's worth is its process, not a hand-reproduced outcome. If you were told to "run instrumentation", run it, do not improvise its result. (Suite standard: https://github.com/horizon-foundry/foundry/blob/main/reference/skill-authoring.md)

## Overview

This is a ship gate, and its weight follows the project's declared release policy (the `foundry` skill owns the required/optional/waived semantics). Where the policy requires instrumentation, an uninstrumented activation funnel caps the `production-audit` verdict; where the policy marks it optional or waived, the gap is recorded, not a cap.

You cannot improve what you do not measure. Most instrumentation is added after the fact, as scattered `capture()` calls that never answer a real question. The discipline: decide what you need to learn first, instrument the whole path to it on one identity, make the capture reliable. Analytics that silently drops events or splits a user across two identities is worse than none: it produces confident, wrong funnels.

## Steps

Each topic section below is the reference a step points at; the steps carry the order and the evidence.

1. **Name the funnel and the activation moment**, and the guardrail metric beside the activation target (see "Define the events" and its guardrail rule). Check: activation and guardrail are named before any code is written.
2. **Write the event plan table into the project's working-conventions doc**, columns: stage, event name, where it fires, properties, identity key. Beneath it add one `Guardrail:` line and one `Owner and cadence:` line (see "Operate it like production code"). Check: the table plus both lines exist in the doc.
3. **State the identity model as a short block above the table**: which entities exist, which entity keys each event (see "One identity model, everywhere"). Check: every event row's identity key names one of the declared entities.
4. **Wire capture** per "Capture reliably on the server" and "Env-gate and stay out of the way". Check: the build passes and capture no-ops without a key.
5. **Stitch QA**: fire one client stage and one server stage for the same actor and confirm the analytics tool shows one actor, not two. Check: the run report states the result.
6. **Close with what remains unverified**, each item with the exact check to run. Check: the closing report lists them explicitly.

## Define the events before you build the feature

A funnel is the common shape, not the only one: some activation is a loop (retention, re-engagement) or a multi-path graph, not a straight line. Model whatever actually leads to value. When it is a funnel, name it first, from first touch to value:

- **view -> intent -> signup -> activation -> value -> retention**

For each stage, one event with a small, stable property set. The most important one is **activation**: the moment the product's value first lands (the "aha"), not signup. Activation does not always live on a user. Depending on the product, it lands on an account, a workspace, a project, a transaction, a provider/consumer pair, or a device. Name the entity whose activation you are measuring. Then instrument it so any path that reaches the value fires the same event. That way you measure the outcome, not one route to it.

**The event plan has a fixed home and a fixed shape** (Steps 2 and 3 write it, this suite uses a CLAUDE.md "Instrumentation" section). Capture code conforms to the table, never the other way around. Retrofitting the plan loses the early funnel forever.

**Name a guardrail alongside the activation target.** An activation number optimized in isolation is a trap: you can raise "reached value" by cheapening what counts as value, at the cost of retention, quality, support load, error rate, or unwanted behavior you were not watching. The guardrail is what must not get worse while activation goes up, instrumented in the same pass. A funnel with no guardrail measures motion, not health.

## One identity model, everywhere

The single most common instrumentation bug is a broken identity. It splits one actor across anonymous and authenticated, or across client and server, so every funnel silently under-counts. The fix is not "one distinct id" but **one identity model**. Name the entities that exist (user, account/workspace, project, device), how they relate, and which entity keys which event. Then apply that model everywhere.

- Every event's key is chosen deliberately from the model: funnel events on the actor moving through the funnel; cost and usage events on the account/tenant where the spend lands; fleet or device health on the device.
- Within one funnel, every stage uses the same key, or the stages will not stitch. A funnel whose client stages key on the user and server stages key on the tenant is the classic self-inflicted split.
- On login, stitch the pre-login anonymous events to the authenticated actor (the **identify/alias** calls in PostHog-style SDKs). The exact call and its merge semantics are vendor-specific, and getting them wrong can permanently corrupt identity history: use your tool's documented merge, alias an anonymous id into an identified one rather than the reverse, and never merge two already-identified actors.
- Step 5's stitch QA verifies this end to end; re-run it whenever auth or session code changes.

## Capture reliably on the server

Client events are auto-batched by the SDK; server events are not, and they are where reliability breaks.

- On serverless or auto-stopping hosts, the process may halt right after the response, so **flush server-side events** (or set immediate send) or they are lost.
- Success-path growth events can be fire-and-forget (an occasional drop is fine); **error and billing events must be flushed**.
- For events you genuinely cannot lose (billing, payments, entitlement changes), a flush is still best-effort: the process can die or the network can fail before it completes. Route those through a **durable outbox or queue** (write the event in the same transaction as the state change, deliver it reliably), not a fire-and-forget capture. Analytics accuracy and financial correctness are different bars.
- Never `await` an analytics round-trip in the hot path of a user action. Capture, then flush without blocking the response where you can.

## Env-gate and stay out of the way

- Analytics **no-ops when its key is unset** (local, preview, tests). The product never depends on the analytics backend being up; a failed capture never breaks a user flow.
- Do not send PII you do not need. Error payloads and full URLs can leak; scrub them. Respect Do-Not-Track and consent where it applies.

## Operate it like production code

Instrumentation that nobody owns rots into confident, wrong dashboards. The plan carries its own governance:

- **Schema and versioning.** Property sets are stable contracts. A breaking change to an event's meaning gets a new event name (or an explicit version property), never a silent redefinition; downstream funnels keep working and the history stays interpretable.
- **Dedup and idempotency.** Server retries and at-least-once delivery double-fire events. Where a double-fire would corrupt a metric (billing, activation counts), carry an idempotency key or dedup on a stable event id.
- **Data-quality checks.** After any release touching instrumented flows, confirm the funnel still emits end to end; a silently dead stage is worse than no stage.
- **A named owner and a review cadence.** The dashboard or saved funnel has an owner who looks at it on a stated cadence. An unread funnel is decoration, and the moment to notice a dead stage is the review, not the quarterly retro.

## Product analytics is not observability

Two different questions, two disciplines. Product analytics answers **"did the intended actor reach the intended value"** (this skill). System observability answers **"is the system behaving"**: errors, latency, saturation, dead jobs. Do not fold observability into the event plan, or the reverse. A p95 latency alert does not belong in a funnel. Activation does not belong in a metrics dashboard. Observability has its own bar, assessed by `production-audit`'s operability dimension.

## Measure activation, not vanity

Pageviews and raw signups have their uses (traffic mix, reach, channel comparison), but they do not answer whether the feature works. For that, instrument the drop-offs: where does the funnel leak between intent and activation? What fraction of new actors reach value in the first session? Add a dashboard or a saved funnel for the path you instrumented, so the events are actually read.

## The gate demands a decision, not necessarily telemetry

The gate is "you can answer whether it is working and you decided how", not "every product emits events". Some products must not carry in-product telemetry: a dev tool that runs in the user's environment, a library, a privacy-sensitive surface. Phoning home from those is a trust violation, not instrumentation. For them, instrument up to the boundary you rightfully control (your site, your registry, the distribution funnel) and waive the rest deliberately.

**The waiver has a fixed home**: the release policy block in the project's PRODUCT.md, as the instrumentation gate's entry, `instrumentation: waived (<reason>)`. That is exactly where `foundry check` cites it. A waiver written there is the gate answered; a waiver stated nowhere is not a waiver, it is an undocumented gap, and the gate fails.

## Red flags

- Adding `capture()` calls without having named the funnel and the activation event first -> you will measure noise.
- Mixed keys within one funnel (client stages on the user, server stages on the tenant) -> the funnel will not stitch; every stage of a funnel uses the same key from the identity model.
- Server capture with no flush on a serverless host -> events silently lost.
- The product breaks or blocks when the analytics key is missing -> env-gate it to no-op.
- Tracking pageviews and calling it analytics -> instrument activation and the path to it.
- Redefining an existing event's meaning in place -> history becomes uninterpretable; new name or explicit version.
- A funnel nobody is named as owning -> it will silently die and keep looking authoritative; give it an owner and a cadence.
