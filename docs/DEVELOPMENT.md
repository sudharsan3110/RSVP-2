# RSVP API Documentation

## Run the Project locally

```bash
git clone https://github.com/TeamShiksha/rsvp.git
cd rsvp
pnpm install
# Configure Environment Variables
pnpm  -F server migrate
pnpm -r dev
```

## Configure Environment Variables:

- Use the `.env_example` file as a reference to set up your environment variables.
- Rename it to `.env` and populate the required values.
- `apps/web` and `apps/server` both directories have their own `.env` file to be set up.

## AWS setup

Developers should use the provided [CloudFormation template](../apps/server/aws/cft_dev_rsvp.yml) to create the necessary AWS resources. This template simplifies the setup process by provisioning and configuring the required infrastructure automatically. 
Follow the steps below to deploy the environment:

### 1. Login to AWS Console
- Visit the AWS Console and sign in.

### 2. Navigate to CloudFormation
- Open the **CloudFormation Console**.

### 3. Create a New Stack
- Click **Create Stack → With new resources (standard)**.

### 4. Upload Your Template
- Select **Upload a template file**.  
- Click **Choose file**, then select your YAML template file.

### 5. Configure the Stack
- Click **Next**.  
- Enter a Stack Name (e.g., `rsvp-dev-stack`).  
- Leave all other settings as default (unless you need tags or permission changes).

### 6. Proceed to Create
- Click **Next → Next → Submit** to create the stack.

### 7. Wait for Stack Creation
CloudFormation will begin creating the stack, which includes:
- An S3 bucket  
- An IAM user  
- Necessary policies and access keys  

Monitor progress in the **Events** tab.

### 8. Check Completion
- Once creation is complete, open the **Outputs** tab.  
- It will display:
  - AWSAccessKey  
  - AWSSecretKey  
  - AWSBucketName  
  - AWSRegion  

### 9. Verify Your S3 Bucket
- Go to the **S3 Console**.  
- You should see a bucket with a name similar to:  
  `rsvp-dev-123456789012-us-east-1`

### 10. Configure Your Server Environment
- Open the `.env` file in your server folder.  
- Populate it using the values from the Outputs tab.

You will get the following environment variables from the setup:

- `AWS_ACCESS_KEY`  
- `AWS_SECRET_KEY`  
- `AWS_BUCKET_NAME`  
- `AWS_REGION`

### Environment Variable Format
Add the following to your `.env` file:

o	AWS_ACCESS_KEY = [Your AWSAccessKey]  
o	AWS_SECRET_KEY = [Your AWSSecretKey]  
o	AWS_REGION = [Your AWSRegion]  
o	AWS_BUCKET_NAME = [Your AWSBucketName]


## Google OAuth Setup Guide

Follow the steps below to configure Google OAuth for your application:

### 1. Create a New Project in Google Cloud Console
- Visit the **Google Cloud Console**.
- If you don’t have an existing project, create a new one:
  - Project Name: **Team Siksha RSVP**
  - Location: **No Organization**
- Click **Create**.

### 2. Select Your Project
- Click on the bell/notification icon to select your project.
- You should now be in the Google Cloud Console for your selected project.

### 3. Configure OAuth Consent Screen
- Navigate to **API & Services** in the left-hand menu.
- Select **OAuth consent screen**.

### 4. Setup App Information
- Go to the **Overview** tab and click **Get Started**.
- Fill in the required fields:
  - App Name: **[Your app name]**
  - Support Email: **Your email address**
  - Audience: **External**
  - Contact Information: **Your email address**
- Click **Create** to proceed.

### 5. Generate Client ID and Secret
- Go to the **Clients** section to generate the Client ID.
- Select Application Type: **Web Application**.
- Name: **[Your app name]**
- Authorized JavaScript Origin:  
  `http://localhost:3000` (or your local server address)
- Authorized Redirect URIs:  
  `http://localhost:3000/auth/google/callback` (or the callback URL for your app)
- Click **Create** to generate the credentials.

### 6. Save Client ID and Client Secret
- After creating the OAuth credentials, you will receive a **Client ID** and **Client Secret**.
- Save them in a secure place for backend configuration.

### 7. Configure Environment Variables
- Open the `.env` file in your server folder.
- Add the following:

```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```


> [!CAUTION]
> Do not share these env with anyone.
