"use client";

import { useState, useEffect } from "react";
import { AuthAPI } from "../api/Api";
import "../styles/Inbox.css";
import { Send } from "react-bootstrap-icons";

const Inbox = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await AuthAPI.userList();
        setUsers(response.results || response);
        if (response.results && response.results.length > 0) {
          setSelectedUser(response.results[0]);
          // Load example messages for the first user
          loadExampleMessages(response.results[0]);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const loadExampleMessages = (user) => {
    // Example messages for demo
    const exampleMessages = [
      {
        id: 1,
        sender: "other",
        text: "Hey! How are you?",
        timestamp: "June 6, 2022 14:59",
        avatar: user.avatar || "/diverse-user-avatars.png",
      },
      {
        id: 2,
        sender: "me",
        text: "I'm doing great! How about you?",
        timestamp: "June 6, 2022 15:05",
        avatar: "/my-avatar.png",
      },
      {
        id: 3,
        sender: "other",
        media: user.avatar || "/video-thumbnail.png",
        timestamp: "June 6, 2022 16:15",
        avatar: user.avatar || "/diverse-user-avatars.png",
      },
    ];
    setMessages(exampleMessages);
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    loadExampleMessages(user);
  };

  const handleSendMessage = () => {
    if (messageText.trim()) {
      const newMessage = {
        id: messages.length + 1,
        sender: "me",
        text: messageText,
        timestamp: new Date().toLocaleString(),
        avatar: "/my-avatar.png",
      };
      setMessages([...messages, newMessage]);
      setMessageText("");
    }
  };

  if (loading) {
    return (
      <div className="inbox-loading">
        <div className="loading-spinner"></div>
        <span>Loading messages...</span>
      </div>
    );
  }

  return (
    <div className="inbox-container">
      {/* Left Sidebar - Messages List */}
      <div className="inbox-sidebar">
        <div className="sidebar-header">
          <h2>Messages</h2>
          <button className="settings-btn">⚙️</button>
        </div>

        <div className="messages-list">
          {users.map((user) => (
            <div
              key={user.id}
              className={`message-item ${
                selectedUser?.id === user.id ? "active" : ""
              }`}
              onClick={() => handleSelectUser(user)}
            >
              <img
                src={
                  user.avatar ||
                  "/placeholder.svg?height=48&width=48&query=user+avatar"
                }
                alt={user.username}
                className="message-avatar"
              />
              <div className="message-preview">
                <div className="message-username">{user.username}</div>
                <div className="message-text">Last message preview...</div>
              </div>
            </div>
          ))}
        </div>

        <div className="message-input-bottom">
          <input
            type="text"
            placeholder="Send a message..."
            className="message-input-field"
          />
        </div>
      </div>

      {/* Right Side - Chat Area */}
      <div className="inbox-chat">
        {selectedUser ? (
          <>
            <div className="chat-header">
              <img
                src={
                  selectedUser.avatar ||
                  "/placeholder.svg?height=40&width=40&query=user+avatar"
                }
                alt={selectedUser.username}
                className="chat-avatar"
              />
              <div className="chat-user-info">
                <h3>{selectedUser.username}</h3>
                <p>Active now</p>
              </div>
            </div>

            <div className="chat-messages">
              {messages.map((msg) => (
                <div key={msg.id} className={`message-bubble ${msg.sender}`}>
                  {msg.sender === "other" && (
                    <img
                      src={msg.avatar || "/placeholder.svg"}
                      alt="avatar"
                      className="bubble-avatar"
                    />
                  )}
                  <div className="bubble-content">
                    {msg.media ? (
                      <img
                        src={msg.media || "/placeholder.svg"}
                        alt="shared media"
                        className="message-media"
                      />
                    ) : (
                      <p>{msg.text}</p>
                    )}
                    <span className="message-time">{msg.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="chat-input-area">
              <input
                type="text"
                placeholder="Send a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className="chat-input"
              />{" "}
              <Send />
            </div>
          </>
        ) : (
          <div className="no-chat-selected">
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;
