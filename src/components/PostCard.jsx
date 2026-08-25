import { useState } from "react";
import { Bookmark, Heart, MessageCircle, MoreHorizontal, Send } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useSocial } from "../context/SocialContext.jsx";
import { timeAgo } from "../utils/format.js";
import RichText from "./RichText.jsx";

export default function PostCard({ post }) {
  const { currentUser, getUser, toggleSave } = useAuth();
  const { toggleLike, addComment, startConversation } = useSocial();
  const navigate = useNavigate();
  const author = getUser(post.userId);
  const liked = post.likes.includes(currentUser.id);
  const saved = currentUser.saved?.includes(post.id);
  const [comment, setComment] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [pop, setPop] = useState(false);
  const [error, setError] = useState("");

  if (!author) return null;

  const onLike = () => {
    setPop(true);
    toggleLike(post.id);
    setTimeout(() => setPop(false), 350);
  };

  const onComment = (e) => {
    e.preventDefault();
    const result = addComment(post.id, comment);
    if (!result.ok) {
      setError(result.error || "Could not comment");
      return;
    }
    setComment("");
    setError("");
    setShowAll(true);
  };

  const visibleComments = showAll ? post.comments : post.comments.slice(-2);

  return (
    <article className="w-full border-b border-ig-line bg-white">
      <div className="flex h-[52px] items-center gap-3 px-3">
        <Link to={`/profile/${author.username}`} className="story-ring rounded-full p-[2px]">
          <span className="block rounded-full bg-white p-[1.5px]">
            <img src={author.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
          </span>
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 text-sm">
            <Link to={`/profile/${author.username}`} className="truncate font-semibold text-ig-text">
              {author.username}
            </Link>
            <span className="text-ig-muted">· {timeAgo(post.createdAt)}</span>
          </div>
          {post.location ? (
            <Link
              to={`/explore?q=${encodeURIComponent(post.location)}`}
              className="block truncate text-[12px] text-ig-text"
            >
              {post.location}
            </Link>
          ) : null}
        </div>
        <MoreHorizontal size={20} className="text-ig-text" />
      </div>

      <button type="button" className="block w-full" onDoubleClick={onLike}>
        <img src={post.image} alt={post.caption} className="aspect-square w-full object-cover" />
      </button>

      <div className="px-3 pb-3 pt-2">
        <div className="mb-2 flex items-center gap-[16px]">
          <button type="button" onClick={onLike} className={`hover:opacity-70 ${pop ? "like-pop" : ""}`}>
            <Heart size={24} className={liked ? "fill-ig-red text-ig-red" : "text-ig-text"} strokeWidth={1.8} />
          </button>
          <button type="button" onClick={() => setShowAll(true)} className="hover:opacity-70">
            <MessageCircle size={24} strokeWidth={1.8} />
          </button>
          {author.id !== currentUser.id ? (
            <button
              type="button"
              onClick={() => {
                const cid = startConversation(author.id);
                if (cid) navigate(`/messages/${cid}`);
              }}
            >
              <Send size={24} strokeWidth={1.8} />
            </button>
          ) : (
            <Send size={24} strokeWidth={1.8} className="opacity-40" />
          )}
          <button type="button" className="ml-auto" onClick={() => toggleSave(post.id)}>
            <Bookmark size={24} strokeWidth={1.8} className={saved ? "fill-ig-text text-ig-text" : ""} />
          </button>
        </div>

        <p className="text-sm font-semibold">{post.likes.length.toLocaleString()} likes</p>
        {post.caption ? (
          <p className="mt-1 text-sm leading-5">
            <Link to={`/profile/${author.username}`} className="font-semibold">
              {author.username}
            </Link>{" "}
            <RichText text={post.caption} />
          </p>
        ) : null}

        {post.comments.length > 2 && !showAll ? (
          <button type="button" onClick={() => setShowAll(true)} className="mt-1 text-sm text-ig-muted">
            View all {post.comments.length} comments
          </button>
        ) : null}

        <div className="mt-1 space-y-1">
          {visibleComments.map((c) => {
            const u = getUser(c.userId);
            if (!u) return null;
            return (
              <p key={c.id} className="text-sm leading-5">
                <Link to={`/profile/${u.username}`} className="font-semibold">
                  {u.username}
                </Link>{" "}
                <RichText text={c.text} />
              </p>
            );
          })}
        </div>

        <form onSubmit={onComment} className="mt-3 flex items-center gap-2 border-t border-ig-line pt-3">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-ig-muted"
            maxLength={500}
          />
          <button type="submit" disabled={!comment.trim()} className="text-sm font-semibold text-ig-blue disabled:opacity-40">
            Post
          </button>
        </form>
        {error ? <p className="mt-1 text-xs text-ig-red">{error}</p> : null}
      </div>
    </article>
  );
}
