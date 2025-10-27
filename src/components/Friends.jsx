"use client";

import { useState, useEffect } from "react";
import { AuthAPI } from "../api/Api";
import "../styles/Friends.css";

const Friends = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [followingMap, setFollowingMap] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await AuthAPI.userList({ limit: 50 });

      const usersList = response.results || response || [];
      setUsers(usersList.slice(0, 12));

      // Initialize following map
      const following = {};
      usersList.forEach((user) => {
        following[user.id] = user.is_following || false;
      });
      setFollowingMap(following);

      setError(null);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load creators");
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async (userId) => {
    try {
      await AuthAPI.followToggle(userId);
      setFollowingMap((prev) => ({
        ...prev,
        [userId]: !prev[userId],
      }));
    } catch (err) {
      console.error("Error toggling follow:", err);
    }
  };

  if (loading) {
    return (
      <div className="friends-container">
        <div className="loading">Loading creators...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="friends-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="friends-container">
      <div className="friends-header">
        <h1>Creators to Follow</h1>
        <p>Discover amazing creators</p>
      </div>

      <div className="friends-grid">
        {users.map((user) => (
          <div key={user.id} className="user-card">
            {/* Background image from user's avatar or profile */}
            <div
              className="card-background"
              style={{
                backgroundImage: user.avatar
                  ? `url(${user.avatar})`
                  : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            />

            {/* User info overlay */}
            <div className="card-content">
              {/* Avatar */}
              <div className="user-avatar">
                <img
                  src={
                    user.avatar ||
                    "/placeholder.svg?height=80&width=80&query=user+avatar"
                  }
                  alt={user.username}
                />
              </div>

              {/* Username with verified badge */}
              <div className="user-info">
                <div className="username-container">
                  <h3 className="username">{user.username}</h3>
                  {user.is_verified && (
                    <span className="verified-badge">✓</span>
                  )}
                </div>
                {user.bio && <p className="bio">{user.bio}</p>}
              </div>

              {/* Follow button */}
              <button
                className={`follow-btn ${
                  followingMap[user.id] ? "following" : ""
                }`}
                onClick={() => handleFollowToggle(user.id)}
              >
                {followingMap[user.id] ? "Following" : "Follow"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Friends;
