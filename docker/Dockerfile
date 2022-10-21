FROM louislam/whitekuma:base AS release
USER node
WORKDIR /app

COPY --chown=node:node . .
RUN npm ci --omit=dev

EXPOSE 3011
VOLUME ["/app/data"]
# HEALTHCHECK --interval=60s --timeout=30s --start-period=180s --retries=5 CMD node extra/healthcheck.js

# https://stackoverflow.com/questions/60581617/is-it-a-bad-practise-to-use-ts-node-in-production
CMD ["ts-node --transpile-only", "backend/index.ts"]

FROM release AS nightly





