import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ServiceRequest = () => {
  const [serviceAddress, setServiceAddress] = useState("");
  const [typeOfCleaning, setTypeOfCleaning] = useState("");
  const [numberOfRooms, setNumberOfRooms] = useState(1);
  const [preferredDatetime, setPreferredDatetime] = useState("");
  const [proposedBudget, setProposedBudget] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        // send post request with the form data below (hopefully it goes through this time? kept getting error b4)
        "http://localhost:5000/service-request",
        {
          service_address: serviceAddress,
          type_of_cleaning: typeOfCleaning,
          number_of_rooms: numberOfRooms,
          preferred_datetime: preferredDatetime,
          proposed_budget: proposedBudget,
          notes,
        },
        {
          headers: token ? { Authorization: token } : {}, // check token
        }
      );
    } catch (err) {
      return err;
    }
  };

  return (
    <div className="container">
      <h2>Submit Service Request</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Service Address</label>
          <input
            type="text"
            value={serviceAddress}
            onChange={(e) => setServiceAddress(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Type of Cleaning</label>
          <input
            type="text"
            value={typeOfCleaning}
            onChange={(e) => setTypeOfCleaning(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Number of rooms</label>
          <input
            type="number"
            min="1"
            value={numberOfRooms}
            onChange={(e) => setNumberOfRooms(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Preferred date/time</label>
          <input
            type="datetime-local"
            value={preferredDatetime}
            onChange={(e) => setPreferredDatetime(e.target.value)} // convert to datetime to store in db
          />
        </div>

        <div className="form-group">
          <label>Proposed budget</label>
          <input
            type="number"
            value={proposedBudget}
            onChange={(e) => setProposedBudget(e.target.value)} // set budget for db
          />
        </div>

        <div className="form-group">
          <label>Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />
        </div>

        <button type="submit">Submit Request</button>
      </form>
    </div>
  );
};

export default ServiceRequest;
