# -------- Stage 1: Build --------
FROM node:20-alpine AS build

# Set working directory
WORKDIR /usr/src/app

# Copy package files for caching dependencies
COPY package*.json ./

# Install dependencies
RUN npm ci --production

# Copy application code
COPY . .

# -------- Stage 2: Production --------
FROM node:20-alpine AS prod

WORKDIR /usr/src/app

# Copy only necessary files from build stage
COPY --from=build /usr/src/app ./

# Expose Socket.IO port
EXPOSE 3000

# Start the server
CMD ["node", "index.js"]
