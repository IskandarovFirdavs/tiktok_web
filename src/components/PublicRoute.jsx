import React from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../api/Api";

const PublicRoute = ({ children }) => {
  return !isAuthenticated() ? children : <Navigate to="/" replace />;
};

export default PublicRoute;
