# Project Migration to Monorepo Structure

This project was originally a **Next.js** application with integrated APIs using **MySQL** as the database, **Drizzle ORM**, and **Express.js** for API creation. The APIs were located inside the `app` folder of the Next.js project.

## New Structure: Monorepo
The project has now been migrated to a **monorepo** structure, separating the frontend and backend codebases. The structure is as follows:
### 1. **Web (Frontend)**
- The frontend uses **Next.js** and is located in the `client` folder.
- The frontend communicates with the backend API for data exchange.

### 2. **app (Backend)**
- The backend is now a separate **Express.js** application written in **TypeScript**.
- The ORM has been migrated from **Drizzle** to **Prisma**, and we continue using **MySQL** as the database.
- APIs are created and managed inside the `server` folder.

## Setup Instructions

### Step 1: Install Dependencies
From the root of the monorepo, run the following command to install dependencies for both the frontend and backend:
```
pnpm install
```

### Step 2: Environment Variables
   Backend (Server):
    - Create a .env file inside the server folder and add the following variables:
  ```
  DATABASE_URL=mysql://<db_user_name>:<password>@localhost:3306/<db_name>
PORT=8080
```

### Step 3: Set Up MySQL Database
- Install MySQL Workbench for database management.
- In Beekeeper, create a new connection:
   - Set the connection type as MySQL.
   - In the Host section, paste the DATABASE_URL from the .env file.
   - Test the connection, and if successful, click Connect to connect your database.

### Step 4: Setup Prisma ORM.
 - install the prisma CLI as a development dependency
  ```pnpm install prisma --save-dev```
- set up Prisma ORM with the init command of the Prisma CLI:
 ```npx prisma init --datasource-provider mysql```
- you will notice, a prisma folder will be created with schema.prisma
- In the schema.prisma file, define the model of the schema.

### Step 5: Migrate the Database Schema
- Run the following command inside the server folder to reset migrations and sync the database schema using Prisma:
```
pnpm run migrate
```
This step creates a new SQL migration file for this migration in the prisma/migrations directory and executes the SQL migration file against the database.This step also runs `prisma generate` under the hood (which installs the @prisma/client package and generated a tailored Prisma Client API based on your models). 

### Step 6: Running the Project - 
  You can run the frontend and backend together. 
  To run both Frontend and Backend:

From the root folder, run:
```pnpm run start```

