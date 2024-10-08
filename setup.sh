#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Define the application directory as the current directory
APP_DIR=$(pwd)

# Install dependencies and build the project
echo "Installing dependencies..."
npm install

echo "Building the project..."
npm run build

# Create a systemd service file for the application
SERVICE_NAME="histori-rest-api"
SERVICE_FILE="/etc/systemd/system/$SERVICE_NAME.service"

echo "Creating systemd service file..."

cat <<EOL | sudo tee $SERVICE_FILE
[Unit]
Description=Histori API
After=network.target

[Service]
ExecStart=/usr/bin/node /histori-rest-api/dist/src/main.js
WorkingDirectory=/histori-rest-api
Restart=always
RestartSec=0
User=root
Environment=NODE_ENV=production
Environment=PORT=3000
# You can add any other necessary environment variables here
ExecReload=/bin/kill -s HUP $MAINPID

[Install]
WantedBy=multi-user.target

EOL

# Reload systemd to recognize the new service and enable it to start on boot
echo "Reloading systemd and enabling the $SERVICE_NAME service..."
sudo systemctl daemon-reload
sudo systemctl enable $SERVICE_NAME

# Start the service
echo "Starting the $SERVICE_NAME service..."
sudo systemctl start $SERVICE_NAME

# Verify the service is running
echo "Service status:"
sudo journalctl -u histori-rest-api -f
