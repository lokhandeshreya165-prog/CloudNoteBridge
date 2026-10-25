#!/bin/bash
# ==============================================================================
# CloudNoteBridge — Dockerized EC2 Deployment Script (Ubuntu 22.04 / 24.04 LTS)
# ==============================================================================
set -euo pipefail

echo "=========================================================="
echo " Deploying CloudNoteBridge via Docker Compose on AWS EC2   "
echo "=========================================================="

APP_DIR="/var/www/cloudnotebridge"

# 1. Install Docker & Docker Compose Plugin
echo "[1/4] Installing Docker and Docker Compose..."
sudo apt-get update -y
sudo apt-get install -y ca-certificates curl gnupg git

sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

sudo usermod -aG docker ubuntu || true

# 2. Clone / Copy Repository
echo "[2/4] Setting up application repository..."
sudo mkdir -p "${APP_DIR}"
sudo chown -R ubuntu:ubuntu "${APP_DIR}"

if [ ! -d "${APP_DIR}/.git" ]; then
    git clone https://github.com/lokhandeshreya165-prog/CloudNoteBridge.git "${APP_DIR}"
else
    cd "${APP_DIR}"
    git pull origin main
fi

cd "${APP_DIR}"

# 3. Create .env file if missing
echo "[3/4] Generating production environment configuration..."
if [ ! -f .env ]; then
    SECRET_KEY="$(openssl rand -hex 32)"
    DB_PASS="$(openssl rand -hex 16)"
    ROOT_PASS="$(openssl rand -hex 16)"
    cat <<EOF > .env
SECRET_KEY=${SECRET_KEY}
PORT=80
DB_USER=clouduser
DB_PASSWORD=${DB_PASS}
DB_ROOT_PASSWORD=${ROOT_PASS}
STORAGE_PROVIDER=auto
AWS_REGION=us-east-1
AWS_S3_BUCKET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_PRESIGNED_URL_EXPIRATION=3600
SESSION_COOKIE_SECURE=False
CORS_ORIGINS=*
EOF
fi

# 4. Start Docker Containers
echo "[4/4] Building and launching containers..."
sudo docker compose up -d --build

# Wait for database & backend initialization
echo "Waiting for backend service to become ready..."
sleep 15

# Initialize database schema inside the backend container
sudo docker compose exec -T backend python -m flask --app app:create_app init-db || true
sudo docker compose exec -T backend python -m flask --app app:create_app seed-data || true

PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 || curl -s ifconfig.me || echo "your-server-ip")
echo "=========================================================="
echo " Docker Deployment Complete! "
echo " Application URL: http://${PUBLIC_IP}"
echo " View logs with: sudo docker compose logs -f"
echo "=========================================================="
