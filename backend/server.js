// Required dependencies
const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

// Middleware to parse JSON data and handle CORS (Cross-Origin Resource Sharing)
app.use(bodyParser.json());
app.use(cors());

// Create a MySQL connection
const db = mysql.createConnection({
  host: "localhost", // Database host, usually 'localhost' in local development
  user: "root", // Default username in XAMPP
  password: "", // Leave blank if no password is set in XAMPP
  database: "jwt_auth_db", // Database name
});

// Connect to the MySQL database
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.stack);
    return;
  }
  console.log("Connected to MySQL database.");
});

// Start the server and listen on port 5000
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});

// User registration route
app.post("/register", async (req, res) => {
  const {
    username,
    email,
    password,
    first_name,
    last_name,
    address,
    phone,
    credit_card,
  } = req.body; // Extract username, email, and password from request body
  const hashedPassword = await bcrypt.hash(password, 10); // Hash the password using bcrypt with 10 salt rounds

  // Insert the new user into the 'users' table
  db.query(
    "INSERT INTO users (username, email, password, first_name, last_name, address, phone, credit_card) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [
      username,
      email,
      hashedPassword,
      first_name || null,
      last_name || null,
      address || null,
      phone || null,
      credit_card || null,
    ],
    (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "User registration failed", error: err }); // Send error response if registration fails
      }
      res.status(201).json({ message: "User registered successfully" }); // Send success response
    }
  );
});

// Service request
app.post("/service-request", authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const {
    service_address,
    type_of_cleaning,
    number_of_rooms,
    preferred_datetime,
    proposed_budget,
    notes,
  } = req.body;

  db.query(
    `INSERT INTO service_requests (user_id, service_address, type_of_cleaning, number_of_rooms, preferred_datetime, proposed_budget, notes) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      userId || null,
      service_address || null,
      type_of_cleaning || null,
      number_of_rooms || null,
      preferred_datetime || null,
      proposed_budget || null,
      notes || null,
    ],
    (err, result) => {
      if (err) {
        console.error("service request insert error:", err);
        return res
          .status(500)
          .json({ message: "Failed to submit service request", error: err });
      }
      return res
        .status(201)
        .json({ message: "Service request submitted", id: result.insertId });
    }
  );
});
// User login route
app.post("/login", (req, res) => {
  const { username, password } = req.body; // Extract username and password from request body

  // Query the database for the user with the provided username
  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, results) => {
      if (err || results.length === 0) {
        return res.status(400).json({ message: "User not found" }); // Send error response if user is not found
      }

      const user = results[0]; // Get the user record from the query result
      const passwordMatch = await bcrypt.compare(password, user.password); // Compare the provided password with the hashed password

      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid credentials" }); // Send error response if the password does not match
      }

      // Generate a JWT token with the user ID and a secret key, valid for 3 hour
      const token = jwt.sign({ userId: user.id }, "your_jwt_secret", {
        expiresIn: "3h",
      });

      // Send the JWT token as the response
      res.json({ token });
    }
  );
});

// Middleware function to authenticate JWT tokens
function authenticateToken(req, res, next) {
  const token = req.headers["authorization"]; // Get the token from the 'Authorization' header

  if (!token) return res.status(401).json({ message: "Access denied" }); // If no token is provided, deny access

  // Verify the JWT token
  jwt.verify(token, "your_jwt_secret", (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" }); // If the token is invalid, send a 403 error
    req.user = user; // Store the decoded user data in the request object
    next(); // Proceed to the next middleware/route handler
  });
}

// Protected route that requires JWT authentication
app.get("/dashboard", authenticateToken, (req, res) => {
  res.json({ message: "Welcome to the dashboard. You are authenticated!" }); // Send a success message if authentication is valid
});

// Admin: list open service requests across all users
app.get("/admin/service-requests", authenticateToken, (req, res) => {
  const userId = req.user.userId;

  // check admin by username (simple role check)
  db.query("SELECT username FROM users WHERE id = ?", [userId], (err, rows) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    const username = rows && rows[0] && rows[0].username;
    if (
      !username ||
      (username.toLowerCase() !== "anna" &&
        username.toLowerCase() !== "admin" &&
        username.toLowerCase() !== "root")
    ) {
      return res
        .status(403)
        .json({ message: "admin only" });
    }

    // Select open requests (treat NULL as open)
    db.query(
      "SELECT sr.*, u.username AS client_username FROM service_requests sr LEFT JOIN users u ON sr.user_id = u.id WHERE COALESCE(sr.status, 'open') = 'open' ORDER BY sr.created_at DESC",
      [],
      (err2, results) => {
        if (err2)
          return res.status(500).json({ message: "DB error", error: err2 });
        return res.json({ requests: results });
      }
    );
  });
});

// Note: negotiation history and negotiation endpoints were removed.
// Provide a simple GET route to return a single service request (no negotiations).
app.get("/service-requests/:id", authenticateToken, (req, res) => {
  const reqId = req.params.id;
  db.query(
    "SELECT sr.*, u.username AS client_username FROM service_requests sr LEFT JOIN users u ON sr.user_id = u.id WHERE sr.id = ?",
    [reqId],
    (err, rows) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      if (!rows || rows.length === 0)
        return res.status(404).json({ message: "Request not found" });
      return res.json({ request: rows[0] });
    }
  );
});

app.get("/profile", authenticateToken, (req, res) => {
  const userId = req.user.userId; // Extract userId from the decoded JWT token

  // Query the database to get the user data based on the userId
  db.query(
    "SELECT username, email, first_name, last_name, address, phone, credit_card FROM users WHERE id = ?",
    [userId],
    (err, result) => {
      if (err || result.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const row = result[0];
      res.json({
        username: row.username,
        email: row.email,
        first_name: row.first_name,
        last_name: row.last_name,
        address: row.address,
        phone: row.phone,
        credit_card: row.credit_card,
      });
    }
  );
});
