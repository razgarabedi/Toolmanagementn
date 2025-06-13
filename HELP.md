# Werkzeugmeister Pro - Development Setup Guide

This guide will walk you through the necessary steps to set up and run the Werkzeugmeister Pro application in a local development environment.

## Prerequisites

Before you begin, ensure you have the following installed on your system:
- [Node.js](httpss://nodejs.org/en/) (v18 or later recommended)
- [npm](httpss://www.npmjs.com/) (usually comes with Node.js)
- [PostgreSQL](httpss://www.postgresql.org/download/)

## 1. Database Setup

You need to create a PostgreSQL database for the application to use.

1.  **Start PostgreSQL:** Make sure your PostgreSQL server is running.
2.  **Create Database:** Use a tool like `psql` or a GUI like pgAdmin to create a new database. The application's database name is `werkzeugmeister`.

    ```bash
    psql -U postgres
    CREATE DATABASE werkzeugmeister;
    \q
    ```

## 2. Environment Configuration

The application uses environment variables for configuration. You'll need to create `.env` files for both the backend and the frontend.

### Backend (`/backend/.env`)

1.  Create a new file named `.env` in the `backend` directory.
2.  Add the following environment variables to the file.

    ```
    DB_USER=werkzeugmeister_user
    DB_PASSWORD=a3eilm2s2y
    DB_HOST=localhost
    DB_NAME=werkzeugmeister
    DB_PORT=5432
    JWT_SECRET=your-super-secret-key
    ```
    **Note:** The `JWT_SECRET` can be any long, random string. It's used for signing authentication tokens.

### Frontend (`/frontend/.env.local`)

1.  Create a new file named `.env.local` in the `frontend` directory.
2.  Add the following environment variable. This tells the frontend where the backend API is running.

    ```
    NEXT_PUBLIC_API_URL=http://localhost:5000/api
    ```
    **Note:** The backend runs on port 5000 by default. If you change it, update this variable.

## 3. Install Dependencies

Install the necessary npm packages for both the frontend and backend.

1.  **Backend Dependencies:**
    ```bash
    cd backend
    npm install
    ```
2.  **Frontend Dependencies:**
    ```bash
    cd frontend
    npm install
    ```

## 4. Database Migrations and Seeding

Once the database is created and the backend dependencies are installed, you need to run the database migrations and then seed the database with initial data.

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Run the migrations. This will create the `roles`, `users`, and `tools` tables in your database.
    ```bash
    npx sequelize-cli db:migrate
    ```
3.  Run the seeders. This will populate the `roles` table.
    ```bash
    npx sequelize-cli db:seed:all
    ```

## 5. Running the Application

Now you can start the development servers for both the backend and frontend. It's best to run them in two separate terminal windows.

1.  **Start the Backend Server:**
    ```bash
    cd backend
    npm run dev
    ```
    The backend server will start on `http://localhost:5000`.

2.  **Start the Frontend Server:**
    ```bash
    cd frontend
    npm run dev
    ```
    The frontend development server will start on `http://localhost:3000`.

You can now access the application by opening `http://localhost:3000` in your web browser.

## First Steps

1.  Navigate to `http://localhost:3000/register` to create a new user account.
2.  The first registered user will not be an admin. To create an admin user, you will need to manually change the `role_id` in the `users` table in your database from `2` (user) to `1` (admin).
3.  Log in with your user. If you are an admin, you will see options to create, edit, and delete tools. 