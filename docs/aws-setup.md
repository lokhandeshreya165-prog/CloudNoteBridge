# AWS S3 Cloud Storage Setup & Security Guide

CloudNoteBridge integrates with **Amazon Simple Storage Service (AWS S3)** for cloud-backed object storage. This guide explains how to provision a secure, private S3 bucket, configure least-privilege AWS IAM credentials, and configure the application.

---

## 1. Cloud Architecture & Security Principles

```
                  +----------------------------------------------+
                  |               AWS Cloud Perimeter            |
                  |                                              |
                  |   +--------------------------------------+   |
                  |   |        Private S3 Bucket             |   |
                  |   |  - Block Public Access: ENABLED      |   |
                  |   |  - Server-Side Encryption: AES-256   |   |
                  |   |  - Direct Public URLs: BLOCKED       |   |
                  |   +-------------------+------------------+   |
                  +-----------------------|----------------------+
                                          ^
                Presigned URLs (Short-Lived: 1 hour)
                                          |
                                          v
+-----------------------+     +-----------------------+     +-----------------------+
|    Student Browser    | <-> |  Flask Backend API    | <-> |   MySQL Database      |
|  (Never Sees Secrets) |     | (IAM / Boto3 Client)  |     | (Stores Metadata Only)|
+-----------------------+     +-----------------------+     +-----------------------+
```

### Key Security Safeguards
1. **Zero Browser Secrets**: AWS access keys and secret keys are **never** exposed to Vite, React, or browser JavaScript.
2. **Private Bucket by Default**: All 4 S3 Block Public Access settings remain enabled. Files cannot be accessed via static public URLs.
3. **Randomized Storage Keys**: Files are stored with cryptographically random UUID keys (`notes/{uuid4}.{ext}`), preventing path manipulation and overwrite attacks.
4. **Time-Limited Access**: Downloads use presigned URLs generated on demand with configurable expiration (default: 3600 seconds).
5. **Server-Side Encryption**: Objects are encrypted at rest using standard AES-256 server-side encryption (`ServerSideEncryption: "AES256"`).

---

## 2. Step-by-Step AWS Setup Guide

### Step 2.1: Create a Private S3 Bucket
1. Log in to the [AWS Management Console](https://console.aws.amazon.com/s3/).
2. Navigate to **Amazon S3** > **Buckets** > **Create bucket**.
3. Choose a unique bucket name, e.g., `cloudnotebridge-notes-prod`.
4. Select your preferred AWS Region (e.g., `us-east-1` or `ap-south-1`).
5. **Block Public Access settings for this bucket**:
   - Ensure **Block all public access** is **CHECKED**.
6. **Bucket Versioning**: Keep Disabled (or Enable if document version recovery is desired).
7. **Default Encryption**:
   - Encryption type: **Server-side encryption with Amazon S3 managed keys (SSE-S3)**.
   - Bucket Key: **Enable**.
8. Click **Create bucket**.

---

### Step 2.2: Create a Least-Privilege IAM Policy
1. Navigate to **IAM** > **Policies** > **Create policy**.
2. Select the **JSON** editor and paste the following least-privilege policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CloudNoteBridgeBucketAccess",
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket",
        "s3:GetBucketLocation"
      ],
      "Resource": "arn:aws:s3:::your-bucket-name"
    },
    {
      "Sid": "CloudNoteBridgeObjectOperations",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:HeadObject"
      ],
      "Resource": "arn:aws:s3:::your-bucket-name/notes/*"
    }
  ]
}
```
*(Replace `your-bucket-name` with your actual bucket name).*

3. Click **Next**, name the policy `CloudNoteBridgeS3Policy`, and click **Create policy**.

---

### Step 2.3: Create an IAM User for the Application
1. Navigate to **IAM** > **Users** > **Create user**.
2. Name the user `cloudnotebridge-backend-user`.
3. Do **not** grant AWS Management Console access (programmatic access only).
4. Attach the `CloudNoteBridgeS3Policy` created in Step 2.2.
5. Create user and navigate to **Security credentials** > **Create access key** > **Application running outside AWS**.
6. Securely copy the **Access key ID** and **Secret access key**.

---

## 3. Configuring the Application

1. Open `backend/.env` (created from `backend/.env.example`).
2. Configure the cloud variables:
   ```env
   STORAGE_PROVIDER=s3
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=your-bucket-name
   AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
   AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
   S3_PRESIGNED_URL_EXPIRATION=3600
   ```
3. Restart the Flask backend.
4. Verify by checking `/api/health`:
   ```json
   {
     "storage": {
       "provider": "aws_s3",
       "is_aws_s3": true
     }
   }
   ```

---

## 4. Local Development Storage Fallback

If you do not have AWS credentials or wish to test CloudNoteBridge completely offline:
- Leave `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, and `AWS_SECRET_ACCESS_KEY` empty in `backend/.env`.
- Or explicitly set `STORAGE_PROVIDER=local`.
- The application automatically activates `LocalDevelopmentStorageService`, saving files safely to `backend/uploads/` without incurring AWS costs.
- The UI status badge will transparently display **"Local Dev Storage"**, ensuring you never mistake local files for AWS cloud objects.
