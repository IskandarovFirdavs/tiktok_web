import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./layout/Navbar";
import Footer from "./layout/Footer";
import Friends from "./components/Friends";
import Home from "./components/Home";
import Explore from "./components/Explore";
import Inbox from "./components/Inbox";
import Notification from "./components/Notifications";
import Profile from "./components/Profile";
import Search from "./components/Search";
import Upload from "./components/Upload";
import Login from "./auth/Login";
import Register from "./auth/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import Another_profile from "./components/Another_profile";
import { isAuthenticated } from "./api/Api";
import "./App.css";

const App = () => {
  const auth = isAuthenticated();

  return (
    <div className="app-container">
      {auth && <Navbar />}
      <div className="main-content">
        <div className="main-scroll-area">
          <Routes>
            {/* Public (only when NOT authenticated) */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* Protected (require auth) */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/search"
              element={
                <ProtectedRoute>
                  <Search />
                </ProtectedRoute>
              }
            />
            <Route
              path="/explore"
              element={
                <ProtectedRoute>
                  <Explore />
                </ProtectedRoute>
              }
            />
            <Route
              path="/friends"
              element={
                <ProtectedRoute>
                  <Friends />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inbox"
              element={
                <ProtectedRoute>
                  <Inbox />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notification"
              element={
                <ProtectedRoute>
                  <Notification />
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <Upload />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/another_profile/:id"
              element={
                <ProtectedRoute>
                  <Another_profile />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route
              path="*"
              element={<Navigate to={auth ? "/" : "/login"} replace />}
            />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default App;
