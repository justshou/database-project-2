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
      (username.toLowerCase() !== "anna" && username.toLowerCase() !== "admin")
    ) {
      return res.status(403).json({ message: "admin only" });
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

// Admin: top frequent clients by number of service orders (only gonna show 5 tho)
app.get("/admin/users", authenticateToken, (req, res) => {
  const userId = req.user.userId;
  db.query("SELECT username FROM users WHERE id = ?", [userId], (err, rows) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    const username = rows && rows[0] && rows[0].username;
    if (
      !username ||
      (username.toLowerCase() !== "anna" && username.toLowerCase() !== "admin")
    ) {
      return res
        .status(403)
        .json({ message: "Only admin can access this resource" });
    }

    const q = `
      SELECT u.id AS client_id, u.username, COUNT(so.id) AS orders_count
      FROM service_orders so
      JOIN users u ON so.client_id = u.id
      GROUP BY u.id, u.username
      ORDER BY orders_count DESC
      LIMIT 5
    `;

    db.query(q, [], (err2, results) => {
      if (err2)
        return res.status(500).json({ message: "DB error", error: err2 });
      return res.json({ clients: results });
    });
  });
});

// users without any requests
app.get("/admin/prospective-clients", authenticateToken, (req, res) => {
  const userId = req.user.userId;
  db.query("SELECT username FROM users WHERE id = ?", [userId], (err, rows) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    const username = rows && rows[0] && rows[0].username;
    if (
      !username ||
      (username.toLowerCase() !== "anna" && username.toLowerCase() !== "admin")
    ) {
      return res
        .status(403)
        .json({ message: "Only admin can access this resource" });
    }

    const q = `
        SELECT u.id AS client_id, u.username, u.email, u.first_name, u.last_name, COUNT(sr.id) AS requests_count
        FROM users u
        LEFT JOIN service_requests sr ON sr.user_id = u.id
        GROUP BY u.id, u.username, u.email, u.first_name, u.last_name
        HAVING requests_count = 0
        ORDER BY u.username ASC
      `;

    db.query(q, [], (err2, results) => {
      if (err2)
        return res.status(500).json({ message: "DB error", error: err2 });
      return res.json({ clients: results });
    });
  });
});

// largest jobs by rooms serviced (top 5 again)
app.get("/admin/largest-jobs", authenticateToken, (req, res) => {
  const userId = req.user.userId;
  db.query("SELECT username FROM users WHERE id = ?", [userId], (err, rows) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    const username = rows && rows[0] && rows[0].username;
    if (
      !username ||
      (username.toLowerCase() !== "anna" && username.toLowerCase() !== "admin")
    ) {
      return res
        .status(403)
        .json({ message: "Only admin can access this resource" });
    }

    const q = `
        SELECT so.id AS order_id, so.price, so.scheduled_start, so.scheduled_end, so.status AS order_status,
               sr.number_of_rooms, sr.service_address, cu.username AS client_username, pu.username AS provider_username
        FROM service_orders so
        LEFT JOIN service_requests sr ON so.service_request_id = sr.id
        LEFT JOIN users cu ON so.client_id = cu.id
        LEFT JOIN users pu ON so.provider_id = pu.id
        ORDER BY COALESCE(sr.number_of_rooms, 0) DESC
        LIMIT 5
      `;

    db.query(q, [], (err2, results) => {
      if (err2)
        return res.status(500).json({ message: "DB error", error: err2 });
      return res.json({ jobs: results });
    });
  });
});

// Admin: uncommitted clients - submitted >=3 requests but have no orders
app.get("/admin/uncommitted-clients", authenticateToken, (req, res) => {
  const userId = req.user.userId;
  db.query("SELECT username FROM users WHERE id = ?", [userId], (err, rows) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    const username = rows && rows[0] && rows[0].username;
    if (
      !username ||
      (username.toLowerCase() !== "anna" && username.toLowerCase() !== "admin")
    ) {
      return res
        .status(403)
        .json({ message: "Only admin can access this resource" });
    }

    const q = `
      SELECT u.id AS client_id, u.username, COUNT(sr.id) AS requests_count
      FROM users u
      JOIN service_requests sr ON sr.user_id = u.id
      LEFT JOIN service_orders so ON so.client_id = u.id
      WHERE so.id IS NULL
      GROUP BY u.id, u.username
      HAVING requests_count >= 3
      ORDER BY requests_count DESC
      LIMIT 50
    `;

    db.query(q, [], (err2, results) => {
      if (err2)
        return res.status(500).json({ message: "DB error", error: err2 });
      return res.json({ clients: results });
    });
  });
});

// Admin: accepted quotes (orders) for a given month/year
app.get("/admin/accepted-quotes", authenticateToken, (req, res) => {
  const userId = req.user.userId;
  db.query("SELECT username FROM users WHERE id = ?", [userId], (err, rows) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    const username = rows && rows[0] && rows[0].username;
    if (
      !username ||
      (username.toLowerCase() !== "anna" && username.toLowerCase() !== "admin")
    ) {
      return res
        .status(403)
        .json({ message: "Only admin can access this resource" });
    }

    // get this month/ year so I can actually search it
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();
    const month = parseInt(req.query.month, 10) || new Date().getMonth() + 1;
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month - 1 + 1, 1));

    // figure this out later
    const q = `
      SELECT * FROM service_orders
    `;

    db.query(q, [start, end], (err2, results) => {
      if (err2)
        return res.status(500).json({ message: "DB error", error: err2 });
      return res.json({ quotes: results, year, month });
    });
  });
});

// Admin: all accepted quotes (no date filter)
app.get("/admin/all-accepted-quotes", authenticateToken, (req, res) => {
  const userId = req.user.userId;
  db.query("SELECT username FROM users WHERE id = ?", [userId], (err, rows) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    const username = rows && rows[0] && rows[0].username;
    if (!username || (username.toLowerCase() !== "anna" && username.toLowerCase() !== "admin")) {
      return res.status(403).json({ message: "Only admin can access this resource" });
    }

    const q = `
      SELECT so.id AS order_id, so.service_request_id, so.price, so.scheduled_start, so.scheduled_end, so.status AS order_status, so.created_at AS order_created_at,
             cu.username AS client_username, pu.username AS provider_username, sr.service_address
      FROM service_orders so
      LEFT JOIN users cu ON so.client_id = cu.id
      LEFT JOIN users pu ON so.provider_id = pu.id
      LEFT JOIN service_requests sr ON so.service_request_id = sr.id
      ORDER BY so.created_at DESC
    `;

    db.query(q, [], (err2, results) => {
      if (err2) return res.status(500).json({ message: "DB error", error: err2 });
      return res.json({ quotes: results });
    });
  });
});

// Admin respond to a service request (quote or reject) - plural route used by frontend
app.post("/service-requests/:id/respond", authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const reqId = req.params.id;
  const { action, proposed_price, proposed_start, proposed_end, note } =
    req.body; // action: 'quote' or 'reject'

  // Verify admin by username
  db.query("SELECT username FROM users WHERE id = ?", [userId], (err, rows) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    const username = rows && rows[0] && rows[0].username;
    if (
      !username ||
      (username.toLowerCase() !== "anna" && username.toLowerCase() !== "admin")
    ) {
      return res.status(403).json({ message: "Only admin can respond" });
    }

    const q =
      "INSERT INTO negotiations (service_request_id, proposer_id, role, action, proposed_price, proposed_start, proposed_end, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    db.query(
      q,
      [
        reqId,
        userId,
        "admin",
        action,
        proposed_price || null,
        proposed_start || null, // if they dont put anything for these it'll just be null in my db :)
        proposed_end || null,
        note || null,
      ],
      (err2, result) => {
        if (err2) {
          console.error("respond insert error:", err2);
          return res.status(500).json({ message: "DB error", error: err2 });
        }
        if (action === "reject") {
          db.query(
            "UPDATE service_requests SET status = ? WHERE id = ?",
            ["rejected", reqId],
            () => {}
          );
        }
        return res
          .status(201)
          .json({ message: "Response recorded", id: result.insertId });
      }
    );
  });
});

// Client counter (plural path) - add negotiation entry
app.post("/service-requests/:id/counter", authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const reqId = req.params.id;
  const { note, proposed_price, proposed_start, proposed_end } = req.body;

  const q =
    "INSERT INTO negotiations (service_request_id, proposer_id, role, action, proposed_price, proposed_start, proposed_end, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
  db.query(
    q,
    [
      reqId,
      userId,
      "client",
      "counter",
      proposed_price || null,
      proposed_start || null,
      proposed_end || null,
      note || null,
    ],
    (err, result) => {
      if (err) {
        console.error("counter insert error:", err);
        return res.status(500).json({ message: "DB error", error: err });
      }
      db.query(
        "UPDATE service_requests SET status = ? WHERE id = ?",
        ["negotiating", reqId],
        () => {}
      );
      return res
        .status(201)
        .json({ message: "Counter recorded", id: result.insertId });
    }
  );
});

// accept negotation and create the order (remember to add a page for admin to see all the orders later maybe? idk)
app.post("/service-requests/:id/accept", authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const reqId = req.params.id;
  const { negotiation_id } = req.body; // save this so we have history of negotiations

  db.query(
    "SELECT * FROM negotiations WHERE id = ? AND service_request_id = ?",
    [negotiation_id, reqId],
    (err, rows) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      if (!rows || rows.length === 0)
        return res.status(404).json({ message: "Negotiation not found" });
      const n = rows[0];

      db.query(
        "INSERT INTO service_orders (service_request_id, provider_id, client_id, price, scheduled_start, scheduled_end, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          reqId,
          n.proposer_id,
          userId,
          n.proposed_price || null,
          n.proposed_start || null,
          n.proposed_end || null,
          "scheduled",
        ],
        (err2, result) => {
          if (err2) {
            console.error("order insert error:", err2);
            return res.status(500).json({ message: "DB error", error: err2 });
          }
          db.query(
            "UPDATE service_requests SET status = ? WHERE id = ?",
            ["accepted", reqId],
            () => {}
          );
          const orderId = result.insertId;
          // create a bill for the client for this order
          const billAmount = n.proposed_price || null;
          const billClientId = userId;
          db.query(
            "INSERT INTO bills (order_id, client_id, amount, status) VALUES (?, ?, ?, ?)",
            [orderId, billClientId, billAmount, "unpaid"],
            (err3, billRes) => {
              if (err3) console.error("bill insert error:", err3);
              return res.status(201).json({
                message: "Service order created",
                orderId: orderId,
                billId: billRes && billRes.insertId ? billRes.insertId : null,
              });
            }
          );

          // Client: list their bills
          app.get("/bills", authenticateToken, (req, res) => {
            const userId = req.user.userId;
            const q = `
              SELECT b.id AS bill_id, b.order_id, b.amount, b.created_at, b.paid_at, b.status,
                     so.service_request_id, sr.service_address
              FROM bills b
              LEFT JOIN service_orders so ON b.order_id = so.id
              LEFT JOIN service_requests sr ON so.service_request_id = sr.id
              WHERE b.client_id = ?
              ORDER BY b.created_at DESC
            `;
            db.query(q, [userId], (err, results) => {
              if (err)
                return res
                  .status(500)
                  .json({ message: "DB error", error: err });
              return res.json({ bills: results });
            });
          });

          // Client: pay a bill (mark paid)
          app.post("/bills/:id/pay", authenticateToken, (req, res) => {
            const userId = req.user.userId;
            const billId = req.params.id;

            // ensure bill belongs to the user
            db.query(
              "SELECT * FROM bills WHERE id = ? AND client_id = ?",
              [billId, userId],
              (err, rows) => {
                if (err)
                  return res
                    .status(500)
                    .json({ message: "DB error", error: err });
                if (!rows || rows.length === 0)
                  return res.status(404).json({ message: "Bill not found" });

                db.query(
                  "UPDATE bills SET paid_at = NOW(), status = ? WHERE id = ?",
                  ["paid", billId],
                  (err2) => {
                    if (err2)
                      return res
                        .status(500)
                        .json({ message: "DB error", error: err2 });
                    return res.json({ message: "Bill paid" });
                  }
                );
              }
            );
          });
        }
      );
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
