FROM oven/bun:1 AS builder
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

ARG NEXT_PUBLIC_ENABLE_ALT_PAYMENT_METHODS=false
ARG NEXT_PUBLIC_ENABLE_TEST_SCENARIOS=false

ENV NEXT_PUBLIC_QOOMLEE_API_URL=__QOOMLEE_API_PLACEHOLDER__
ENV NEXT_PUBLIC_PAYMENT_API_URL=__PAYMENT_API_PLACEHOLDER__
ENV NEXT_PUBLIC_ENABLE_ALT_PAYMENT_METHODS=$NEXT_PUBLIC_ENABLE_ALT_PAYMENT_METHODS
ENV NEXT_PUBLIC_ENABLE_TEST_SCENARIOS=$NEXT_PUBLIC_ENABLE_TEST_SCENARIOS

RUN bun run build

FROM nginxinc/nginx-unprivileged:1.27-alpine AS runner
COPY --from=builder --chown=101:101 /app/out /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --chown=101:101 --chmod=755 docker-entrypoint.sh /docker-entrypoint.sh
EXPOSE 3000
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
