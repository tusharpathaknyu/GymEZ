# Dockerfile for GYMEZ React Native Web
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy app source
COPY . .

# Build for web
RUN npm run web

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]