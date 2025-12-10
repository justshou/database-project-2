import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminProspective = () => {
  const [clients, setClients] = useState([]);
  const [error] = useState("");

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:5000/admin/prospective-clients",
          {
            headers: token ? { Authorization: token } : {},
          }
        );
        setClients(res.data.clients || []);
      } catch (err) {
        return err;
      }
    };
    fetchClients();
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <h2 style={{ color: "#007bff" }}>Prospective Clients</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "8px" }}>#</th>
            <th style={{ textAlign: "left", padding: "8px" }}>Username</th>
            <th style={{ textAlign: "left", padding: "8px" }}>Name</th>
            <th style={{ textAlign: "left", padding: "8px" }}>Email</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((c, idx) => (
            <tr key={c.client_id} style={{ borderTop: "1px solid #eee" }}>
              <td style={{ padding: "8px" }}>{idx + 1}</td>
              <td style={{ padding: "8px" }}>{c.username}</td>
              <td style={{ padding: "8px" }}>
                {`${c.first_name || ""} ${c.last_name || ""}`.trim() || "-"}
              </td>
              <td style={{ padding: "8px" }}>{c.email || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminProspective;
