#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Define the application directory as the current directory
APP_DIR=$(pwd)

# Move to the application directory (optional since APP_DIR is already current directory)
cd "$APP_DIR"

# Install dependencies and build the project
echo "Installing dependencies..."
npm install

echo "Building the project..."
npm run build

# Create the .env file (use the SCP'd .env.instance file)
echo "Moving the .env.instance to .env.production"
mv /home/ubuntu/.env.instance $APP_DIR/.env

# Create a systemd service file for the application
SERVICE_NAME="histori-rest-api"
SERVICE_FILE="/etc/systemd/system/$SERVICE_NAME.service"

echo "Creating systemd service file..."

cat <<EOL | sudo tee $SERVICE_FILE
[Unit]
Description=Histori REST API Service
After=network.target

[Service]
ExecStart=/usr/bin/node $APP_DIR/dist/main.js
WorkingDirectory=$APP_DIR
EnvironmentFile=$APP_DIR/.env
Restart=always
RestartSec=10
User=nobody
Group=nogroup

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
sudo systemctl status $SERVICE_NAME --no-pager
