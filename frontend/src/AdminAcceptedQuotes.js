import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminAcceptedQuotes = () => {
  const [quotes, setQuotes] = useState([]);
  const [error] = useState("");

  useEffect(() => {
    fetchQuotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchQuotes = async () => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const token = localStorage.getItem("token");
      const url = `http://localhost:5000/admin/accepted-quotes`;
      const res = await axios.get(url, {
        headers: token ? { Authorization: token } : {},
      });
      setQuotes(res.data.quotes || []);
    } catch (err) {
      return err;
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
      <h2 style={{ color: "#007bff" }}>Accepted Quotes (This Month)</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "8px" }}>#</th>
            <th style={{ textAlign: "left", padding: "8px" }}>Date</th>
            <th style={{ textAlign: "left", padding: "8px" }}>Client</th>
            <th style={{ textAlign: "left", padding: "8px" }}>Provider</th>
            <th style={{ textAlign: "left", padding: "8px" }}>Price</th>
            <th style={{ textAlign: "left", padding: "8px" }}>Address</th>
            <th style={{ textAlign: "left", padding: "8px" }}>Scheduled</th>
            <th style={{ textAlign: "left", padding: "8px" }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {quotes.map((q, idx) => (
            <tr key={q.order_id || idx} style={{ borderTop: "1px solid #eee" }}>
              <td style={{ padding: "8px" }}>{idx + 1}</td>
              <td style={{ padding: "8px" }}>
                {q.order_created_at
                  ? new Date(q.order_created_at).toLocaleString()
                  : "-"}
              </td>
              <td style={{ padding: "8px" }}>
                {q.client_username || q.client_name || "-"}
              </td>
              <td style={{ padding: "8px" }}>
                {q.provider_username || q.provider_name || "-"}
              </td>
              <td style={{ padding: "8px" }}>{q.price ?? "-"}</td>
              <td style={{ padding: "8px" }}>{q.service_address || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminAcceptedQuotes;
