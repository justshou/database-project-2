import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const AdminRequestsList = () => {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:5000/admin/service-requests",
        { headers: token ? { Authorization: token } : {} }
      );
      setRequests(res.data.requests || []);
    } catch (err) {
      setError("you are not an admin! or anna!");
    }
  };

  const handleAccept = async (id) => {
    try {
      const token = localStorage.getItem("token");
      // Admin respond with a quote (no price means use client's proposed_budget) and then accept it to create order
      const resp = await axios.post(
        `http://localhost:5000/service-requests/${id}/respond`,
        { action: "quote", proposed_price: null, note: "accepted quote" },
        { headers: token ? { Authorization: token } : {} }
      );
      const negotiationId = resp.data && resp.data.id;
      if (negotiationId) {
        await axios.post(
          `http://localhost:5000/service-requests/${id}/accept`,
          { negotiation_id: negotiationId },
          { headers: token ? { Authorization: token } : {} }
        );
      }
      fetchRequests();
    } catch (err) {
      console.error("accept error");
    }
  };

  const handleDecline = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/service-requests/${id}/respond`,
        { action: "reject", note: "quote rejected" },
        { headers: token ? { Authorization: token } : {} }
      );
      fetchRequests();
    } catch (err) {
      console.error("decline error");
    }
  };

  const handleNegotiate = async (id, price) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/service-requests/${id}/respond`,
        { action: "quote", proposed_price: price, note: "proposed by me" },
        { headers: token ? { Authorization: token } : {} }
      );
      fetchRequests();
    } catch (err) {
      console.error("negotiate error");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
      <h2 style={{ color: "#007bff" }}>Open Service Requests</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {requests.length === 0 ? (
        <p>No open requests.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Client</th>
              <th>Address</th>
              <th>Type</th>
              <th>Rooms</th>
              <th>Budget</th>
              <th>Options</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <AdminRow
                key={r.id}
                r={r}
                onAccept={() => handleAccept(r.id)}
                onDecline={() => handleDecline(r.id)}
                onNegotiate={(price) => handleNegotiate(r.id, price)}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const AdminRow = ({ r, onAccept, onDecline, onNegotiate }) => {
  const [showNeg, setShowNeg] = useState(false);
  const [price, setPrice] = useState(r.proposed_budget || "");

  return (
    <tr style={{ borderTop: "1px solid #eee" }}>
      <td>{r.id}</td>
      <td>{r.client_username}</td>
      <td>{r.service_address}</td>
      <td>{r.type_of_cleaning}</td>
      <td>{r.number_of_rooms}</td>
      <td>{r.proposed_budget}</td>
      <td>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <button
            onClick={onAccept}
            style={{
              padding: "6px 10px",
              backgroundColor: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
            }}
          >
            Accept
          </button>
          <button
            onClick={onDecline}
            style={{
              padding: "6px 10px",
              backgroundColor: "#dc3545",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
            }}
          >
            Decline
          </button>
          {showNeg ? (
            <div style={{ display: "flex", gap: "6px" }}>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                style={{ width: "100px", padding: "6px" }}
              />
              <button
                onClick={() => {
                  onNegotiate(price);
                  setShowNeg(false);
                }}
                style={{ padding: "6px 10px" }}
              >
                Send
              </button>
              <button
                onClick={() => setShowNeg(false)}
                style={{ padding: "6px 8px" }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowNeg(true)}
              style={{ padding: "6px 10px" }}
            >
              Negotiate
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default AdminRequestsList;
