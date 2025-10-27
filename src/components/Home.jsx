"use client";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { PostsAPI, AuthAPI, CommentAPI, ReplyAPI } from "../api/Api";
import "../styles/Home.css";

// TikTok-style Icons
const LikeIcon = ({ filled }) => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill={filled ? "#fe2c55" : "none"}
    stroke={filled ? "#fe2c55" : "white"}
    strokeWidth="2"
  >
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const CommentIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="2"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const ShareIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="2"
  >
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const SaveIcon = ({ filled }) => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill={filled ? "#fe2c55" : "none"}
    stroke={filled ? "#fe2c55" : "white"}
    strokeWidth="2"
  >
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

const MusicIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="white"
    stroke="white"
    strokeWidth="2"
  >
    <path d="M9 18v-5m0 0V5m0 8h6m0-8v13m0 0V5" />
  </svg>
);

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [followedUsers, setFollowedUsers] = useState([]);
  const [commentTexts, setCommentTexts] = useState({});
  const [replyTexts, setReplyTexts] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [expandedReplies, setExpandedReplies] = useState({});
  const [editingComment, setEditingComment] = useState(null);
  const [editingReply, setEditingReply] = useState(null);
  const [playingMusic, setPlayingMusic] = useState(null);
  const videoRefs = useRef({});
  const audioRefs = useRef({});
  const [isPlaying, setIsPlaying] = useState({});
  const feedRef = useRef(null);

  const navigate = useNavigate();

  const handleProfileClick = (userId) => {
    navigate(`/another_profile/${userId}`);
  };

  useEffect(() => {
    loadPosts();
    loadCurrentUser();
  }, []);
  const [followingUsers, setFollowingUsers] = useState({});

  const handleFollowToggle = async (userId) => {
    try {
      await AuthAPI.followToggle(userId);
      setFollowingUsers((prev) => ({
        ...prev,
        [userId]: !prev[userId], // holatni o‘zgartiramiz
      }));
    } catch (err) {
      console.error("Follow toggle error:", err);
    }
  };

  const loadPosts = async () => {
    try {
      const response = await PostsAPI.list();
      let postsData = [];

      if (Array.isArray(response)) {
        postsData = response;
      } else if (response && typeof response === "object") {
        if (Array.isArray(response.results)) postsData = response.results;
        else if (Array.isArray(response.data)) postsData = response.data;
        else if (Array.isArray(response.posts)) postsData = response.posts;
        else if (Array.isArray(response.items)) postsData = response.items;
        else {
          const firstArray = Object.values(response).find(Array.isArray);
          if (firstArray) postsData = firstArray;
          else if (response.id) postsData = [response];
        }
      }

      const validatedPosts = (Array.isArray(postsData) ? postsData : []).map(
        (post) => ({
          id: post.id || Math.random().toString(36).substr(2, 9),
          title: post.title || "No Title",
          description: post.description || "",
          post: post.post || post.video || post.image || "/default-video.mp4",
          postType:
            post.post_type ||
            (post.post?.includes(".mp4") ? "video" : "image") ||
            "video",
          user: post.user || {
            username: "unknown",
            avatar: "/default-avatar.png",
            id: 0,
          },
          created_at: post.created_at || new Date().toISOString(),
          likes: post.likes || [],
          likes_count: post.likes_count || post.likes?.length || 0,
          // Add this line - include the liked_by_current_user field from API
          liked_by_current_user: post.liked_by_current_user || false,
          comments: post.comments || [],
          comments_count: post.comments_count || post.comments?.length || 0,
          reposts_count: post.reposts_count || 0,
          saves_count: post.saves_count || 0,
          hashtags: post.hashtags || [],
          music: post.music || null,
          saved: post.saved || false,
          reposted: post.reposted || false,
          reposted_by: post.reposted_by || null,
        })
      );

      setPosts(validatedPosts);
    } catch (error) {
      console.error("Error loading posts:", error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentUser = async () => {
    try {
      const user = await AuthAPI.currentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error("Error loading current user:", error);
    }
  };

  // Video Controls
  const toggleVideoPlay = (postId) => {
    const video = videoRefs.current[postId];
    if (video) {
      if (video.paused) {
        video
          .play()
          .then(() => setIsPlaying((prev) => ({ ...prev, [postId]: true })))
          .catch(console.error);
      } else {
        video.pause();
        setIsPlaying((prev) => ({ ...prev, [postId]: false }));
      }
    }
  };

  // Music Controls
  const toggleMusicPlay = (postId) => {
    if (playingMusic === postId) {
      audioRefs.current[postId]?.pause();
      setPlayingMusic(null);
    } else {
      if (playingMusic && audioRefs.current[playingMusic]) {
        audioRefs.current[playingMusic].pause();
      }
      audioRefs.current[postId]?.play().catch(console.error);
      setPlayingMusic(postId);
    }
  };

  // Post Interactions
  const handleLike = async (postId) => {
    try {
      // 1️⃣ Postni topamiz
      const currentPost = posts.find((p) => p.id === postId);
      if (!currentPost) return;

      // 2️⃣ Oldingi holat asosida yangi state yasaymiz
      const updatedPosts = posts.map((post) => {
        if (post.id !== postId) return post;

        const isLiked = post.liked_by_current_user;
        const newCount = isLiked
          ? Math.max(0, (post.likes_count || 0) - 1)
          : (post.likes_count || 0) + 1;

        return {
          ...post,
          liked_by_current_user: !isLiked,
          likes_count: newCount,
        };
      });

      // 3️⃣ State ni darhol yangilaymiz (UI darhol yangilanadi)
      setPosts(updatedPosts);

      // 4️⃣ API chaqiramiz
      await PostsAPI.likeToggle(postId);
    } catch (e) {
      console.error("Like error:", e);
    }
  };

  const handleSave = async (postId) => {
    try {
      setPosts(
        posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                saved: !post.saved,
                saves_count: post.saved
                  ? post.saves_count - 1
                  : post.saves_count + 1,
              }
            : post
        )
      );
    } catch (error) {
      console.error("Error saving post:", error);
    }
  };

  const handleRepost = async (postId) => {
    try {
      setPosts(
        posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                reposted: !post.reposted,
                reposts_count: post.reposted
                  ? post.reposts_count - 1
                  : post.reposts_count + 1,
              }
            : post
        )
      );
    } catch (error) {
      console.error("Error reposting:", error);
    }
  };

  // Comment Interactions
  const handleCommentSubmit = async (postId) => {
    const text = commentTexts[postId];
    if (!text?.trim()) return;

    try {
      const newComment = await CommentAPI.create(postId, text);
      setPosts(
        posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: [newComment, ...post.comments],
                comments_count: post.comments_count + 1,
              }
            : post
        )
      );
      setCommentTexts({ ...commentTexts, [postId]: "" });
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  const handleCommentEdit = async (postId, commentId, newText) => {
    try {
      await CommentAPI.update(commentId, { text: newText });
      setPosts(
        posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: post.comments.map((comment) =>
                  comment.id === commentId
                    ? { ...comment, text: newText }
                    : comment
                ),
              }
            : post
        )
      );
      setEditingComment(null);
    } catch (error) {
      console.error("Error editing comment:", error);
    }
  };

  const handleCommentDelete = async (postId, commentId) => {
    try {
      await CommentAPI.delete(commentId);
      setPosts(
        posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: post.comments.filter(
                  (comment) => comment.id !== commentId
                ),
                comments_count: post.comments_count - 1,
              }
            : post
        )
      );
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleCommentLike = async (commentId, postId) => {
    try {
      await CommentAPI.likeToggle(commentId);
      setPosts(
        posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: post.comments.map((comment) =>
                  comment.id === commentId
                    ? {
                        ...comment,
                        likes: comment.likes.some(
                          (like) => like.user === currentUser?.id
                        )
                          ? comment.likes.filter(
                              (like) => like.user !== currentUser?.id
                            )
                          : [...comment.likes, { user: currentUser?.id }],
                        likes_count: comment.likes.some(
                          (like) => like.user === currentUser?.id
                        )
                          ? comment.likes_count - 1
                          : comment.likes_count + 1,
                      }
                    : comment
                ),
              }
            : post
        )
      );
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  const handleCommentDislike = async (commentId, postId) => {
    try {
      if (CommentAPI.dislikeToggle) {
        await CommentAPI.dislikeToggle(commentId);
      }
      setPosts(
        posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: post.comments.map((comment) =>
                  comment.id === commentId
                    ? {
                        ...comment,
                        dislikes: comment.dislikes?.some(
                          (dislike) => dislike.user === currentUser?.id
                        )
                          ? comment.dislikes.filter(
                              (dislike) => dislike.user !== currentUser?.id
                            )
                          : [
                              ...(comment.dislikes || []),
                              { user: currentUser?.id },
                            ],
                        dislikes_count: comment.dislikes?.some(
                          (dislike) => dislike.user === currentUser?.id
                        )
                          ? (comment.dislikes_count || 0) - 1
                          : (comment.dislikes_count || 0) + 1,
                      }
                    : comment
                ),
              }
            : post
        )
      );
    } catch (error) {
      console.error("Error disliking comment:", error);
    }
  };

  // Reply Interactions
  const handleReplySubmit = async (postId, commentId) => {
    const text = replyTexts[`${postId}-${commentId}`];
    if (!text?.trim()) return;

    try {
      const newReply = await ReplyAPI.create(postId, commentId, text);
      setPosts(
        posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: post.comments.map((comment) =>
                  comment.id === commentId
                    ? {
                        ...comment,
                        replies: [newReply, ...(comment.replies || [])],
                        replies_count: (comment.replies_count || 0) + 1,
                      }
                    : comment
                ),
              }
            : post
        )
      );
      setReplyTexts({ ...replyTexts, [`${postId}-${commentId}`]: "" });
    } catch (error) {
      console.error("Error posting reply:", error);
    }
  };

  const handleReplyEdit = async (postId, commentId, replyId, newText) => {
    try {
      await ReplyAPI.update(replyId, { text: newText });
      setPosts(
        posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: post.comments.map((comment) =>
                  comment.id === commentId
                    ? {
                        ...comment,
                        replies: comment.replies.map((reply) =>
                          reply.id === replyId
                            ? { ...reply, text: newText }
                            : reply
                        ),
                      }
                    : comment
                ),
              }
            : post
        )
      );
      setEditingReply(null);
    } catch (error) {
      console.error("Error editing reply:", error);
    }
  };

  const handleReplyDelete = async (postId, commentId, replyId) => {
    try {
      await ReplyAPI.delete(replyId);
      setPosts(
        posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: post.comments.map((comment) =>
                  comment.id === commentId
                    ? {
                        ...comment,
                        replies: comment.replies.filter(
                          (reply) => reply.id !== replyId
                        ),
                        replies_count: (comment.replies_count || 0) - 1,
                      }
                    : comment
                ),
              }
            : post
        )
      );
    } catch (error) {
      console.error("Error deleting reply:", error);
    }
  };

  const handleReplyLike = async (replyId, postId, commentId) => {
    try {
      await ReplyAPI.likeToggle(replyId);
      setPosts(
        posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: post.comments.map((comment) =>
                  comment.id === commentId
                    ? {
                        ...comment,
                        replies: comment.replies.map((reply) =>
                          reply.id === replyId
                            ? {
                                ...reply,
                                likes: reply.likes.some(
                                  (like) => like.user === currentUser?.id
                                )
                                  ? reply.likes.filter(
                                      (like) => like.user !== currentUser?.id
                                    )
                                  : [...reply.likes, { user: currentUser?.id }],
                                likes_count: reply.likes.some(
                                  (like) => like.user === currentUser?.id
                                )
                                  ? reply.likes_count - 1
                                  : reply.likes_count + 1,
                              }
                            : reply
                        ),
                      }
                    : comment
                ),
              }
            : post
        )
      );
    } catch (error) {
      console.error("Error liking reply:", error);
    }
  };

  const handleReplyDislike = async (replyId, postId, commentId) => {
    try {
      if (ReplyAPI.dislikeToggle) {
        await ReplyAPI.dislikeToggle(replyId);
      }
      setPosts(
        posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: post.comments.map((comment) =>
                  comment.id === commentId
                    ? {
                        ...comment,
                        replies: comment.replies.map((reply) =>
                          reply.id === replyId
                            ? {
                                ...reply,
                                dislikes: reply.dislikes?.some(
                                  (dislike) => dislike.user === currentUser?.id
                                )
                                  ? reply.dislikes.filter(
                                      (dislike) =>
                                        dislike.user !== currentUser?.id
                                    )
                                  : [
                                      ...(reply.dislikes || []),
                                      { user: currentUser?.id },
                                    ],
                                dislikes_count: reply.dislikes?.some(
                                  (dislike) => dislike.user === currentUser?.id
                                )
                                  ? (reply.dislikes_count || 0) - 1
                                  : (reply.dislikes_count || 0) + 1,
                              }
                            : reply
                        ),
                      }
                    : comment
                ),
              }
            : post
        )
      );
    } catch (error) {
      console.error("Error disliking reply:", error);
    }
  };

  const toggleComments = (postId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const toggleReplies = (commentId) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const formatCount = (count) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + "M";
    if (count >= 1000) return (count / 1000).toFixed(1) + "K";
    return count;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) return `${Math.floor(diffInHours * 60)}m ago`;
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  // Auto-play videos when they come into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          const postId = Object.keys(videoRefs.current).find(
            (key) => videoRefs.current[key] === video
          );

          if (entry.isIntersecting) {
            video
              .play()
              .then(() => setIsPlaying((prev) => ({ ...prev, [postId]: true })))
              .catch(console.error);
          } else {
            video.pause();
            setIsPlaying((prev) => ({ ...prev, [postId]: false }));
          }
        });
      },
      { threshold: 0.8 }
    );

    Object.values(videoRefs.current).forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => observer.disconnect();
  }, [posts]);

  if (loading) {
    return (
      <div className="tiktok-loading">
        <div className="loading-spinner"></div>
        <span>Loading videos...</span>
      </div>
    );
  }

  if (!Array.isArray(posts) || posts.length === 0) {
    return (
      <div className="tiktok-no-posts">
        <div className="no-posts-icon">🎬</div>
        <span>No videos available</span>
        <small>Start following users to see videos</small>
      </div>
    );
  }

  return (
    <div className="tiktok-home" ref={feedRef}>
      <div className="tiktok-feed">
        {posts.map((post) => (
          <div key={post.id} className="tiktok-video-container">
            {/* Video/Image Section */}
            <div className="video-section">
              <div className="video-wrapper">
                {post.postType === "video" ? (
                  <video
                    ref={(el) => (videoRefs.current[post.id] = el)}
                    src={post.post}
                    className="tiktok-video"
                    loop
                    playsInline
                    preload="metadata"
                    onClick={() => toggleVideoPlay(post.id)}
                  />
                ) : (
                  <img
                    src={post.post || "/placeholder.svg"}
                    alt={post.title}
                    className="tiktok-image"
                  />
                )}

                {/* Video Play/Pause Overlay */}
                {post.postType === "video" && (
                  <div
                    className={`video-overlay ${
                      isPlaying[post.id] ? "playing" : "paused"
                    }`}
                    onClick={() => toggleVideoPlay(post.id)}
                  >
                    <div className="play-pause-icon">
                      {isPlaying[post.id] ? "❚❚" : "▶"}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Action Buttons */}
              <div className="action-buttons-right">
                <div className="action-column">
                  {/* Profile Avatar with Follow */}
                  <div className="profile-action">
                    <div className="profile-avatar-wrapper">
                      <img
                        src={post.user?.avatar || "/default-avatar.png"}
                        alt={post.user?.username}
                        className="profile-avatar"
                      />
                      <button className="follow-badge">
                        <span className="plus-icon">+</span>
                      </button>
                    </div>
                  </div>

                  {/* Like Button */}
                  <button
                    className={`action-btn vertical ${
                      post.liked_by_current_user ? "active" : ""
                    }`}
                    onClick={() => handleLike(post.id)}
                  >
                    <div className="action-icon">
                      <LikeIcon filled={post.liked_by_current_user} />
                    </div>
                    <span className="action-count">
                      {formatCount(post.likes_count || 0)}
                    </span>
                  </button>

                  {/* Comment Button */}
                  <button
                    className="action-btn vertical"
                    onClick={() => toggleComments(post.id)}
                  >
                    <div className="action-icon">
                      <CommentIcon />
                    </div>
                    <span className="action-count">
                      {formatCount(post.comments_count || 0)}
                    </span>
                  </button>

                  {/* Share/Repost Button */}
                  <button
                    className={`action-btn vertical ${
                      post.reposted ? "active" : ""
                    }`}
                    onClick={() => handleRepost(post.id)}
                  >
                    <div className="action-icon">
                      <ShareIcon />
                    </div>
                    <span className="action-count">
                      {formatCount(post.reposts_count || 0)}
                    </span>
                  </button>

                  {/* Save Button */}
                  <button
                    className={`action-btn vertical ${
                      post.saved ? "active" : ""
                    }`}
                    onClick={() => handleSave(post.id)}
                  >
                    <div className="action-icon">
                      <SaveIcon filled={post.saved} />
                    </div>
                    <span className="action-count">
                      {formatCount(post.saves_count || 0)}
                    </span>
                  </button>

                  {/* Music Cover */}
                  {post.music && (
                    <div className="music-cover">
                      <div
                        className={`cover-spinner ${
                          playingMusic === post.id ? "spinning" : ""
                        }`}
                      >
                        <img
                          src={
                            post.music.cover ||
                            post.user?.avatar ||
                            "/default-avatar.png"
                          }
                          alt="Music cover"
                          onClick={() => toggleMusicPlay(post.id)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Video Info Section */}
            <div className="video-info">
              <div className="info-content">
                {/* Username and Follow */}
                <div className="username-section">
                  <span
                    className="username"
                    onClick={() => handleProfileClick(post.user?.id)}
                    style={{ cursor: "pointer" }}
                  >
                    @{post.user?.username}
                  </span>

                  {post.user?.id !== currentUser?.id && (
                    <button
                      className="follow-btn"
                      onClick={() => handleFollowToggle(post.user?.id)}
                    >
                      {followedUsers.includes(post.user?.id)
                        ? "Unfollow"
                        : "Follow"}
                    </button>
                  )}
                </div>

                {/* Title */}
                {post.title && <p className="video-title">{post.title}</p>}

                {/* Description */}
                {post.description && (
                  <p className="video-caption">{post.description}</p>
                )}

                {/* Hashtags */}
                {post.hashtags && post.hashtags.length > 0 && (
                  <div className="hashtags">
                    {post.hashtags.map((hashtag) => (
                      <span key={hashtag.id} className="hashtag">
                        #{hashtag.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Music Info */}
                {post.music && (
                  <div
                    className="music-info"
                    onClick={() => toggleMusicPlay(post.id)}
                  >
                    <MusicIcon />
                    <span className="music-name">
                      {post.music.music_name} · {post.music.singer}
                    </span>
                  </div>
                )}

                {/* Reposted By */}
                {post.reposted_by && (
                  <div className="reposted-by">
                    ↻ Reposted by @{post.reposted_by.username}
                  </div>
                )}
              </div>
            </div>

            {/* Comments Section */}
            {expandedComments[post.id] && (
              <div className="comments-section">
                <div className="comments-header">
                  <span>{post.comments_count || 0} comments</span>
                  <button
                    className="close-comments"
                    onClick={() => toggleComments(post.id)}
                  >
                    ×
                  </button>
                </div>

                {/* Comments List */}
                <div className="comments-list">
                  {post.comments?.map((comment) => (
                    <div key={comment.id} className="comment-item">
                      <img
                        src={comment.user?.avatar || "/default-avatar.png"}
                        alt={comment.user?.username}
                        className="comment-avatar"
                      />

                      <div className="comment-content">
                        <div className="comment-header">
                          <span className="comment-username">
                            @{comment.user?.username}
                          </span>
                          <span className="comment-time">
                            {formatTime(comment.created_at)}
                          </span>
                        </div>

                        {/* Comment Text or Edit Mode */}
                        {editingComment === comment.id ? (
                          <div className="comment-edit-mode">
                            <input
                              type="text"
                              defaultValue={comment.text}
                              className="comment-edit-input"
                              id={`edit-comment-${comment.id}`}
                            />
                            <button
                              className="edit-save-btn"
                              onClick={() => {
                                const input = document.getElementById(
                                  `edit-comment-${comment.id}`
                                );
                                handleCommentEdit(
                                  post.id,
                                  comment.id,
                                  input.value
                                );
                              }}
                            >
                              Save
                            </button>
                            <button
                              className="edit-cancel-btn"
                              onClick={() => setEditingComment(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <p className="comment-text">{comment.text}</p>
                        )}

                        {/* Comment Actions */}
                        <div className="comment-actions">
                          <button
                            className={`comment-action-btn ${
                              comment.likes?.some(
                                (like) => like.user === currentUser?.id
                              )
                                ? "active"
                                : ""
                            }`}
                            onClick={() =>
                              handleCommentLike(comment.id, post.id)
                            }
                          >
                            ♥ {formatCount(comment.likes_count || 0)}
                          </button>
                          <button
                            className={`comment-action-btn ${
                              comment.dislikes?.some(
                                (dislike) => dislike.user === currentUser?.id
                              )
                                ? "active"
                                : ""
                            }`}
                            onClick={() =>
                              handleCommentDislike(comment.id, post.id)
                            }
                          >
                            ♡ {formatCount(comment.dislikes_count || 0)}
                          </button>
                          <button
                            className="comment-action-btn"
                            onClick={() => toggleReplies(comment.id)} // only for reply input
                          >
                            Reply
                          </button>

                          {comment.user?.id === currentUser?.id && (
                            <>
                              <button
                                className="comment-action-btn"
                                onClick={() => setEditingComment(comment.id)}
                              >
                                Edit
                              </button>
                              <button
                                className="comment-action-btn delete"
                                onClick={() =>
                                  handleCommentDelete(post.id, comment.id)
                                }
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>

                        {/* ✅ Replies always visible */}
                        <div className="replies-section">
                          {comment.replies && comment.replies.length > 0 ? (
                            <div className="replies-list">
                              {comment.replies.map((reply) => (
                                <div key={reply.id} className="reply-item">
                                  <img
                                    src={
                                      reply.user?.avatar ||
                                      "/default-avatar.png"
                                    }
                                    alt={reply.user?.username}
                                    className="reply-avatar"
                                  />
                                  <div className="reply-content">
                                    <div className="reply-header">
                                      <span className="reply-username">
                                        @{reply.user?.username}
                                      </span>
                                      <span className="reply-time">
                                        {formatTime(reply.created_at)}
                                      </span>
                                    </div>
                                    <p className="reply-text">{reply.text}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div></div>
                          )}

                          {/* ✳️ Optional: show reply input only when "Reply" clicked */}
                          {expandedReplies[comment.id] && (
                            <div className="reply-input-container">
                              <input
                                type="text"
                                placeholder="Write a reply..."
                                value={
                                  replyTexts[`${post.id}-${comment.id}`] || ""
                                }
                                onChange={(e) =>
                                  setReplyTexts({
                                    ...replyTexts,
                                    [`${post.id}-${comment.id}`]:
                                      e.target.value,
                                  })
                                }
                                onKeyPress={(e) =>
                                  e.key === "Enter" &&
                                  handleReplySubmit(post.id, comment.id)
                                }
                                className="reply-input"
                              />
                              <button
                                className={`post-reply-btn ${
                                  replyTexts[`${post.id}-${comment.id}`]?.trim()
                                    ? "active"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleReplySubmit(post.id, comment.id)
                                }
                              >
                                Reply
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Comment Input */}
                <div className="comment-input-container">
                  <img
                    src={currentUser?.avatar || "/default-avatar.png"}
                    alt="Your avatar"
                    className="comment-input-avatar"
                  />
                  <div className="comment-input-wrapper">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={commentTexts[post.id] || ""}
                      onChange={(e) =>
                        setCommentTexts({
                          ...commentTexts,
                          [post.id]: e.target.value,
                        })
                      }
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleCommentSubmit(post.id)
                      }
                      className="comment-input"
                    />
                    <button
                      className={`post-comment-btn ${
                        commentTexts[post.id]?.trim() ? "active" : ""
                      }`}
                      onClick={() => handleCommentSubmit(post.id)}
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Hidden Audio Element for Music */}
      {posts.map(
        (post) =>
          post.music && (
            <audio
              key={`audio-${post.id}`}
              ref={(el) => (audioRefs.current[post.id] = el)}
              src={post.music.audio_url}
              onEnded={() => setPlayingMusic(null)}
            />
          )
      )}
    </div>
  );
};

export default Home;
