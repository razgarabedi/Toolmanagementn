# Werkzeugmeister Pro

Werkzeugmeister Pro is a comprehensive tool management solution designed for professionals and teams. It provides a simple and efficient way to track tools, manage availability, and ensure accountability.

## Tech Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS, TanStack Query
- **Backend:** Node.js, Express, TypeScript, PostgreSQL, Sequelize

## Features Implemented

-   **User Authentication:** Secure user registration and login functionality using JWTs and password hashing with bcrypt.
-   **Role-Based Access Control (RBAC):**
    -   Two user roles: 'admin' and 'user'.
    -   Backend routes are protected, restricting access based on user roles.
    -   The frontend UI dynamically adapts to the user's role, hiding or showing certain actions (e.g., only admins can create, update, or delete tools).
-   **Full CRUD for Tools:** Admins have full Create, Read, Update, and Delete capabilities for managing the tool inventory.
-   **Tool Availability Tracking:**
    -   Users can "check out" and "check in" tools.
    -   The status of each tool (`available`, `in_use`) is tracked and displayed in the UI.
-   **User Profile Page:** A dedicated page for users to view their profile information (ID, username, email, and role).
-   **Modern UI/UX:**
    -   A clean and responsive user interface built with Tailwind CSS.
    -   Loading spinners provide visual feedback during data fetching.
    -   Toast notifications offer non-intrusive feedback for user actions (e.g., success or error messages).

## Running in Production

To build and run this application in a production environment, follow these steps:

### 1. Backend

1.  **Environment Variables:** Create a `.env` file in the `backend` directory with your production database credentials and a strong `JWT_SECRET`.
2.  **Install Dependencies:**
    ```bash
    cd backend
    npm install --production
    ```
3.  **Build:** Compile the TypeScript code to JavaScript.
    ```bash
    npm run build
    ```
4.  **Run:** Start the production server.
    ```bash
    npm start
    ```
    It's recommended to use a process manager like [PM2](httpss://pm2.keymetrics.io/) to run the backend in a production environment.

### 2. Frontend

1.  **Environment Variables:** Create a `.env.local` file in the `frontend` directory and set `NEXT_PUBLIC_API_URL` to the URL of your deployed backend.
2.  **Install Dependencies:**
    ```bash
    cd frontend
    npm install
    ```
3.  **Build:** Create a production-optimized build of the Next.js application.
    ```bash
    npm run build
    ```
4.  **Run:** Start the Next.js production server.
    ```bash
    npm start
    ```
    For a production deployment, it is highly recommended to host the frontend on a service like [Vercel](httpss://vercel.com/) and the backend on a service like [Heroku](httpss://www.heroku.com/) or AWS.

## To-Do List

- [ ] **User Profile Management:** Allow users to edit their own profile information.
- [ ] **Tool Search and Filtering:** Implement search and filtering functionality on the tool list page.
- [ ] **Notifications:** Create an in-app notification system for events like tool check-outs.
- [ ] **Tool Reservation:** Allow users to reserve tools in advance.
- [ ] **Audit Log:** Track the history of actions performed on each tool.
- [ ] **Dashboard:** Create a dashboard with statistics and insights about tool usage.
- [ ] **Image Uploads:** Allow users to upload images for each tool.
