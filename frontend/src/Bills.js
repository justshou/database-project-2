import React, { useEffect, useState } from "react";
import axios from "axios";

const Bills = () => {
  const [bills, setBills] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/bills", {
        headers: token ? { Authorization: token } : {},
      });
      setBills(res.data.bills || []);
    } catch (err) {
      setError(
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : "Failed to load bills"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const payBill = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/bills/${id}/pay`,
        {},
        { headers: token ? { Authorization: token } : {} }
      );
      fetchBills();
    } catch (err) {
      setError(
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : "Failed to pay bill"
      );
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
      <h2 style={{ color: "#007bff" }}>My Bills</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading ? (
        <p>Loading…</p>
      ) : bills.length === 0 ? (
        <p>No bills found.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "8px" }}>#</th>
              <th style={{ textAlign: "left", padding: "8px" }}>Order</th>
              <th style={{ textAlign: "left", padding: "8px" }}>Amount</th>
              <th style={{ textAlign: "left", padding: "8px" }}>Created</th>
              <th style={{ textAlign: "left", padding: "8px" }}>Paid</th>
              <th style={{ textAlign: "left", padding: "8px" }}>Status</th>
              <th style={{ textAlign: "left", padding: "8px" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {bills.map((b, idx) => (
              <tr key={b.bill_id} style={{ borderTop: "1px solid #eee" }}>
                <td style={{ padding: "8px" }}>{idx + 1}</td>
                <td style={{ padding: "8px" }}>{b.order_id}</td>
                <td style={{ padding: "8px" }}>{b.amount ?? "-"}</td>
                <td style={{ padding: "8px" }}>{b.created_at || "-"}</td>
                <td style={{ padding: "8px" }}>{b.paid_at || "-"}</td>
                <td style={{ padding: "8px" }}>{b.status}</td>
                <td style={{ padding: "8px" }}>
                  {b.status !== "paid" ? (
                    <button
                      onClick={() => payBill(b.bill_id)}
                      style={{
                        padding: "6px 10px",
                        backgroundColor: "#007bff",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                      }}
                    >
                      Pay
                    </button>
                  ) : (
                    <span>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Bills;
