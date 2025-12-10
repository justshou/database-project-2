// Author: Anik Tahabilder
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Importing routing components from react-router-dom
import HomePage from "./HomePage"; // Importing the HomePage component
import Login from "./Login"; // Importing the Login component
import Register from "./Register"; // Importing the Register component
import Dashboard from "./Dashboard"; // Importing the Dashboard component
import Profile from "./Profile"; // Importing the Profile component
import ServiceRequest from "./ServiceRequest"; // this is for requesting service as a client
import ServiceRequestDetail from "./ServiceRequestDetail";
import AdminRequestsList from "./AdminRequestsList";
import AdminMode from "./AdminMode"; // made a page for admin info
import AdminUsers from "./AdminUsers";
import AdminUncommitted from "./AdminUncommitted";
import AdminAcceptedQuotes from "./AdminAcceptedQuotes";
import AdminProspective from "./AdminProspective";
import AdminLargestJobs from "./AdminLargestJobs";
import Bills from "./Bills";
import PrivateRoute from "./PrivateRoute"; // Importing the PrivateRoute component for protected routes

function App() {
  return (
    <Router>
      {" "}
      {/* BrowserRouter provides the routing context to the application */}
      <Routes>
        {" "}
        {/* Defines the routing paths for the application */}
        {/* Public routes */}
        {/* Route for HomePage (accessible to everyone) */}
        <Route path="/" element={<HomePage />} />
        {/* Route for Login (accessible to everyone) */}
        <Route path="/login" element={<Login />} />
        {/* Route for Register (accessible to everyone) */}
        <Route path="/register" element={<Register />} />
        {/* Private routes */}
        {/* Dashboard route, protected by PrivateRoute (only accessible if authenticated) */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard /> {/* Renders Dashboard if user is authenticated */}
            </PrivateRoute>
          }
        />
        {/* Service Request - private */}
        <Route
          path="/service-request"
          element={
            <PrivateRoute>
              <ServiceRequest />
            </PrivateRoute>
          }
        />
        <Route
          path="/service-request/:id"
          element={
            <PrivateRoute>
              <ServiceRequestDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/requests"
          element={
            <PrivateRoute>
              <AdminRequestsList />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <PrivateRoute>
              <AdminUsers />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/uncommitted-clients"
          element={
            <PrivateRoute>
              <AdminUncommitted />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/accepted-quotes"
          element={
            <PrivateRoute>
              <AdminAcceptedQuotes />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/prospective-clients"
          element={
            <PrivateRoute>
              <AdminProspective />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/largest-jobs"
          element={
            <PrivateRoute>
              <AdminLargestJobs />
            </PrivateRoute>
          }
        />
        <Route
          path="/bills"
          element={
            <PrivateRoute>
              <Bills />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/mode"
          element={
            <PrivateRoute>
              <AdminMode />
            </PrivateRoute>
          }
        />
        {/* Profile route, protected by PrivateRoute (only accessible if authenticated) */}
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile /> {/* Renders Profile if user is authenticated */}
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
