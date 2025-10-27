import React from "react";
import { NavLink } from "react-router-dom";
import {
  HouseFill,
  Compass,
  People,
  Envelope,
  Bell,
  Person,
  ThreeDots,
  Search,
  CloudUpload,
  PlayBtn,
  Chat,
} from "react-bootstrap-icons";
import "../styles/Navbar.css";

const Navbar = () => {
  return (
    <div className="navbar">
      <div className="logo-section">
        <img
          src="https://cdn.pixabay.com/photo/2021/06/15/12/28/tiktok-6338432_1280.png"
          alt="TikTok"
          className="tiktok-logo"
        />
        <h1>TikTok</h1>
      </div>

      <div className="search-box">
        <input type="text" placeholder="Search" />
      </div>

      <ul className="nav-links">
        <li>
          <NavLink to="/" className="nav-item">
            <HouseFill /> <span>For You</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/explore" className="nav-item">
            <Compass /> <span>Explore</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/friends" className="nav-item">
            <People /> <span>Following</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/inbox" className="nav-item">
            <Chat /> <span>Inbox</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/upload" className="nav-item">
            <CloudUpload /> <span>Upload</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/notification" className="nav-item">
            <Bell /> <span>Notification</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/profile" className="nav-item">
            <Person /> <span>Profile</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/more" className="nav-item">
            <ThreeDots /> <span>More</span>
          </NavLink>
        </li>
      </ul>

      <div className="footer-links">
        <p>Company</p>
        <p>Programme</p>
        <p>Terms & Policies</p>
        <p>© 2025 TikTok</p>
      </div>
    </div>
  );
};

export default Navbar;
