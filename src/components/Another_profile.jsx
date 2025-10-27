"use client";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { AuthAPI, PostsAPI } from "../api/Api";
import "../styles/Profile.css";

const Another_profile = () => {
  const { id: userId } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("videos");
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const userData = await AuthAPI.getUser(userId);
        setUser(userData);
        setIsFollowing(userData.is_following || false);

        const postsData = await PostsAPI.list({ user: userData.id });
        setPosts(
          Array.isArray(postsData) ? postsData : postsData.results || []
        );
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchProfileData();
  }, [userId]);

  const handleFollowToggle = async () => {
    try {
      setFollowLoading(true);
      await AuthAPI.followToggle(userId);
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error("[v0] Follow toggle error:", err);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-wrapper">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-wrapper">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-wrapper">
        <div className="error">User not found</div>
      </div>
    );
  }

  return (
    <div className="profile-wrapper">
      {/* Profile Header Section */}
      <div className="profile-header-section">
        {/* Avatar */}
        <div className="profile-avatar-container">
          {user.avatar ? (
            <img
              src={user.avatar || "/placeholder.svg"}
              alt={user.username}
              className="profile-avatarr"
            />
          ) : (
            <div className="profile-avatarr placeholder">
              {user.username?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* User Info and Follow Button */}
        <div className="profile-header-content">
          <div className="profile-header-top">
            <div className="profile-username-section">
              <h1 className="profile-username">{user.username}</h1>
              {user.is_verified && <span className="verified-badge">✓</span>}
            </div>
            <button
              className={`edit-profile-btn ${isFollowing ? "following" : ""}`}
              onClick={handleFollowToggle}
              disabled={followLoading}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          </div>

          <p className="profile-display-name">
            {user.first_name} {user.last_name}
          </p>
          <p className="profile-bio">{user.bio || "No bio yet"}</p>
          {user.website && (
            <a
              href={user.website}
              className="profile-website"
              target="_blank"
              rel="noopener noreferrer"
            >
              {user.website}
            </a>
          )}
        </div>
      </div>

      {/* Stats Section */}
      <div className="profile-stats">
        <div className="stat-item">
          <div className="stat-value">{posts.length}</div>
          <div className="stat-label">Videos</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{user.followers_count || 0}</div>
          <div className="stat-label">Followers</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{user.following_count || 0}</div>
          <div className="stat-label">Following</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{user.likes_count || 0}</div>
          <div className="stat-label">Likes</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        <button
          className={`tab-btn ${activeTab === "videos" ? "active" : ""}`}
          onClick={() => setActiveTab("videos")}
        >
          Videos
        </button>
        <button
          className={`tab-btn ${activeTab === "liked" ? "active" : ""}`}
          onClick={() => setActiveTab("liked")}
        >
          Liked
        </button>
      </div>

      {/* Posts Grid */}
      <div className="posts-grid">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="post-item">
              {post.video ? (
                <video src={post.video} className="post-video" />
              ) : (
                <div className="post-placeholder">No video</div>
              )}
              <div className="post-info">
                <span className="post-likes">❤️ {post.likes_count || 0}</span>
                <span className="post-comments">
                  💬 {post.comments_count || 0}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="no-posts">No videos yet</div>
        )}
      </div>
    </div>
  );
};

export default Another_profile;
