# Werkzeugmeister Pro - Developer Setup Guide

This document provides detailed instructions for setting up the Werkzeugmeister Pro development environment on your local machine.

## Table of Contents

1.  [Prerequisites](#1-prerequisites)
2.  [Backend Setup](#2-backend-setup)
3.  [Frontend Setup](#3-frontend-setup)
4.  [Running the Application](#4-running-the-application)
5.  [Troubleshooting](#5-troubleshooting)

---

### 1. Prerequisites

Before you begin, ensure you have the following installed on your system:

-   **Node.js:** (v18 or later recommended)
-   **npm:** (Comes with Node.js)
-   **PostgreSQL:** A running PostgreSQL server instance.
-   **Git:** For cloning the repository.
-   **`sequelize-cli`:** Install it globally for database management.
    ```bash
    npm install -g sequelize-cli
    ```

---

### 2. Backend Setup

1.  **Clone the Repository:**
    ```bash
    git clone <your_repository_url>
    cd <repository_name>
    ```

2.  **Install Dependencies:**
    Navigate to the `backend` directory and install the required npm packages.
    ```bash
    cd backend
    npm install
    ```

3.  **Database Configuration:**
    -   **Log in to PostgreSQL:**
        ```bash
        psql -U postgres 
        ```
    -   **Create a user and two databases** (one for development, one for testing). Replace `your_password` with a secure password.
        ```sql
        CREATE USER tool_dev_user WITH PASSWORD 'your_password';
        CREATE DATABASE tool_management_dev;
        CREATE DATABASE tool_management_test;
        GRANT ALL PRIVILEGES ON DATABASE tool_management_dev TO tool_dev_user;
        GRANT ALL PRIVILEGES ON DATABASE tool_management_test TO tool_dev_user;
        \q
        ```
    -   **Configure Sequelize:** Inside the `backend/src/config` directory, copy `config.json.example` to `config.json`.
        ```bash
        cp src/config/config.json.example src/config/config.json
        ```
    -   **Edit `src/config/config.json`:** Update the `development` and `test` sections with the database credentials you just created.

4.  **Environment Variables:**
    Create a `.env` file in the `backend` directory. This file stores sensitive information like your JWT secret.
    ```
    JWT_SECRET=a_secure_and_random_secret_string
    ```

5.  **Run Database Migrations:**
    This command creates the tables in your `tool_management_dev` database based on the migration files.
    ```bash
    npx sequelize-cli db:migrate
    ```

6.  **Seed the Database:**
    This command populates the database with initial data (e.g., user roles).
    ```bash
    npx sequelize-cli db:seed:all
    ```

---

### 3. Frontend Setup

1.  **Install Dependencies:**
    Navigate to the `frontend` directory from the project root and install the required npm packages.
    ```bash
    cd ../frontend
    npm install
    ```

2.  **Environment Variables:**
    Create a file named `.env.local` in the `frontend` directory. This tells the Next.js app where to find the backend API.
    ```
    NEXT_PUBLIC_API_URL=http://localhost:8080/api
    ```
    *Note: The backend runs on port 8080 by default.*

---

### 4. Running the Application

To run the full application, you need to start both the backend and frontend servers. It's best to do this in two separate terminal windows.

-   **Start the Backend Server:**
    ```bash
    # In the /backend directory
    npm run dev
    ```
    The backend server will start on `http://localhost:8080`.

-   **Start the Frontend Server:**
    ```bash
    # In the /frontend directory
    npm run dev
    ```
    The frontend development server will start on `http://localhost:3000`. You can now access the application in your browser at this address.

---

### 5. Troubleshooting

-   **Error: `relation "Users" does not exist` (or similar for other tables) when starting the server or seeding.**
    -   **Cause:** This usually means the migrations have not been run, or they failed.
    -   **Solution:**
        1.  Ensure your `backend/src/config/config.json` is correct.
        2.  Run the migrations: `npx sequelize-cli db:migrate`.
        3.  If migrations are corrupt or you want to start fresh, you can undo all migrations, then re-run them and re-seed.
            ```bash
            # !! This will delete all data in your database !!
            npx sequelize-cli db:migrate:undo:all
            npx sequelize-cli db:migrate
            npx sequelize-cli db:seed:all
            ```

-   **Error: Cannot connect to the database.**
    -   **Cause:** Incorrect credentials in `config.json` or the PostgreSQL server is not running.
    -   **Solution:**
        1.  Double-check the `username`, `password`, `database`, and `host` in `config.json`.
        2.  Verify that your PostgreSQL service is active.

-   **TypeScript Errors on Startup (e.g., `No overload matches this call` in `index.ts`):**
    -   **Cause:** During our development, we saw that sometimes a failing import in a controller (e.g., `../controllers/auth`) would prevent the file from compiling, which then caused a misleading error in the main `index.ts` router file. The root cause was an issue in a model or another dependency that the controller was importing.
    -   **Solution:**
        1.  If you see an error related to the router, check the terminal output carefully for any preceding errors about modules that cannot be found or other compilation failures.
        2.  Fixing the underlying issue (e.g., a problem in a model definition or a database connection) will typically resolve these cascading type errors.
        3.  Ensure all model associations are correctly defined. An error in one model can impact many other parts of the application. 