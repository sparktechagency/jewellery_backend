FROM node:22.14.0
WORKDIR /app

# Copy package.json and package-lock.json first for efficient caching
COPY package*.json /app/

# Install dependencies
RUN npm install

# Copy all files into the container
COPY . .

# Build TypeScript files
RUN npm run build

# Set environment variable for the port
ENV PORT=3000

# Expose the port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]