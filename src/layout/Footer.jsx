import React from "react";
import "../styles/Footer.css";
import { BoxArrowRight } from "react-bootstrap-icons";
import { logoutUser } from "../api/Api";

// Footer.jsx
const Footer = () => {
  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Backend logout failed:", error);
      // Backend xatoligiga qaramay, frontend tozalash
    } finally {
      // HAR QANDAY HOLATDA tokenlarni tozalash va login sahifasiga o'tish
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.replace("/login");
    }
  };

  return (
    <div className="footer">
      <p>© 2025 TikTok</p>

      <button className="logout-btn" onClick={handleLogout}>
        <BoxArrowRight /> <span>Logout</span>
      </button>

      <ul className="footer-links">
        <li>Company</li>
        <li>Programmes</li>
        <li>Terms & Policies</li>
      </ul>
    </div>
  );
};

export default Footer;
