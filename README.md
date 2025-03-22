# RSVP

Create, share, and sell tickets effortlessly. Your all-in-one event management solution.

# Made with

![NextJs](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-black?style=for-the-badge&logo=mysql&logoColor=white)
![Code](https://img.shields.io/badge/Visual_Studio_Code-0078D4?style=for-the-badge&logo=visual%20studio%20code&logoColor=white)
![Astro](https://img.shields.io/badge/astro-%232C2052.svg?style=for-the-badge&logo=astro&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Zod](https://img.shields.io/badge/zod-%233068b7.svg?style=for-the-badge&logo=zod&logoColor=white)
![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)
![Vitest](https://img.shields.io/badge/-Vitest-252529?style=for-the-badge&logo=vitest&logoColor=FCC72B)

## How to Run the Project locally

```bash
git clone https://github.com/TeamShiksha/rsvp.git
cd rsvp
pnpm install
pnpm  -F server migrate
pnpm -r dev
```

## Configure Environment Variables:

- Use the `.env_example` file as a reference to set up your environment variables.
- Rename it to `.env` and populate the required values.

## AWS CloudFormation setup:

Navigate to [AWS cloudformation setup](./apps/server/aws/cft_dev_rsvp.yml) for information about environmental variables:

- `AWS_ACCESS_KEY`
- `AWS_SECRET_KEY`
- `AWS_BUCKET_NAME`
- `AWS_REGION`

---

<p align="center" style="text"><strong>If you liked something about this repository, do give it a 🌟.</strong></p>
