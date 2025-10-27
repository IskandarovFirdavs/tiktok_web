import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthAPI } from "../api/Api";
import "../styles/Register.css";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handleAvatar = (e) => {
    const f = e.target.files?.[0] ?? null;
    setAvatar(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      // If avatar present use multipart/form-data
      let payload;
      let headers = {};
      if (avatar) {
        payload = new FormData();
        payload.append("username", username);
        payload.append("password", password);
        if (email) payload.append("email", email);
        if (first_name) payload.append("first_name", first_name);
        if (last_name) payload.append("last_name", last_name);
        payload.append("avatar", avatar);
        // register endpoint expects JSON? DRF handles multipart too.
        await AuthAPI.register(payload);
      } else {
        payload = { username, password, email, first_name, last_name };
        await AuthAPI.register(payload);
      }

      // auto-login after register
      await AuthAPI.login(username, password);
      setLoading(false);

      // 🔁 TO'LIQ RELOAD QILISH
      window.location.replace("/"); // avtomatik reload bilan bosh sahifaga
    } catch (error) {
      setLoading(false);
      setErr(error?.message || (error?.detail ?? "Registration failed"));
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
        <h2 className="auth-title">Create an account</h2>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
          encType="multipart/form-data"
        >
          <input
            className="auth-input"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            className="auth-input"
            placeholder="Email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
          />
          <input
            className="auth-input"
            placeholder="First name (optional)"
            value={first_name}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <input
            className="auth-input"
            placeholder="Last name (optional)"
            value={last_name}
            onChange={(e) => setLastName(e.target.value)}
          />
          <input
            className="auth-input"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label className="avatar-label">
            <input type="file" accept="image/*" onChange={handleAvatar} />
            Upload avatar (optional)
          </label>

          {err && <div className="auth-error">{String(err)}</div>}

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Sign up"}
          </button>
        </form>

        <div className="auth-footer">
          <span>Already have an account? </span>
          <Link to="/login" className="auth-link">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
