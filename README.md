# RSVP

Create, share, and sell tickets effortlessly. Your all-in-one event management solution.

# Made with

![NextJs](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-black?style=for-the-badge&logo=mysql&logoColor=white)
![Code](https://img.shields.io/badge/Visual_Studio_Code-0078D4?style=for-the-badge&logo=visual%20studio%20code&logoColor=white)

## How to Run the Project locally

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/TeamShiksha/rsvp.git
   cd rsvp
   ```

2. **Install Dependencies**:

   From the root of the project, run the following command to install dependencies for both the frontend and backend:

   ```bash
   pnpm install
   ```

3. **Configure Environment Variables**:

   - Use the `.env_example` file as a reference to set up your environment variables.
   - Rename it to `.env` and populate the required values.

4. **Setup Prisma ORM**:
   ```bash
    ppnpm install prisma --save-dev
    npx prisma init --datasource-provider mysql
   ```
5. **Migrate the Database Schema**:

   ```bash
    pnpm run migrate
   ```

6. **Run the Application**:
   ```bash
   pnpm run start
   ```

## AWS CloudFormation setup:

Navigate to [AWS cloudformation setup](./docs/aws_cloudformation_setup.md) for information about environmental variables:

- `AWS_ACCESS_KEY'
- 'AWS_SECRET_KEY'
- 'AWS_BUCKET_NAME'
- 'AWS_REGION`

---
