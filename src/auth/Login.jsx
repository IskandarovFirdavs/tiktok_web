import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthAPI } from "../api/Api";
import "../styles/Login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await AuthAPI.login(username, password);
      setLoading(false);

      // 🔁 TO'LIQ RELOAD QILISH
      window.location.replace("/"); // avtomatik reload bilan bosh sahifaga
    } catch (error) {
      setLoading(false);
      setErr(error?.message || (error?.detail ?? "Login failed"));
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <img
          className="auth-logo"
          src="https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg"
          alt="TikTok"
        />
        <h2 className="auth-title">Log in to TikTok</h2>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            className="auth-input"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
          />
          <input
            className="auth-input"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {err && <div className="auth-error">{String(err)}</div>}

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Log in"}
          </button>
        </form>

        <div className="auth-footer">
          <span>Don't have an account? </span>
          <Link to="/register" className="auth-link">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
