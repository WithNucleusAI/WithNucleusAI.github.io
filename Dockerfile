# Stage 1: Build
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# The blogs are already processed by the GitHub Action before this step
RUN npm run build

# Stage 2: Run
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
# Copy only the essentials for a tiny image size
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 8080
ENV PORT 8080
CMD ["npm", "start"]
