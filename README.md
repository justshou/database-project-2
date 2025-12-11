# Database Project 2

This project is a web application that implements JWT (JSON Web Token) based authentication. It has a simple frontend built with React and a backend built with Express and MySQL.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- **Node.js** (v14 or later) and npm (Node Package Manager)
- **MySQL** (Ensure that you have MySQL installed and running)

## How to Run the Project

Follow these steps to clone and run this project on your local machine.

### Step 1: Clone the Repository

First, clone this repository to your local machine.

```bash
git clone https://github.com/justshou/database-project-2.git
```

After cloning, navigate into the project directory

### Step 2: Set Up the Backend (Express & MySQL)

1. **Navigate to the `backend` directory**:

   ```bash
   cd backend
   ```

2. **Install the backend dependencies**:

   ```bash
   npm install
   ```

3. **Create the MySQL Database and Table**:

   - Start your MySQL service (using XAMPP, MAMP, or MySQL Workbench).
   - Open a MySQL client (like MySQL Workbench or the command line) and run the following SQL command to create the database and table:

   ```sql
   CREATE DATABASE jwt_auth_db;

   USE jwt_auth_db;

   CREATE TABLE users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      address TEXT,
      phone VARCHAR(50),
      credit_card VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE service_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NULL,
      service_address TEXT,
      type_of_cleaning VARCHAR(255),
      number_of_rooms INT,
      preferred_datetime DATETIME NULL,
      proposed_budget DECIMAL(10,2) NULL,
      notes TEXT,
      status VARCHAR(50) DEFAULT 'open',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE negotiations (
   id INT AUTO_INCREMENT PRIMARY KEY,
   service_request_id INT NOT NULL,
   proposer_id INT NULL,
   role VARCHAR(20), -- 'admin' | 'client' | 'system'
   action VARCHAR(50), -- 'quote' | 'reject' | 'counter' | 'accept' | 'cancel'
   proposed_price DECIMAL(10,2) NULL,
   proposed_start DATETIME NULL,
   proposed_end DATETIME NULL,
   note TEXT,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   FOREIGN KEY (service_request_id) REFERENCES service_requests(id)
   );

   CREATE TABLE service_orders (
   id INT AUTO_INCREMENT PRIMARY KEY,
   service_request_id INT NOT NULL,
   provider_id INT NULL,
   client_id INT NULL,
   price DECIMAL(10,2) NULL,
   scheduled_start DATETIME NULL,
   scheduled_end DATETIME NULL,
   status VARCHAR(50) DEFAULT 'scheduled',
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   FOREIGN KEY (service_request_id) REFERENCES service_requests(id)
   );

   CREATE TABLE bills (
         id INT AUTO_INCREMENT PRIMARY KEY,
         order_id INT,
         client_id INT,
         amount DECIMAL(10,2),
         created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
         paid_at DATETIME DEFAULT NULL,
         status VARCHAR(20) DEFAULT 'unpaid'
   );
   ```

4. **Start the backend server**:

   ```bash
   npm start
   ```

   The backend will run on `http://localhost:5000`.

### Step 3: Set Up the Frontend (React)

1. **Navigate to the `frontend` directory**:

   ```bash
   cd ../frontend
   ```

2. **Install the frontend dependencies**:

   ```bash
   npm install
   ```

3. **Start the frontend server**:

   ```bash
   npm start
   ```

   The frontend will run on `http://localhost:3000`.

### Step 4: Usage

1. **Access the Web Application**:

   Open your browser and go to `http://localhost:3000`. This will load the homepage of the application.

2. **Registration**:

   - To create a new user, go to the **Register** page (`http://localhost:3000/register`) and fill in the registration form.

3. **Login**:

   - After registering, log in using the **Login** page (`http://localhost:3000/login`).
   - On successful login, a JWT (JSON Web Token) will be generated and stored in your browser's **localStorage**.

4. **Dashboard & Profile (Protected Pages)**:

   - After logging in, you will be redirected to the **Dashboard** (`http://localhost:3000/dashboard`), a protected page that requires authentication.
   - You can also navigate to the **Profile** page (`http://localhost:3000/profile`), which is another protected page.

### Step 5: Logging Out

To log out, click the **Logout** button on the dashboard or profile pages. This will remove the JWT token from `localStorage` and log you out.

### Step 6: Troubleshooting

- **MySQL Connection Issues**: Ensure that MySQL is running and your credentials (username, password, database) in `backend/server.js` are correct.
- **Port Conflicts**: If `localhost:5000` (backend) or `localhost:3000` (frontend) is already in use, make sure to close any services occupying those ports or change the port number.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
