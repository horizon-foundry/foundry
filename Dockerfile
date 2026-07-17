# syntax=docker/dockerfile:1

# Next.js standalone on Node 22. Multi-stage: deps -> build -> run. No native
# modules (the site reads JSON/markdown from disk), so no build toolchain needed.

FROM node:22-bookworm-slim AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# The PostHog browser key must exist at BUILD time (Next inlines NEXT_PUBLIC_*
# into the client bundle). Passed via fly.toml [build.args]; a phc key is
# public by design. Empty means analytics no-ops.
ARG NEXT_PUBLIC_POSTHOG_KEY=""
ENV NEXT_PUBLIC_POSTHOG_KEY=$NEXT_PUBLIC_POSTHOG_KEY
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

# Next standalone server + static assets + public/.
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Files read at runtime via fs (not bundled by Next):
#  - the markdown docs        : rendered by the Behind-the-Build tabs
#  - reference/doc-set-spec.md : rendered on the /skills page
#  - skills/*/SKILL.md         : rendered on the /skills pages
#  - reports/*.json            : rendered by the gated /reports pages
COPY --from=builder /app/PRODUCT.md /app/BRAND.md /app/DESIGN.md /app/NOTES.md /app/PROMPTS.md /app/FRICTION.md ./
COPY --from=builder /app/reference ./reference
COPY --from=builder /app/skills ./skills
COPY --from=builder /app/reports ./reports

EXPOSE 8080
CMD ["node", "server.js"]
