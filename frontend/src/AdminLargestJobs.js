import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminLargestJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:5000/admin/largest-jobs",
          {
            headers: token ? { Authorization: token } : {},
          }
        );
        setJobs(res.data.jobs || []);
      } catch (err) {
        setError(
          err.response && err.response.data && err.response.data.message
            ? err.response.data.message
            : "Failed to load largest jobs"
        );
      }
    };
    fetchJobs();
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
      <h2 style={{ color: "#007bff" }}>Largest Jobs (by rooms)</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {jobs.length === 0 ? (
        <p>No jobs found.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "8px" }}>#</th>
              <th style={{ textAlign: "left", padding: "8px" }}>Order ID</th>
              <th style={{ textAlign: "left", padding: "8px" }}>Rooms</th>
              <th style={{ textAlign: "left", padding: "8px" }}>Client</th>
              <th style={{ textAlign: "left", padding: "8px" }}>Provider</th>
              <th style={{ textAlign: "left", padding: "8px" }}>Price</th>
              <th style={{ textAlign: "left", padding: "8px" }}>Address</th>
              <th style={{ textAlign: "left", padding: "8px" }}>Scheduled</th>
              <th style={{ textAlign: "left", padding: "8px" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((j, idx) => (
              <tr
                key={j.order_id || idx}
                style={{ borderTop: "1px solid #eee" }}
              >
                <td style={{ padding: "8px" }}>{idx + 1}</td>
                <td style={{ padding: "8px" }}>{j.order_id}</td>
                <td style={{ padding: "8px" }}>{j.number_of_rooms ?? "-"}</td>
                <td style={{ padding: "8px" }}>{j.client_username || "-"}</td>
                <td style={{ padding: "8px" }}>{j.provider_username || "-"}</td>
                <td style={{ padding: "8px" }}>{j.price ?? "-"}</td>
                <td style={{ padding: "8px" }}>{j.service_address || "-"}</td>
                <td style={{ padding: "8px" }}>
                  {j.scheduled_start
                    ? `${j.scheduled_start} → ${j.scheduled_end || ""}`
                    : "-"}
                </td>
                <td style={{ padding: "8px" }}>{j.order_status || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminLargestJobs;
