import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminAllAcceptedQuotes = () => {
  const [quotes, setQuotes] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:5000/admin/all-accepted-quotes",
          {
            headers: token ? { Authorization: token } : {},
          }
        );
        setQuotes(res.data.quotes || []);
      } catch (err) {
        setError(
          err.response && err.response.data && err.response.data.message
            ? err.response.data.message
            : "Failed to load accepted quotes"
        );
      }
    };
    fetch();
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
      <h2 style={{ color: "#007bff" }}>All Accepted Quotes</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {quotes.length === 0 ? (
        <p>No accepted quotes found.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "8px" }}>#</th>
              <th style={{ textAlign: "left", padding: "8px" }}>Date</th>
              <th style={{ textAlign: "left", padding: "8px" }}>Address</th>
              <th style={{ textAlign: "left", padding: "8px" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((q, idx) => (
              <tr
                key={q.order_id || idx}
                style={{ borderTop: "1px solid #eee" }}
              >
                <td style={{ padding: "8px" }}>{idx + 1}</td>
                <td style={{ padding: "8px" }}>
                  {q.order_created_at
                    ? new Date(q.order_created_at).toLocaleString()
                    : "-"}
                </td>
                <td style={{ padding: "8px" }}>{q.service_address || "-"}</td>
                <td style={{ padding: "8px" }}>{q.order_status || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminAllAcceptedQuotes;
