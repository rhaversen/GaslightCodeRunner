# This dockerfile specifies the environment the production
# code will be run in, along with what files are needed
# for production

# Use 22 LTS version of Node.js and Debian as the base image and slim for ARM64 compatibility
FROM node:lts-bookworm-slim

# Use a non-interactive frontend for debconf
ENV DEBIAN_FRONTEND=noninteractive

# Install build dependencies required for isolated-vm
# python3 and g++ are already installed in the base image, but included here for explicitness
RUN apt-get update && \
    apt-get install -y python3 g++ build-essential && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Create a user within the container
RUN useradd -m gaslight_code_runner_user

# Copy the app directory, package.json, package-lock.json and Config directory
COPY dist/app/ ./
COPY package*.json ./
COPY config/ ./config/
COPY sourceFiles/ ./sourceFiles/

# Change the ownership of the copied files to gaslight_code_runner_user
RUN chown -R gaslight_code_runner_user:gaslight_code_runner_user /app

# Switch to user for subsequent commands
USER gaslight_code_runner_user

# Install production dependencies
RUN npm ci --omit=dev

# Expose the port Express.js runs on
EXPOSE 5000

# Command to run the application
CMD ["npm", "start"]
