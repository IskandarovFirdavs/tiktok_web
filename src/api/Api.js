import axios from "axios";

const BASE = "http://localhost:8000";

// Token helpers
const tokenKey = "access_token";
const refreshKey = "refresh_token";

export const setTokens = ({ access, refresh }) => {
  if (access) localStorage.setItem(tokenKey, access);
  if (refresh) localStorage.setItem(refreshKey, refresh);
};

export const clearTokens = () => {
  localStorage.removeItem(tokenKey);
  localStorage.removeItem(refreshKey);
};

export const getAccess = () => localStorage.getItem(tokenKey);
export const getRefresh = () => localStorage.getItem(refreshKey);
export const isAuthenticated = () => !!getAccess();

async function request(
  path,
  { method = "GET", body = null, json = true, headers = {} } = {}
) {
  const access = getAccess();
  if (access) headers["Authorization"] = `Bearer ${access}`;

  const options = { method, headers };

  if (body instanceof FormData) {
    options.body = body;
  } else if (body && typeof body === "object") {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`${BASE}${path}`, options);

  // 🔄 Refresh token on 401
  if (res.status === 401 && getRefresh()) {
    const refreshed = await tryRefreshToken();
    if (refreshed) return request(path, { method, body, json, headers: {} });
    clearTokens();
    throw { status: 401, message: "Unauthorized" };
  }

  if (!res.ok) {
    const contentType = res.headers.get("content-type") || "";
    const message = await parseError(res, contentType);
    throw { status: res.status, message };
  }

  if (!json) return res;
  const contentType = res.headers.get("content-type") || "";
  return contentType.includes("application/json") ? res.json() : res.text();
}

async function parseError(res, ct) {
  try {
    if (ct.includes("application/json")) {
      const j = await res.json();
      return j.detail || JSON.stringify(j);
    } else {
      return await res.text();
    }
  } catch {
    return res.statusText || "Error";
  }
}

async function tryRefreshToken() {
  const refresh = getRefresh();
  if (!refresh) return false;
  try {
    const res = await fetch(`${BASE}/users/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (data.access) {
      setTokens({ access: data.access, refresh: data.refresh ?? refresh });
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/* ============================
   🔐 AUTHENTICATION & USERS
   ============================ */
export const AuthAPI = {
  login: async (username, password) => {
    const res = await request("/users/login/", {
      method: "POST",
      body: { username, password },
    });

    // 🔍 Token nomlarini moslash
    const access =
      res.access || res.access_token || res.token || res.key || null;
    const refresh = res.refresh || res.refresh_token || null;

    if (access) setTokens({ access, refresh });

    return res;
  },

  register: (userObj) => request("/users/", { method: "POST", body: userObj }),
  currentUser: () => request("/users/me/"),
  getUser: (id) => request(`/users/${id}/`),

  userList: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/users/${q ? "?" + q : ""}`);
  },
  followToggle: (userId) =>
    request(`/users/follow/${userId}/`, { method: "POST" }),

  updateProfile: (data) => request("/users/me/", { method: "PUT", body: data }),
  deleteAccount: () => request("/users/me/", { method: "DELETE", json: false }),
};

/* ============================
   📱 POSTS MANAGEMENT
   ============================ */
export const PostsAPI = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/posts/${qs ? "?" + qs : ""}`);
  },
  retrieve: (id) => request(`/posts/${id}/`), // Make sure this endpoint exists
  create: (formData) => request("/posts/", { method: "POST", body: formData }),
  update: (id, data) =>
    request(`/posts/${id}/`, { method: "PATCH", body: data }),
  delete: (id) => request(`/posts/${id}/`, { method: "DELETE", json: false }),
  likeToggle: (postId) =>
    request("/posts/likes/", { method: "POST", body: { post: postId } }),

  viewCreate: (postId) =>
    request("/views/", { method: "POST", body: { post: postId } }).catch(
      () => null
    ),
  getReposts: async (postId) => {
    try {
      const response = await request(`/posts/${postId}/reposts/`);
      return response;
    } catch (error) {
      console.error("Error fetching reposts:", error);
      // Fallback - bo'sh array qaytar
      return { reposts: [] };
    }
  },
};

/* ============================
   🏷️ HASHTAGS & MUSIC
   ============================ */
export const HashtagAPI = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/hashtags/${q ? "?" + q : ""}`);
  },
};

export const MusicAPI = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/musics/${q ? "?" + q : ""}`);
  },
  upload: (formData) => request("/musics/", { method: "POST", body: formData }),
};

/* ============================
   💬 COMMENTS SYSTEM
   ============================ */
export const CommentAPI = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/posts/comments/${q ? "?" + q : ""}`);
  },
  create: (postId, text) =>
    request("/posts/comments/", {
      method: "POST",
      body: { post: postId, text },
    }),
  update: (id, data) =>
    request(`/posts/comments/${id}/`, { method: "PATCH", body: data }),
  delete: (id) =>
    request(`/posts/comments/${id}/`, { method: "DELETE", json: false }),
  likeToggle: (id) =>
    request("/posts/comment_likes/", { method: "POST", body: { comment: id } }),
  dislikeToggle: (id) =>
    request("/posts/comment_dislikes/", {
      method: "POST",
      body: { comment: id },
    }),
};

/* ============================
   🔄 REPLIES SYSTEM
   ============================ */
export const ReplyAPI = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/posts/reply_comments/${q ? "?" + q : ""}`);
  },
  create: (postId, commentId, text) =>
    request("/posts/reply_comments/", {
      method: "POST",
      body: {
        post: postId,
        comment: commentId,
        text: text,
      },
    }),
  update: (id, data) =>
    request(`/posts/reply_comments/${id}/`, { method: "PATCH", body: data }),
  delete: (id) =>
    request(`/posts/reply_comments/${id}/`, { method: "DELETE", json: false }),
  likeToggle: (replyId) =>
    request("/posts/reply_comment_likes/", {
      method: "POST",
      body: { reply_comment: replyId },
    }),
  dislikeToggle: (replyId) =>
    request("/posts/reply_comment_dislikes/", {
      method: "POST",
      body: { reply_comment: replyId },
    }),
};

/* ============================
   🚪 LOGOUT FUNCTION
   ============================ */
export const logoutUser = async () => {
  try {
    const access = getAccess();
    const refresh = getRefresh();
    if (!access || !refresh) return clearTokens();

    await axios.post(
      `${BASE}/users/logout/`,
      { refresh_token: refresh },
      {
        headers: {
          Authorization: `Bearer ${access}`,
          "Content-Type": "application/json",
        },
      }
    );

    clearTokens();
  } catch (e) {
    clearTokens();
    console.error("Logout error:", e);
  }
};

export const makePostForm = ({
  file,
  title,
  description,
  music_id = null,
  hashtag_ids = [],
}) => {
  const fd = new FormData();
  if (file) fd.append("post", file);
  if (title) fd.append("title", title);
  if (description) fd.append("description", description);
  if (music_id) fd.append("music_id", music_id);
  if (Array.isArray(hashtag_ids))
    hashtag_ids.forEach((h) => fd.append("hashtag_ids", h));
  return fd;
};

/* ============================
   🎭 GENRES LIST (POST GENRES)
   ============================ */
export const GenreAPI = {
  list: () => request("/posts/genres/"),
};
/* ============================
   💾 SAVE POSTS SYSTEM
   ============================ */
export const SaveAPI = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/posts/saves/${q ? "?" + q : ""}`);
  },
  create: (postId) =>
    request("/posts/saves/", {
      method: "POST",
      body: { post: postId },
    }),
  delete: (postId) =>
    request(`/posts/saves/${postId}/`, { method: "DELETE", json: false }),
  toggle: (postId) =>
    request("/posts/saves/", {
      method: "POST",
      body: { post: postId },
    }),
};

/* ============================
   🔄 REPOST SYSTEM
   ============================ */
export const RepostAPI = {
  toggle: (postId) =>
    request("/posts/reposts/", {
      method: "POST",
      body: { post: postId },
    }),
};

export default {
  AuthAPI,
  PostsAPI,
  HashtagAPI,
  MusicAPI,
  CommentAPI,
  ReplyAPI,
  GenreAPI,
  SaveAPI,
  RepostAPI,
  logoutUser,
  makePostForm,
  setTokens,
  clearTokens,
  getAccess,
  getRefresh,
  isAuthenticated,
};
