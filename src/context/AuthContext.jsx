import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { SEED_USERS } from "../data/seed.js";
import { isValidEmail, isValidUsername, uid } from "../utils/format.js";

const AuthContext = createContext(null);
const USERS_KEY = "pulse_users_v3";
const SESSION_KEY = "pulse_session";

function applyProfileIdentity(users) {
  return users.map((u) => {
    const seed = SEED_USERS.find((s) => s.id === u.id);
    if (!seed) return u;
    if (u.id === "u1") {
      const keepUploaded = String(u.avatar || "").startsWith("data:");
      return {
        ...u,
        name: seed.name,
        username: seed.username,
        avatar: keepUploaded ? u.avatar : seed.avatar,
      };
    }
    return {
      ...u,
      name: seed.name,
      username: seed.username,
      bio: seed.bio,
      location: seed.location,
      cover: seed.cover,
      avatar: seed.avatar,
    };
  });
}

function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) {
      const stored = applyProfileIdentity(JSON.parse(raw));
      const extra = SEED_USERS.filter((s) => !stored.some((u) => u.id === s.id));
      return extra.length ? [...stored, ...extra] : stored;
    }
  } catch {
    /* ignore */
  }
  localStorage.setItem(USERS_KEY, JSON.stringify(SEED_USERS));
  return SEED_USERS;
}

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(loadUsers);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const id = localStorage.getItem(SESSION_KEY);
      const list = loadUsers();
      return list.find((u) => u.id === id) || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) localStorage.setItem(SESSION_KEY, currentUser.id);
    else localStorage.removeItem(SESSION_KEY);
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const fresh = users.find((u) => u.id === currentUser.id);
    if (fresh && JSON.stringify(fresh) !== JSON.stringify(currentUser)) {
      setCurrentUser(fresh);
    }
  }, [users, currentUser]);

  const value = useMemo(() => {
    const getUser = (idOrUsername) =>
      users.find((u) => u.id === idOrUsername || u.username === idOrUsername);

    const login = ({ email, password }) => {
      const errors = {};
      if (!email?.trim()) errors.email = "Email is required";
      else if (!isValidEmail(email)) errors.email = "Enter a valid email";
      if (!password) errors.password = "Password is required";
      else if (password.length < 6) errors.password = "At least 6 characters";
      if (Object.keys(errors).length) return { ok: false, errors };

      const user = users.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
      );
      if (!user) return { ok: false, errors: { form: "Email or password is incorrect" } };
      setCurrentUser(user);
      return { ok: true };
    };

    const signup = ({ name, username, email, password, confirm }) => {
      const errors = {};
      if (!name?.trim() || name.trim().length < 2) errors.name = "Enter your full name";
      if (!username?.trim()) errors.username = "Username is required";
      else if (!isValidUsername(username)) errors.username = "3–20 letters, numbers, . or _";
      if (!email?.trim()) errors.email = "Email is required";
      else if (!isValidEmail(email)) errors.email = "Enter a valid email";
      if (!password) errors.password = "Password is required";
      else if (password.length < 6) errors.password = "At least 6 characters";
      if (password !== confirm) errors.confirm = "Passwords do not match";
      if (users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
        errors.email = "Email is already in use";
      }
      if (users.some((u) => u.username.toLowerCase() === username.trim().toLowerCase())) {
        errors.username = "Username is taken";
      }
      if (Object.keys(errors).length) return { ok: false, errors };

      const user = {
        id: uid("u"),
        name: name.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        password,
        bio: "New on Pulse.",
        website: "",
        location: "",
        avatar: `https://i.pravatar.cc/200?u=${encodeURIComponent(email)}`,
        cover: "https://picsum.photos/id/1043/1400/420",
        followers: [],
        following: ["u1", "u2"],
        saved: [],
      };
      setUsers((prev) => [...prev, user]);
      setCurrentUser(user);
      return { ok: true };
    };

    const logout = () => setCurrentUser(null);

    const updateProfile = (patch) => {
      if (!currentUser) return { ok: false, errors: { form: "Not signed in" } };
      const errors = {};
      if (patch.name !== undefined && (!patch.name.trim() || patch.name.trim().length < 2)) {
        errors.name = "Enter your full name";
      }
      if (patch.username !== undefined) {
        if (!isValidUsername(patch.username)) errors.username = "3–20 letters, numbers, . or _";
        else if (
          users.some(
            (u) => u.id !== currentUser.id && u.username.toLowerCase() === patch.username.trim().toLowerCase()
          )
        ) {
          errors.username = "Username is taken";
        }
      }
      if (patch.email !== undefined) {
        if (!isValidEmail(patch.email)) errors.email = "Enter a valid email";
        else if (
          users.some(
            (u) => u.id !== currentUser.id && u.email.toLowerCase() === patch.email.trim().toLowerCase()
          )
        ) {
          errors.email = "Email is already in use";
        }
      }
      if (patch.password) {
        if (patch.password.length < 6) errors.password = "At least 6 characters";
        if (patch.password !== patch.confirm) errors.confirm = "Passwords do not match";
      }
      if (Object.keys(errors).length) return { ok: false, errors };

      const next = {
        ...currentUser,
        ...patch,
        name: patch.name !== undefined ? patch.name.trim() : currentUser.name,
        username: patch.username !== undefined ? patch.username.trim().toLowerCase() : currentUser.username,
        email: patch.email !== undefined ? patch.email.trim().toLowerCase() : currentUser.email,
        bio: patch.bio !== undefined ? patch.bio : currentUser.bio,
        website: patch.website !== undefined ? patch.website : currentUser.website,
        location: patch.location !== undefined ? patch.location : currentUser.location,
        avatar: patch.avatar !== undefined ? patch.avatar : currentUser.avatar,
      };
      delete next.confirm;
      if (!patch.password) delete next.password;
      else next.password = patch.password;

      setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? { ...u, ...next } : u)));
      return { ok: true };
    };

    const toggleFollow = (targetId) => {
      if (!currentUser || currentUser.id === targetId) return;
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === currentUser.id) {
            const following = u.following.includes(targetId)
              ? u.following.filter((id) => id !== targetId)
              : [...u.following, targetId];
            return { ...u, following };
          }
          if (u.id === targetId) {
            const followers = u.followers.includes(currentUser.id)
              ? u.followers.filter((id) => id !== currentUser.id)
              : [...u.followers, currentUser.id];
            return { ...u, followers };
          }
          return u;
        })
      );
    };

    const toggleSave = (postId) => {
      if (!currentUser) return;
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id !== currentUser.id) return u;
          const saved = u.saved.includes(postId)
            ? u.saved.filter((id) => id !== postId)
            : [...u.saved, postId];
          return { ...u, saved };
        })
      );
    };

    return {
      users,
      currentUser,
      login,
      signup,
      logout,
      updateProfile,
      getUser,
      toggleFollow,
      toggleSave,
    };
  }, [users, currentUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
