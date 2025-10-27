"use client";

import { useState, useRef } from "react";
import { PostsAPI, makePostForm } from "../api/Api";
import "../styles/Upload.css";

const Upload = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [musicId, setMusicId] = useState(null);
  const [hashtags, setHashtags] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target.result);
      };
      reader.readAsDataURL(selectedFile);
      setError("");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target.result);
      };
      reader.readAsDataURL(droppedFile);
      setError("");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a video file");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a title");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const hashtagArray = hashtags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const formData = makePostForm({
        file,
        title,
        description,
        music_id: musicId,
        hashtag_ids: hashtagArray,
      });

      const response = await PostsAPI.create(formData);
      setSuccess(true);
      setFile(null);
      setPreview(null);
      setTitle("");
      setDescription("");
      setMusicId(null);
      setHashtags("");

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err.message || "Failed to upload video");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-header">
        <h1>Upload Video</h1>
        <p>Share your creativity with the world</p>
      </div>

      <div className="upload-content">
        <div className="upload-left">
          <div
            className="upload-area"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            {preview ? (
              <div className="preview-container">
                <video src={preview} controls className="preview-video" />
                <button
                  className="change-video-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  Change Video
                </button>
              </div>
            ) : (
              <div className="upload-placeholder">
                <div className="upload-icon">
                  <svg
                    width="60"
                    height="60"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
                <h2>Select video to upload</h2>
                <p>Or drag and drop a file</p>
                <p className="file-info">MP4, WebM or Ogg</p>
                <p className="file-info">Max 10 GB</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />
          </div>
        </div>

        <div className="upload-right">
          <form onSubmit={handleUpload} className="upload-form">
            <div className="form-group">
              <label htmlFor="title">Title *</label>
              <input
                id="title"
                type="text"
                placeholder="Catchy title for your video"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength="150"
                className="form-input"
              />
              <span className="char-count">{title.length}/150</span>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                placeholder="Tell viewers more about your video"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength="2200"
                className="form-textarea"
                rows="4"
              />
              <span className="char-count">{description.length}/2200</span>
            </div>

            <div className="form-group">
              <label htmlFor="hashtags">Hashtags</label>
              <input
                id="hashtags"
                type="text"
                placeholder="Add hashtags separated by commas"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                className="form-input"
              />
              <p className="help-text">
                Separate multiple hashtags with commas
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="music">Music (Optional)</label>
              <input
                id="music"
                type="text"
                placeholder="Enter music ID"
                value={musicId || ""}
                onChange={(e) => setMusicId(e.target.value || null)}
                className="form-input"
              />
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && (
              <div className="success-message">
                ✓ Video uploaded successfully!
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !file}
              className="submit-btn"
            >
              {loading ? "Uploading..." : "Post"}
            </button>

            <p className="terms-text">
              By posting, you agree to our Terms of Service and confirm you have
              the right to share this content.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Upload;
