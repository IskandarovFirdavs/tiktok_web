"use client";

import { useEffect, useState } from "react";
import API from "../api/Api";
import "../styles/Explore.css";

const Explore = () => {
  const [posts, setPosts] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    fetchExploreData();
  }, []);

  const fetchExploreData = async () => {
    try {
      setLoading(true);
      const [genresRes, postsRes] = await Promise.all([
        API.GenreAPI.list(),
        API.PostsAPI.list(),
      ]);

      setGenres(Array.isArray(genresRes) ? genresRes : genresRes.results || []);
      setPosts(Array.isArray(postsRes) ? postsRes : postsRes.results || []);
    } catch (error) {
      console.error("Error fetching explore data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts =
    selectedGenre === "all"
      ? posts
      : posts.filter((post) => post.genre === selectedGenre);

  const getThumbnail = (post) => {
    if (post.post && typeof post.post === "string") {
      return post.post;
    }
    return post.post || "/video-production-setup.png";
  };

  const getPostType = (post) => {
    const thumbnail = getThumbnail(post);
    return thumbnail?.includes(".mp4") || thumbnail?.includes(".webm")
      ? "video"
      : "image";
  };

  return (
    <div className="explore-container">
      <div className="explore-header">
        <div className="genres-scroll-container">
          <button
            className={`genre-btn ${selectedGenre === "all" ? "active" : ""}`}
            onClick={() => setSelectedGenre("all")}
          >
            All
          </button>
          {genres.map((genre) => (
            <button
              key={genre.id || genre.value}
              className={`genre-btn ${
                selectedGenre === genre.value ? "active" : ""
              }`}
              onClick={() => setSelectedGenre(genre.value)}
            >
              {genre.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="explore-content">
        <div className="explore-grid">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <div
                key={post.id}
                className="explore-card"
                onClick={() => setSelectedPost(post)}
              >
                <div className="card-media">
                  {getPostType(post) === "video" ? (
                    <video
                      src={getThumbnail(post)}
                      className="card-thumbnail"
                      onMouseEnter={(e) => {
                        e.target.play();
                      }}
                      onMouseLeave={(e) => {
                        e.target.pause();
                        e.target.currentTime = 0;
                      }}
                    />
                  ) : (
                    <img
                      src={getThumbnail(post) || "/placeholder.svg"}
                      alt={post.title}
                      className="card-thumbnail"
                    />
                  )}
                  <div className="card-overlay">
                    <div className="card-info">
                      <h3>{post.title || "Untitled"}</h3>
                      <p className="card-creator">
                        @{post.creator?.username || "unknown"}
                      </p>
                    </div>
                    <div className="card-stats">
                      <span className="stat">
                        <span className="heart-icon">❤</span>{" "}
                        {post.likes_count || 0}
                      </span>
                      <span className="stat">
                        <span className="comment-icon">💬</span>{" "}
                        {post.comments_count || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">No posts found</div>
          )}
        </div>
      </div>

      {selectedPost && (
        <div className="modal-overlay" onClick={() => setSelectedPost(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedPost(null)}>
              ✕
            </button>
            <div className="modal-media">
              {getPostType(selectedPost) === "video" ? (
                <video
                  src={getThumbnail(selectedPost)}
                  controls
                  autoPlay
                  className="modal-video"
                />
              ) : (
                <img
                  src={getThumbnail(selectedPost) || "/placeholder.svg"}
                  alt={selectedPost.title}
                  className="modal-image"
                />
              )}
            </div>
            <div className="modal-info">
              <div>
                <h2>{selectedPost.title}</h2>
                <p>{selectedPost.description}</p>
              </div>
              <div className="modal-creator">
                <img
                  src={
                    selectedPost.creator?.avatar ||
                    "/placeholder.svg?height=40&width=40&query=avatar"
                  }
                  alt={selectedPost.creator?.username}
                  className="creator-avatar"
                />
                <div>
                  <p className="creator-name">
                    @{selectedPost.creator?.username}
                  </p>
                  <button className="follow-btn">Follow</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Explore;
