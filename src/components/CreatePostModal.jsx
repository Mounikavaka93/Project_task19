import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { useSocial } from "../context/SocialContext.jsx";

export default function CreatePostModal({ onClose }) {
  const { createPost } = useSocial();
  const [image, setImage] = useState("");
  const [caption, setCaption] = useState("");
  const [error, setError] = useState("");
  const [drag, setDrag] = useState(false);
  const inputRef = useRef(null);

  const readFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose a JPG, PNG, or WEBP image");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImage(String(reader.result));
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const submit = (e) => {
    e.preventDefault();
    const result = createPost({ image, caption });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onClose();
  };

  return (
    <div className="modal-backdrop fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-0 md:p-6" onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="modal-panel flex h-full w-full flex-col overflow-hidden bg-white md:h-[min(680px,90vh)] md:max-w-[860px] md:rounded-2xl"
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 px-4">
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-zinc-100">
            <X size={20} />
          </button>
          <h2 className="text-sm font-semibold">Create new post</h2>
          <button
            type="submit"
            disabled={!image}
            className="text-sm font-semibold text-ig-blue disabled:opacity-40"
          >
            Share
          </button>
        </div>

        <div className="grid min-h-0 flex-1 md:grid-cols-[1.15fr_0.85fr]">
          <div
            className={`relative flex min-h-[240px] items-center justify-center bg-zinc-100 ${drag ? "ring-2 ring-inset ring-brand-500" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              readFile(e.dataTransfer.files?.[0]);
            }}
          >
            {image ? (
              <>
                <img src={image} alt="Preview" className="h-full w-full object-contain" />
                <button
                  type="button"
                  onClick={() => setImage("")}
                  className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white"
                >
                  Change
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex flex-col items-center gap-3 px-6 text-center"
              >
                <span className="grid h-16 w-16 place-items-center rounded-full bg-white text-ink-700 shadow-card">
                  <ImagePlus size={28} />
                </span>
                <span className="text-xl font-light">Drag photos and videos here</span>
                <span className="mt-1 rounded-lg bg-ig-blue px-4 py-1.5 text-sm font-semibold text-white">Select from computer</span>
              </button>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => readFile(e.target.files?.[0])}
            />
          </div>

          <div className="flex flex-col border-t border-zinc-200 p-4 md:border-l md:border-t-0">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={2200}
              rows={8}
              placeholder="Write a caption..."
              className="min-h-[140px] w-full resize-none bg-transparent text-[15px] outline-none"
            />
            <div className="mt-auto flex items-center justify-between pt-3 text-xs text-ink-400">
              <span>{caption.length}/2200</span>
              {error ? <span className="font-medium text-rose-600">{error}</span> : <span>Visible on your feed</span>}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
