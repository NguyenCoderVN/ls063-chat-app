# use the official Bun image
FROM oven/bun:latest

WORKDIR /app

# build web frontend
WORKDIR /app/web
COPY web/package.json web/bun.lock* ./
RUN bun install --frozen-lockfile
COPY web/ ./
# Truyền biến từ Kinsta vào quá trình build của Docker
ARG VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY

# Sau đó mới chạy lệnh build
RUN bun run build
RUN bun run build

# install backend dependencies
WORKDIR /app/backend
COPY backend/package.json backend/bun.lock* ./
RUN bun install --frozen-lockfile
COPY backend/ ./

# expose port
EXPOSE 3000

# set non-sensitive defaults
ENV PORT=3000
ENV NODE_ENV=production

# start the application
CMD ["bun", "index.ts"]
