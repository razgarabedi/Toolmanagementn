# Werkzeugmeister Pro

Werkzeugmeister Pro is a comprehensive tool management solution designed for professionals and teams. It provides a simple and efficient way to track tools, manage availability, and ensure accountability.

## Tech Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS, TanStack Query, i18next
- **Backend:** Node.js, Express, TypeScript, PostgreSQL, Sequelize

## Features Implemented

-   **User Authentication:** Secure user registration and login using JWTs. The first registered user is automatically an 'Admin'.
-   **Role-Based Access Control (RBAC):**
    -   Three user roles: 'Admin', 'Manager', and 'User'.
    -   Protected backend routes and adaptive frontend UI based on user roles.
    -   Admins can manage user roles through a dedicated dashboard.
-   **Full CRUD for Tools:** Admins and Managers can create, read, update, and delete tools.
-   **Tool Catalog:**
    -   Tools can be categorized by `type`.
    -   Track tool `condition`, `purchaseDate`, and `usageCount`.
    -   Search for tools by name.
-   **Tool Lifecycle Management:**
    -   Check-out and check-in tools to track `currentOwnerId`.
    -   Tool status tracking: 'available', 'in_use', 'in_maintenance', 'booked'.
-   **Barcode/QR Code Scanning:** Use a device camera to scan codes for quick check-in/checkout operations.
-   **Tool Booking System:**
    -   Users can book tools for future dates.
    -   View personal bookings.
    -   (WIP) Calendar view for all bookings.
-   **Dashboards & Reporting:**
    -   Admin dashboard for user role management.
    -   Manager dashboard for inventory summaries.
    -   Reports page to view tool usage and status summaries.
-   **Internationalization (i18n):** The UI supports English and German.
-   **User Profile Page:** View user information.
-   **Modern UI/UX:**
    -   Clean, responsive interface with Tailwind CSS.
    -   Loading states and non-intrusive toast notifications for user actions.

## Deployment on Ubuntu with Nginx

This guide covers deploying the Werkzeugmeister Pro application on an Ubuntu server using PM2 to manage the Node.js backend process and Nginx as a reverse proxy.

### Prerequisites
- An Ubuntu server.
- A domain name pointed at your server's IP address.
- Node.js and npm installed.
- PostgreSQL installed and configured.
- Nginx installed.
- Certbot for SSL.

### 1. Database Setup
1.  Log in to PostgreSQL and create the database and user for the application.
    ```sql
    CREATE DATABASE tool_management;
    CREATE USER tool_user WITH ENCRYPTED PASSWORD 'your_secure_password';
    GRANT ALL PRIVILEGES ON DATABASE tool_management TO tool_user;
    ```

### 2. Backend Setup
1.  **Clone the repository:**
    ```bash
    git clone <your_repository_url>
    cd <repository_name>/backend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Configure environment:**
    - Navigate to `src/config/` and copy `config.json.example` to `config.json`.
    - Edit `config.json` with your production PostgreSQL details.
    - Create a `.env` file in the `backend` directory and add a strong `JWT_SECRET`:
      ```
      JWT_SECRET=your_super_strong_jwt_secret
      ```
4.  **Build the application:**
    ```bash
    npm run build
    ```
5.  **Run database migrations and seeders:**
    ```bash
    npx sequelize-cli db:migrate
    npx sequelize-cli db:seed:all
    ```
6.  **Start with PM2:**
    - Install PM2 globally: `npm install pm2 -g`
    - Start the server: `pm2 start dist/index.js --name "werkzeugmeister-backend"`
    - Enable PM2 to start on system boot: `pm2 startup` and follow the instructions.
    - Save the process list: `pm2 save`

### 3. Frontend Setup
1.  **Navigate to the frontend directory:**
    ```bash
    cd ../frontend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Configure environment:**
    - Create a `.env.local` file.
    - Add the URL of your backend API. It will be proxied through Nginx, so it should be the public domain.
      ```
      NEXT_PUBLIC_API_URL=https://your-domain.com/api
      ```
4.  **Build the application:**
    ```bash
    npm run build
    ```
5.  **Start with PM2:**
    ```bash
    pm2 start "npm start" --name "werkzeugmeister-frontend"
    pm2 save
    ```
    The frontend will be running on `http://localhost:3000`. Nginx will handle external access.

### 4. Nginx Configuration
1.  Create a new Nginx server block configuration file:
    ```bash
    sudo nano /etc/nginx/sites-available/your-domain.com
    ```
2.  Add the following configuration. This serves the frontend application and forwards any requests starting with `/api/` to the backend server.
    ```nginx
    server {
        listen 80;
        server_name your-domain.com www.your-domain.com;

        location / {
            proxy_pass http://localhost:3000; # Next.js frontend
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        location /api/ {
            proxy_pass http://localhost:8080/; # Node.js backend
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```
3.  **Enable the site:**
    ```bash
    sudo ln -s /etc/nginx/sites-available/your-domain.com /etc/nginx/sites-enabled/
    sudo nginx -t # Test configuration
    sudo systemctl restart nginx
    ```

### 5. Secure with SSL (Let's Encrypt)
1.  **Install Certbot:**
    ```bash
    sudo apt install certbot python3-certbot-nginx
    ```
2.  **Obtain and install the certificate:**
    ```bash
    sudo certbot --nginx -d your-domain.com -d www.your-domain.com
    ```
    Certbot will automatically update your Nginx configuration to handle HTTPS.

Your application is now live and accessible via `https://your-domain.com`.

## To-Do List

- [ ] **Finalize Booking System:** Complete the booking calendar view and add booking management features.
- [ ] **Notifications:** Implement an in-app notification system for bookings, check-ins, and maintenance alerts.
- [ ] **Maintenance & Service:** Add modules for scheduling and tracking tool maintenance.
- [ ] **Audit Log:** Create a detailed history/log for each tool's lifecycle.
- [ ] **User Profile Management:** Allow users to edit their profile information.
- [ ] **Advanced Reporting:** Enhance the reporting module with more filters, data visualizations, and export options.
- [ ] **Image Uploads:** Allow users to upload images for each tool.
- [ ] **Testing:** Increase test coverage for both backend and frontend.
- [ ] **Localization:** Add more languages.
