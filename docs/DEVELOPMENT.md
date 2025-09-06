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

Developers should use the provided [CloudFormation template](../apps/server/aws/cft_dev_rsvp.yml) to create the necessary AWS resources. This template simplifies the setup process by provisioning and configuring the required infrastructure automatically. You will get the following environment from the setup:

- `AWS_ACCESS_KEY`
- `AWS_SECRET_KEY`
- `AWS_BUCKET_NAME`
- `AWS_REGION`

> [!CAUTION]
> Do not share these env with anyone.
