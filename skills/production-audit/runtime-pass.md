# Runtime pass

Read when the run has `--runtime`, before the browser opens. The pass drives the running product through a fixed set of scenarios, derived from the flow inventory, and records what it saw. It changes data only in a test target, never the code.

## Target and test accounts

Before any scenario, name the target origin and how the run knows it is not production: a staging, preview, or local origin the repo documents, or one the operator names for this run. Production, or a target whose kind the run cannot establish, gets the read-only scenarios only.

A scenario that writes (a submit, a double submit, a refresh or a disconnect during a write, an upload, a payment) runs only on a non-production target, signed in as a test account, with the payment provider in test mode. Without that target or those accounts, each writing scenario goes to `notAssessed` with its exact steps. A scenario that did not run is never reported as passed.

The operator supplies the test accounts. The pass never opens a secret file to find credentials.

## Scenarios

Apply each scenario to every inventory flow it fits. Record a failure as a finding with confidence `runtime-reproduced` and a `reproduction`; record a pass as a verified-safe control in `strengths`, naming the flow and the scenario.

| Scenario | Applies to | Fails when |
|---|---|---|
| Empty submit | Every form, submitted with no input | The server accepts it, writes a record, or answers 500; or no error names the field |
| Double submit | Every mutating flow: the submit control activated twice in quick succession, and the flow in two tabs where it allows that | More than one effect (two records, two charges, two emails) |
| Refresh mid-flow | Each step of a multi-step flow, and the moment after a submit before it completes | The flow dead-ends, loses entered input, or repeats an effect |
| Disconnect mid-action | Each mutating flow: the browser goes offline after the request starts, then reconnects | No visible failure state, a half-written result shown as complete, or a retry that repeats the effect |
| Slow network | Each primary route under a throttled profile (for example 400 kbps and 400 ms latency) | A hang with no loading state, or a control that can fire twice while waiting |
| Back after sign-out | Sign in, open a private page, sign out, press back | Private content renders from the browser cache, or a reload shows it without signing in again |
| Missing and invalid URLs | An unknown route, a malformed ID, and the ID of a deleted record | Anything other than a not-found state: a 500, a blank page, a stack trace, or internal detail |
| Keyboard only | Each primary flow, completed with the keyboard alone | A control that cannot be reached or operated, a focus trap, or focus that is not visible |
| Images off | Each primary route with image requests blocked | Content or a control that cannot be understood without its image |
| Rendered accessibility and visuals | The shared primitives and each primary route | Contrast, focus visibility, or screen-reader output that fails WCAG 2.2 AA |

## Browser engines

The verdict justification names each browser engine the pass exercised (Chromium, WebKit, Firefox). Each engine it did not exercise is one `notAssessed` entry. An engine the pass did not open is never reported as covered.

## What the pass does not prove

Real-device behavior, infrastructure state, capacity, backup and restore, and migration behavior stay `not-assessed` unless separately exercised. A browser on a laptop is not a phone, and the mobile gate's device checks stay with the `mobile` skill's matrix.
