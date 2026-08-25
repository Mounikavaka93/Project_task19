import { X } from "lucide-react";
import { useSocial } from "../context/SocialContext.jsx";
import PostCard from "./PostCard.jsx";

export default function PostModal({ postId, onClose }) {
  const { posts } = useSocial();
  const post = posts.find((p) => p.id === postId);
  if (!post) return null;

  return (
    <div className="modal-backdrop fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-0 md:p-6" onClick={onClose}>
      <button type="button" onClick={onClose} className="absolute right-4 top-4 z-10 text-white">
        <X size={28} />
      </button>
      <div
        onClick={(e) => e.stopPropagation()}
        className="modal-panel scroll-area h-full w-full bg-white md:h-auto md:max-h-[90vh] md:max-w-[520px] md:rounded-2xl"
      >
        <PostCard post={post} />
      </div>
    </div>
  );
}
