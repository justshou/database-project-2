import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminUsers = () => {
  const [clients, setClients] = useState([]);
  const [error] = useState("");

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/admin/users", {
          headers: token ? { Authorization: token } : {},
        });
        setClients(res.data.clients || []);
      } catch (err) {
        return err;
      }
    };
    fetchClients();
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <h2 style={{ color: "#007bff" }}>Top Clients</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "8px" }}>#</th>
            <th style={{ textAlign: "left", padding: "8px" }}>Client</th>
            <th style={{ textAlign: "left", padding: "8px" }}>Orders</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((c, idx) => (
            <tr key={c.client_id} style={{ borderTop: "1px solid #eee" }}>
              <td style={{ padding: "8px" }}>{idx + 1}</td>
              <td style={{ padding: "8px" }}>{c.username}</td>
              <td style={{ padding: "8px" }}>{c.orders_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsers;
