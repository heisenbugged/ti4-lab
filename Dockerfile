# syntax = docker/dockerfile:1
ARG NODE_VERSION=20.11.0
FROM --platform=linux/amd64 node:${NODE_VERSION}-slim as base
LABEL fly_launch_runtime="Remix"

# Install google-chrome-stable
RUN apt-get update && apt-get install gnupg wget -y && \
  wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
  sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
  apt-get update && \
  apt-get install google-chrome-stable -y --no-install-recommends && \
  rm -rf /var/lib/apt/lists/*

# Remix app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"
ARG YARN_VERSION=1.22.19
RUN npm install -g yarn@$YARN_VERSION --force

# Throw-away build stage to reduce size of final image
FROM base as build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install -y build-essential pkg-config python-is-python3

# Install node modules (cached layer if package.json/yarn.lock unchanged)
COPY --link package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=false --network-timeout=120000

# Copy application code
COPY --link . .

# Build application
RUN yarn run build

# Production dependencies stage (cached separately from build)
FROM base as deps

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install -y build-essential pkg-config python-is-python3

# Install only production dependencies (cached layer)
COPY --link package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=true --network-timeout=120000

# Final stage for app image
FROM base

# Copy production dependencies
COPY --from=deps /app/node_modules /app/node_modules

# Copy built application (only build artifacts, not node_modules)
COPY --from=build /app/build /app/build
COPY --from=build /app/public /app/public
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/yarn.lock /app/yarn.lock

# Setup sqlite3 on a separate volume
RUN mkdir -p /data
VOLUME /data

# add shortcut for connecting to database CLI
RUN echo "#!/bin/sh\nset -x\nsqlite3 \$DATABASE_URL" > /usr/local/bin/database-cli && chmod +x /usr/local/bin/database-cli

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
ENV DATABASE_URL="file:///data/sqlite.db"
ENV TI4_LAB_DATABASE_PATH="file:///data/sqlite.db"
CMD [ "yarn", "run", "start" ]