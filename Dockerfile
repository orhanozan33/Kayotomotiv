# Multi-stage build for Node.js backend
FROM node:18-alpine AS backend-build

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy backend source
COPY backend/ ./

# Expose port
EXPOSE 3001

# Start backend server
CMD ["node", "src/server.js"]

