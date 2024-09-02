# Stage 1: Build the Angular application
FROM node:18.20.3 as build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install --force

# Copy the rest of the application code
COPY . .

# Build the Angular application
RUN npm run build --prod

FROM httpd:alpine

# Copy the built application from the build stage
COPY --from=build dist .

# Expose port 80 to the outside world
EXPOSE 4200

