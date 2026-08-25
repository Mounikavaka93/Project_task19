import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { SEED_CONVERSATIONS, SEED_NOTIFICATIONS, SEED_POSTS, SEED_STORIES } from "../data/seed.js";
import { uid } from "../utils/format.js";
import { useAuth } from "./AuthContext.jsx";

const SocialContext = createContext(null);
const STORE_KEY = "pulse_social_v4";

function loadStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const stored = JSON.parse(raw);
      const extraPosts = SEED_POSTS.filter((p) => !(stored.posts || []).some((x) => x.id === p.id));
      const extraStories = SEED_STORIES.filter((s) => !(stored.stories || []).some((x) => x.id === s.id));
      return {
        ...stored,
        posts: extraPosts.length ? [...extraPosts, ...(stored.posts || [])] : stored.posts,
        stories: extraStories.length ? [...extraStories, ...(stored.stories || [])] : stored.stories,
      };
    }
  } catch {
    /* ignore */
  }
  return {
    posts: SEED_POSTS,
    stories: SEED_STORIES,
    conversations: SEED_CONVERSATIONS,
    notifications: SEED_NOTIFICATIONS,
  };
}

export function SocialProvider({ children }) {
  const { currentUser, users } = useAuth();
  const [store, setStore] = useState(loadStore);
  const [toast, setToast] = useState("");

  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  }, [store]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(""), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  const value = useMemo(() => {
    const showToast = (msg) => setToast(msg);

    const createPost = ({ image, caption }) => {
      if (!currentUser) return { ok: false, error: "Sign in to post" };
      if (!image) return { ok: false, error: "Choose an image" };
      if (caption && caption.length > 2200) return { ok: false, error: "Caption is too long" };
      const post = {
        id: uid("p"),
        userId: currentUser.id,
        image,
        caption: (caption || "").trim(),
        location: "",
        likes: [],
        comments: [],
        createdAt: Date.now(),
      };
      setStore((s) => ({ ...s, posts: [post, ...s.posts] }));
      showToast("Post shared");
      return { ok: true };
    };

    const toggleLike = (postId) => {
      if (!currentUser) return;
      setStore((s) => ({
        ...s,
        posts: s.posts.map((p) => {
          if (p.id !== postId) return p;
          const liked = p.likes.includes(currentUser.id);
          return {
            ...p,
            likes: liked ? p.likes.filter((id) => id !== currentUser.id) : [...p.likes, currentUser.id],
          };
        }),
      }));
    };

    const addComment = (postId, text) => {
      if (!currentUser) return { ok: false };
      const trimmed = text.trim();
      if (!trimmed) return { ok: false, error: "Write a comment" };
      if (trimmed.length > 500) return { ok: false, error: "Comment is too long" };
      const comment = { id: uid("c"), userId: currentUser.id, text: trimmed, createdAt: Date.now() };
      setStore((s) => ({
        ...s,
        posts: s.posts.map((p) => (p.id === postId ? { ...p, comments: [...p.comments, comment] } : p)),
        notifications:
          s.posts.find((p) => p.id === postId)?.userId === currentUser.id
            ? s.notifications
            : [
                {
                  id: uid("n"),
                  type: "comment",
                  actorId: currentUser.id,
                  postId,
                  text: `commented: ${trimmed.slice(0, 48)}`,
                  read: false,
                  createdAt: Date.now(),
                },
                ...s.notifications,
              ],
      }));
      return { ok: true };
    };

    const sendMessage = (conversationId, text) => {
      if (!currentUser) return { ok: false };
      const trimmed = text.trim();
      if (!trimmed) return { ok: false, error: "Message cannot be empty" };
      const message = { id: uid("msg"), senderId: currentUser.id, text: trimmed, createdAt: Date.now() };
      setStore((s) => ({
        ...s,
        conversations: s.conversations.map((c) =>
          c.id === conversationId ? { ...c, messages: [...c.messages, message] } : c
        ),
      }));
      return { ok: true };
    };

    const startConversation = (otherId) => {
      if (!currentUser || currentUser.id === otherId) return null;
      const existing = store.conversations.find(
        (c) => c.participants.includes(currentUser.id) && c.participants.includes(otherId)
      );
      if (existing) return existing.id;
      const id = uid("m");
      setStore((s) => ({
        ...s,
        conversations: [{ id, participants: [currentUser.id, otherId], messages: [] }, ...s.conversations],
      }));
      return id;
    };

    const markAllRead = () => {
      setStore((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) }));
    };

    const addStory = (image) => {
      if (!currentUser || !image) return { ok: false };
      setStore((s) => ({
        ...s,
        stories: [{ id: uid("s"), userId: currentUser.id, image, createdAt: Date.now() }, ...s.stories],
      }));
      showToast("Story added");
      return { ok: true };
    };

    const myConversations = currentUser
      ? store.conversations.filter((c) => c.participants.includes(currentUser.id))
      : [];

    const unreadCount = store.notifications.filter((n) => !n.read).length;

    return {
      posts: [...store.posts].sort((a, b) => b.createdAt - a.createdAt),
      stories: store.stories,
      conversations: myConversations,
      allConversations: store.conversations,
      notifications: store.notifications,
      unreadCount,
      toast,
      showToast,
      createPost,
      toggleLike,
      addComment,
      sendMessage,
      startConversation,
      markAllRead,
      addStory,
      users,
    };
  }, [store, currentUser, users, toast]);

  return <SocialContext.Provider value={value}>{children}</SocialContext.Provider>;
}

export function useSocial() {
  const ctx = useContext(SocialContext);
  if (!ctx) throw new Error("useSocial must be used within SocialProvider");
  return ctx;
}
