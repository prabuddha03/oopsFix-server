# Use Node.js LTS (Long Term Support) version
FROM node:18-slim

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app source code
COPY . .

# Expose port
EXPOSE 8080

# Start the application
CMD [ "node", "app.js" ] 