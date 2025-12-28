# Use the official Node image
FROM node:22.14.0-bookworm

# Set working directory
WORKDIR /app

# Enable legacy OpenSSL Provider
ENV NODE_OPTIONS=--openssl-legacy-provider

# Copy dependencies files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app source
COPY . .

# Expose port
ARG PORT=3002
ENV PORT=${PORT}
EXPOSE ${PORT}

# Start the app
CMD ["npm", "run", "deploy"]