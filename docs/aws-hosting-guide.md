# CloudNoteBridge — Production AWS Hosting Guide

This guide walks you through deploying **CloudNoteBridge** on **Amazon Web Services (AWS)** using standard production practices and **AWS Free Tier** eligible services.

---

## 1. Architecture Overview

```
                                      AWS CLOUD
               +-----------------------------------------------------+
               |                                                     |
               |   [Internet Users]                                  |
               |          |                                          |
               |          v HTTP (Port 80) / HTTPS (Port 443)        |
               |   +---------------------------------------------+   |
               |   |                AWS EC2                      |   |
               |   |  Ubuntu 24.04 LTS (t2.micro / t3.micro)     |   |
               |   |                                             |   |
               |   |   +------------------+                      |   |
               |   |   |   Nginx Server   |                      |   |
               |   |   | (Reverse Proxy)  |                      |   |
               |   |   +--------+---------+                      |   |
               |   |            |                                |   |
               |   |      +-----+-----+                          |   |
               |   |      |           |                          |   |
               |   |      v           v                          |   |
               |   |  +-------+   +--------------------+         |   |
               |   |  | React |   | Flask Backend      |         |   |
               |   |  |  SPA  |   | (Gunicorn WSGI)    |         |   |
               |   |  | Dist  |   | (Port 5000)        |         |   |
               |   |  +-------+   +---------+----------+         |   |
               |   |                        |                    |   |
               |   |                        v                    |   |
               |   |              +-------------------+          |   |
               |   |              |  MySQL 8.0 DB     |          |   |
               |   |              +-------------------+          |   |
               |   +------------------------|--------------------+   |
               |                            |                        |
               |             Presigned URLs | Boto3 SDK              |
               |             (IAM Instance Profile)                  |
               |                            v                        |
               |              +---------------------------+          |
               |              |      Amazon S3 Bucket     |          |
               |              |  (Encrypted / Private)    |          |
               |              +---------------------------+          |
               +-----------------------------------------------------+
```

---

## 2. Prerequisites & Free Tier Information

- An active **AWS Account** ([Sign up here](https://aws.amazon.com/free/)).
- **Free Tier Eligibility**:
  - **EC2**: 750 hours/month of `t2.micro` or `t3.micro` instances (1 year free).
  - **S3**: 5 GB of standard object storage and 20,000 GET / 2,000 PUT requests.
  - **Data Transfer**: 100 GB/month out to internet.

---

## 3. Step 1: Create the Private AWS S3 Bucket

1. Sign in to the **AWS Management Console** and navigate to **Amazon S3** > **Create bucket**.
2. **Bucket name**: Choose a globally unique name (e.g. `cloudnotebridge-storage-yourname`).
3. **AWS Region**: Select your nearest region (e.g., `us-east-1` or `ap-south-1`).
4. **Block Public Access settings**: Keep **Block *all* public access** **CHECKED** (private).
5. **Default encryption**: Select **Server-side encryption with Amazon S3 managed keys (SSE-S3)**.
6. Click **Create bucket**.
7. In your newly created bucket:
   - Navigate to the **Permissions** tab.
   - Scroll down to **Cross-origin resource sharing (CORS)** and click **Edit**.
   - Paste the following configuration (to permit browser file downloads via presigned URLs):
     ```json
     [
       {
         "AllowedHeaders": ["*"],
         "AllowedMethods": ["GET", "HEAD"],
         "AllowedOrigins": ["*"],
         "ExposeHeaders": ["ETag"],
         "MaxAgeSeconds": 3600
       }
     ]
     ```
   - Click **Save changes**.

---

## 4. Step 2: Create IAM Role for EC2 (Zero Hardcoded Keys)

Attaching an IAM Role to your EC2 instance allows the backend to communicate with S3 securely without storing permanent `AWS_ACCESS_KEY_ID` or `AWS_SECRET_ACCESS_KEY` in files on the server!

1. In the AWS Console, open **IAM** > **Roles** > **Create role**.
2. Select **AWS service** as the trusted entity type, and choose **EC2** as the use case. Click **Next**.
3. Click **Create policy** (opens in a new tab):
   - Choose **JSON** editor and paste:
     ```json
     {
       "Version": "2012-10-17",
       "Statement": [
         {
           "Sid": "CloudNoteBridgeS3BucketAccess",
           "Effect": "Allow",
           "Action": [
             "s3:ListBucket",
             "s3:GetBucketLocation"
           ],
           "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME"
         },
         {
           "Sid": "CloudNoteBridgeS3ObjectAccess",
           "Effect": "Allow",
           "Action": [
             "s3:PutObject",
             "s3:GetObject",
             "s3:DeleteObject",
             "s3:HeadObject"
           ],
           "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
         }
       ]
     }
     ```
     *(Replace `YOUR_BUCKET_NAME` with your actual bucket name)*.
   - Name the policy `CloudNoteBridgeS3Policy` and click **Create policy**.
4. Return to the Role creation tab, click refresh, select `CloudNoteBridgeS3Policy`, and click **Next**.
5. Role name: `CloudNoteBridgeEC2Role`. Click **Create role**.

---

## 5. Step 3: Launch an EC2 Instance

1. Navigate to **EC2 Console** > **Launch instance**.
2. **Name**: `CloudNoteBridge-Server`.
3. **Application and OS Images (AMI)**: **Ubuntu Server 24.04 LTS** (or 22.04 LTS).
4. **Instance type**: `t3.micro` or `t2.micro` (Free Tier eligible).
5. **Key pair**: Select or create a key pair (e.g. `cloudnote-key.pem`) to enable SSH.
6. **Network settings**:
   - Check **Allow SSH traffic from** (Anywhere `0.0.0.0/0` or My IP).
   - Check **Allow HTTP traffic from the internet** (Port 80).
   - Check **Allow HTTPS traffic from the internet** (Port 443).
7. **Configure storage**: 20 GiB gp3 (Free Tier includes up to 30 GB EBS).
8. **Advanced details**:
   - **IAM instance profile**: Select `CloudNoteBridgeEC2Role` (created in Step 2).
9. Click **Launch instance**.

---

## 6. Step 4: Deploy CloudNoteBridge (Choose Method A or B)

Once the EC2 instance is running, copy its **Public IPv4 address** from the EC2 console.

Connect via SSH:
```bash
ssh -i /path/to/cloudnote-key.pem ubuntu@<YOUR_EC2_PUBLIC_IP>
```

---

### Method A: Automated Single-Script Native Deployment (Recommended)

Run this one command on your EC2 instance:

```bash
curl -fsSL https://raw.githubusercontent.com/lokhandeshreya165-prog/CloudNoteBridge/main/deploy/scripts/setup-ec2.sh | bash
```

*Or manually clone and run:*
```bash
git clone https://github.com/lokhandeshreya165-prog/CloudNoteBridge.git /var/www/cloudnotebridge
cd /var/www/cloudnotebridge
chmod +x deploy/scripts/setup-ec2.sh
./deploy/scripts/setup-ec2.sh
```

**Configure S3 Bucket Name:**
1. Open the backend configuration:
   ```bash
   nano /var/www/cloudnotebridge/backend/.env
   ```
2. Update:
   ```env
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=your-cloudnotebridge-notes-bucket
   ```
   *(Note: Leave `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` blank because your EC2 IAM role handles authentication automatically).*
3. Restart the backend service:
   ```bash
   sudo systemctl restart cloudnotebridge
   ```

4. Open your browser and navigate to:
   ```
   http://<YOUR_EC2_PUBLIC_IP>
   ```

---

### Method B: Docker & Docker Compose Deployment

If you prefer containerized deployment:

1. Clone the repository on your EC2:
   ```bash
   git clone https://github.com/lokhandeshreya165-prog/CloudNoteBridge.git /var/www/cloudnotebridge
   cd /var/www/cloudnotebridge
   ```

2. Run the automated Docker setup script:
   ```bash
   chmod +x deploy/scripts/setup-ec2-docker.sh
   ./deploy/scripts/setup-ec2-docker.sh
   ```

3. Update `.env` with your S3 bucket name:
   ```bash
   nano .env
   ```
   Set `AWS_S3_BUCKET=your-bucket-name` and `AWS_REGION=us-east-1`.

4. Restart containers:
   ```bash
   sudo docker compose up -d
   ```

---

### Method C: AWS CloudFormation 1-Click Launch (Fully Automated)

You can launch the entire stack (EC2 + S3 Bucket + IAM Role + Security Group + Auto-Installation) in a few clicks:

1. Go to the **AWS CloudFormation Console** > **Create stack** > **With new resources (standard)**.
2. Under **Specify template**, select **Upload a template file**.
3. Upload `deploy/aws/cloudformation-template.yaml` from this repository.
4. Click **Next**, enter a Stack name (e.g., `cloudnotebridge-prod`), and select your EC2 KeyPair.
5. Click **Next** > **Next**, check the box **I acknowledge that AWS CloudFormation might create IAM resources**, and click **Submit**.
6. CloudFormation will automatically provision all AWS resources and execute the setup script.
7. Once status reaches `CREATE_COMPLETE` (typically ~5 minutes), check the **Outputs** tab for your live `WebsiteURL`!

---

## 7. Step 5: Configure Custom Domain & Free SSL (HTTPS)

To secure your deployment with free HTTPS certificates via Let's Encrypt:

1. In your domain provider (e.g. Route 53, GoDaddy, Namecheap, Cloudflare), add an **A Record**:
   - **Host / Name**: `@` (or `notes`)
   - **Points to / Value**: `<YOUR_EC2_PUBLIC_IP>`
2. Connect to your EC2 instance and install Certbot:
   ```bash
   sudo apt-get install -y certbot python3-certbot-nginx
   ```
3. Update `server_name` in `/etc/nginx/sites-available/cloudnotebridge`:
   ```nginx
   server_name yourdomain.com www.yourdomain.com;
   ```
4. Obtain and install the SSL certificate:
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```
5. Update `backend/.env` to secure cookies:
   ```env
   SESSION_COOKIE_SECURE=True
   ```
6. Restart the backend:
   ```bash
   sudo systemctl restart cloudnotebridge
   ```

---

## 8. Step 6: Post-Deployment Verification

1. **Check System Health**:
   Visit: `http://<YOUR_EC2_PUBLIC_IP>/api/health`
   You should see:
   ```json
   {
     "database": {
       "connected": true,
       "error": null
     },
     "status": "healthy",
     "storage": {
       "is_aws_s3": true,
       "provider": "aws_s3"
     }
   }
   ```

2. **Test Demo Student Login**:
   - Email: `student@college.edu`
   - Password: `StudentPass123!`
   - (Or use the one-click "Demo Fill" button on the Login page).

3. **Test File Upload**:
   - Go to `/upload`.
   - Select a sample PDF note, choose Department, Semester, Subject, and Unit.
   - Click **Upload Note**.
   - Verify that the note appears in `/explore` and download URL generates a secure presigned S3 link.

---

## 9. Useful Operational Commands

| Operation | Native Systemd Command | Docker Compose Command |
|---|---|---|
| View Backend Logs | `sudo journalctl -u cloudnotebridge -f` | `sudo docker compose logs -f backend` |
| Restart Backend | `sudo systemctl restart cloudnotebridge` | `sudo docker compose restart backend` |
| View Nginx Logs | `sudo tail -f /var/log/nginx/error.log` | `sudo docker compose logs -f frontend` |
| Backup MySQL DB | `mysqldump -u clouduser -p cloudnotebridge > backup.sql` | `sudo docker compose exec db mysqldump -u clouduser -p cloudnotebridge > backup.sql` |
| Restart All Services | `sudo systemctl restart cloudnotebridge nginx mysql` | `sudo docker compose restart` |
