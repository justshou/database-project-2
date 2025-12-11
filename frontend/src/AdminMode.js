import React from "react";
import { Link } from "react-router-dom";

const AdminMode = () => {
  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
      <h2 style={{ color: "#007bff" }}>Admin Mode</h2>
      <p>Admin page for only admins (aka me and Anna)</p>
      <ul>
        <li>
          <Link to="/admin/requests">View Open Requests</Link>
        </li>
        <li>
          <Link to="/admin/users">Frequent Clients</Link>
        </li>
        <li>
          <Link to="/admin/uncommitted-clients">Uncommitted Clients</Link>
        </li>
        <li>
          <Link to="/admin/accepted-quotes">Accepted Quotes (This Month)</Link>
        </li>
        <li>
          <Link to="/admin/all-accepted-quotes">All Accepted Quotes</Link>
        </li>
        <li>
          <Link to="/admin/prospective-clients">Prospective Clients</Link>
        </li>
        <li>
          <Link to="/admin/largest-jobs">Largest Jobs</Link>
        </li>
        <li>
          <Link to="/admin/overdue-bills">Overdue Bills</Link>
        </li>
        <li>
          <Link to="/admin/bad-clients">Bad Clients</Link>
        </li>
        <li>
          <Link to="/admin/good-clients">Good Clients</Link>
        </li>
      </ul>
    </div>
  );
};

export default AdminMode;
