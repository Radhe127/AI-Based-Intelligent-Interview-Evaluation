import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Landing from "./pages/Landing.jsx";
import Signup from "./pages/Signup.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import SetupInterview from "./pages/SetupInterview.jsx";
import InterviewRoom from "./pages/InterviewRoom.jsx";
import Scorecard from "./pages/Scorecard.jsx";

export default function App() {
  return (
    <div className="page-bg">
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/setup"
          element={
            <ProtectedRoute>
              <SetupInterview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview/:interviewId"
          element={
            <ProtectedRoute>
              <InterviewRoom />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report/:interviewId"
          element={
            <ProtectedRoute>
              <Scorecard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}
