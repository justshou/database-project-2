import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const ServiceRequestDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [note] = useState("");
  const [price] = useState("");
  const [start] = useState("");
  const [end] = useState("");
  const [profile, setProfile] = useState(null);
  const [error] = useState("");

  useEffect(() => {
    fetchData();
    fetchProfile();
  }, [id]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5000/service-requests/${id}`,
        { headers: token ? { Authorization: token } : {} }
      );
      setData(res.data);
    } catch (err) {
      return err;
    }
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/profile", {
        headers: token ? { Authorization: token } : {},
      });
      setProfile(res.data);
    } catch (err) {
      // ignore
    }
  };

  const adminResponse = async (action) => {
    // quote or reject the quote
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/service-requests/${id}/respond`,
        {
          action,
          proposed_price: price || null,
          proposed_start: start || null,
          proposed_end: end || null,
          note,
        },
        { headers: token ? { Authorization: token } : {} }
      );
      fetchData();
    } catch (err) {
      return err;
    }
  };

  const counterOffer = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/service-requests/${id}/counter`,
        {
          note,
          proposed_price: price || null,
          proposed_start: start || null,
          proposed_end: end || null,
        },
        { headers: token ? { Authorization: token } : {} }
      );
      fetchData();
    } catch (err) {
      return err;
    }
  };

  const handleAccept = async (negotiation_id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/service-requests/${id}/accept`,
        { negotiation_id },
        { headers: token ? { Authorization: token } : {} }
      );
      fetchData();
    } catch (err) {
      return err;
    }
  };

  // check if user is admin (or anna)
  const isAdmin =
    profile &&
    profile.username &&
    ["anna", "admin"].includes(profile.username.toLowerCase());

  return (
    <div>
      <h2>Service Request #{data.request.id}</h2>
      <p>
        <strong>Address:</strong> {data.request.service_address}
      </p>
      <p>
        <strong>Type:</strong> {data.request.type_of_cleaning}
      </p>
      <p>
        <strong>Rooms:</strong> {data.request.number_of_rooms}
      </p>
      <p>
        <strong>Preferred:</strong> {data.request.preferred_datetime}
      </p>
      <p>
        <strong>Budget:</strong> {data.request.proposed_budget}
      </p>
      <p>
        <strong>Notes:</strong> {data.request.notes}
      </p>
      <p>
        <strong>Status:</strong> {data.request.status}
      </p>

      {isAdmin ? (
        <div>
          <button onClick={() => adminResponse("quote")}>Send Quote</button>
          <button onClick={() => adminResponse("reject")}>Reject</button>
        </div>
      ) : (
        <div>
          <button onClick={counterOffer}>Send counter offer</button>
        </div>
      )}
    </div>
  );
};

export default ServiceRequestDetail;
