#!/bin/bash
# ==============================================================================
# CloudNoteBridge — Automated EC2 Setup Script (Ubuntu 22.04 / 24.04 LTS)
# ==============================================================================
set -euo pipefail

echo "=========================================================="
echo " Starting CloudNoteBridge Production Deployment on AWS EC2 "
echo "=========================================================="

APP_DIR="/var/www/cloudnotebridge"
DB_NAME="cloudnotebridge"
DB_USER="clouduser"
DB_PASS="$(openssl rand -hex 16)"
SECRET_KEY="$(openssl rand -hex 32)"

# 1. Update system packages
echo "[1/8] Updating package index..."
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y git curl wget ufw nginx mysql-server python3 python3-pip python3-venv build-essential

# 2. Install Node.js 20.x (LTS)
echo "[2/8] Installing Node.js LTS..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# 3. Setup MySQL Database & User
echo "[3/8] Configuring MySQL database..."
sudo systemctl enable --now mysql
sudo mysql -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';"
sudo mysql -e "GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

# 4. Clone / Copy Repository
echo "[4/8] Setting up application files at ${APP_DIR}..."
sudo mkdir -p "${APP_DIR}"
sudo chown -R ubuntu:ubuntu "${APP_DIR}"

if [ ! -d "${APP_DIR}/.git" ]; then
    echo "Cloning repository from GitHub..."
    git clone https://github.com/lokhandeshreya165-prog/CloudNoteBridge.git "${APP_DIR}"
else
    echo "Updating existing repository..."
    cd "${APP_DIR}"
    git pull origin main
fi

# 5. Build React Frontend
echo "[5/8] Building Frontend client..."
cd "${APP_DIR}/frontend"
npm ci
npm run build

# 6. Setup Python Backend Environment
echo "[6/8] Configuring Python backend virtual environment..."
cd "${APP_DIR}/backend"
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt gunicorn

# Generate .env file for production
if [ ! -f .env ]; then
    cat <<EOF > .env
SECRET_KEY=${SECRET_KEY}
DATABASE_URL=mysql+pymysql://${DB_USER}:${DB_PASS}@localhost:3306/${DB_NAME}
STORAGE_PROVIDER=auto
AWS_REGION=us-east-1
AWS_S3_BUCKET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_PRESIGNED_URL_EXPIRATION=3600
MAX_UPLOAD_SIZE_MB=25
CORS_ORIGINS=*
SESSION_COOKIE_SECURE=False
SESSION_COOKIE_SAMESITE=Lax
FLASK_RUN_HOST=127.0.0.1
FLASK_RUN_PORT=5000
FLASK_DEBUG=False
EOF
    echo "Created backend .env configuration with generated credentials."
fi

# Initialize database schema and initial seed data
echo "Initializing database tables and seed course notes..."
python3 -m flask --app app:create_app init-db
python3 -m flask --app app:create_app seed-data

# 7. Configure Systemd Service for Gunicorn
echo "[7/8] Configuring systemd service..."
sudo mkdir -p /var/log/cloudnotebridge
sudo chown -R ubuntu:ubuntu /var/log/cloudnotebridge

sudo cp "${APP_DIR}/deploy/systemd/cloudnotebridge.service" /etc/systemd/system/cloudnotebridge.service
sudo systemctl daemon-reload
sudo systemctl enable --now cloudnotebridge

# 8. Configure Nginx Reverse Proxy
echo "[8/8] Configuring Nginx..."
sudo cp "${APP_DIR}/deploy/nginx/cloudnotebridge.conf" /etc/nginx/sites-available/cloudnotebridge
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/cloudnotebridge /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Configure Firewall
sudo ufw allow 22/tcp || true
sudo ufw allow 80/tcp || true
sudo ufw allow 443/tcp || true

echo "=========================================================="
echo " CloudNoteBridge Deployment Complete! "
echo "=========================================================="
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 || curl -s ifconfig.me || echo "your-server-ip")
echo "Access your app at: http://${PUBLIC_IP}"
echo "Database Password: ${DB_PASS}"
echo "Check backend status: sudo systemctl status cloudnotebridge"
echo "Check backend logs:   sudo journalctl -u cloudnotebridge -f"
