"use client";

import { useState } from "react";
import "../styles/Notifications.css";

const Notifications = () => {
  const [activeTab, setActiveTab] = useState("activities");
  const [activityFilter, setActivityFilter] = useState("all");

  // Mock data for notifications
  const activities = [
    {
      id: 1,
      type: "like",
      user: "sarah_chen",
      avatar: "/diverse-user-avatars.png",
      action: "liked your video",
      time: "2 hours ago",
      videoThumb: "/video-thumbnail.png",
    },
    {
      id: 2,
      type: "comment",
      user: "alex_kumar",
      avatar: "/diverse-user-avatars.png",
      action: "commented on your video",
      comment: "This is amazing! 🔥",
      time: "4 hours ago",
      videoThumb: "/video-thumbnail.png",
    },
    {
      id: 3,
      type: "follow",
      user: "emma_wilson",
      avatar: "/diverse-user-avatars.png",
      action: "followed you",
      time: "1 day ago",
    },
    {
      id: 4,
      type: "like",
      user: "mike_johnson",
      avatar: "/diverse-user-avatars.png",
      action: "liked your video",
      time: "1 day ago",
      videoThumb: "/video-thumbnail.png",
    },
    {
      id: 5,
      type: "mention",
      user: "lisa_park",
      avatar: "/diverse-user-avatars.png",
      action: "mentioned you in a comment",
      comment: "@yourname check this out!",
      time: "2 days ago",
      videoThumb: "/video-thumbnail.png",
    },
  ];

  const messages = [
    {
      id: 1,
      user: "john_doe",
      avatar: "/diverse-user-avatars.png",
      lastMessage: "Hey! How are you doing?",
      time: "5 min ago",
      unread: true,
    },
    {
      id: 2,
      user: "jane_smith",
      avatar: "/diverse-user-avatars.png",
      lastMessage: "Thanks for the collab!",
      time: "1 hour ago",
      unread: false,
    },
    {
      id: 3,
      user: "new_follower",
      avatar: "/diverse-user-avatars.png",
      lastMessage: "New follower",
      time: "3 hours ago",
      isFollower: true,
      unread: false,
    },
  ];

  const filteredActivities = activities.filter((activity) => {
    if (activityFilter === "all") return true;
    return activity.type === activityFilter;
  });

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h1>Notifications</h1>
      </div>

      <div className="notifications-tabs">
        <button
          className={`tab ${activeTab === "activities" ? "active" : ""}`}
          onClick={() => setActiveTab("activities")}
        >
          Activities
        </button>
        <button
          className={`tab ${activeTab === "messages" ? "active" : ""}`}
          onClick={() => setActiveTab("messages")}
        >
          Messages
        </button>
      </div>

      {activeTab === "activities" && (
        <div className="activities-section">
          <div className="filter-buttons">
            <button
              className={`filter-btn ${
                activityFilter === "all" ? "active" : ""
              }`}
              onClick={() => setActivityFilter("all")}
            >
              All activity
            </button>
            <button
              className={`filter-btn ${
                activityFilter === "like" ? "active" : ""
              }`}
              onClick={() => setActivityFilter("like")}
            >
              Likes
            </button>
            <button
              className={`filter-btn ${
                activityFilter === "comment" ? "active" : ""
              }`}
              onClick={() => setActivityFilter("comment")}
            >
              Comments
            </button>
            <button
              className={`filter-btn ${
                activityFilter === "follow" ? "active" : ""
              }`}
              onClick={() => setActivityFilter("follow")}
            >
              Followers
            </button>
            <button
              className={`filter-btn ${
                activityFilter === "mention" ? "active" : ""
              }`}
              onClick={() => setActivityFilter("mention")}
            >
              Mentions
            </button>
          </div>

          <div className="activities-list">
            {filteredActivities.length > 0 ? (
              filteredActivities.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <img
                    src={activity.avatar || "/placeholder.svg"}
                    alt={activity.user}
                    className="activity-avatar"
                  />
                  <div className="activity-content">
                    <div className="activity-text">
                      <span className="activity-user">{activity.user}</span>
                      <span className="activity-action">{activity.action}</span>
                    </div>
                    {activity.comment && (
                      <div className="activity-comment">
                        "{activity.comment}"
                      </div>
                    )}
                    <div className="activity-time">{activity.time}</div>
                  </div>
                  {activity.videoThumb && (
                    <img
                      src={activity.videoThumb || "/placeholder.svg"}
                      alt="video"
                      className="activity-video-thumb"
                    />
                  )}
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No notifications yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "messages" && (
        <div className="messages-section">
          <div className="messages-list">
            {messages.length > 0 ? (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`message-item ${message.unread ? "unread" : ""}`}
                >
                  <img
                    src={message.avatar || "/placeholder.svg"}
                    alt={message.user}
                    className="message-avatar"
                  />
                  <div className="message-content">
                    <div className="message-header">
                      <span className="message-user">{message.user}</span>
                      <span className="message-time">{message.time}</span>
                    </div>
                    <div className="message-text">
                      {message.isFollower ? (
                        <span className="follower-badge">New follower</span>
                      ) : (
                        message.lastMessage
                      )}
                    </div>
                  </div>
                  {message.unread && <div className="unread-dot"></div>}
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No messages yet</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
