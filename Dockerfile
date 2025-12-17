# Use the official Node image
FROM node:22-bookworm

# Set working directory
WORKDIR /app

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

# Add api key
ENV TMDB_API_KEY=fad0add69fc5edb25943409f9e059ce6

# Start the app
CMD ["npm", "deploy"]