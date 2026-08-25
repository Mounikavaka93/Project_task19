import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useSocial } from "../context/SocialContext.jsx";

export default function StoryViewer({ startUserId, onClose }) {
  const { getUser, currentUser } = useAuth();
  const { stories } = useSocial();

  const groups = useMemo(() => {
    const map = new Map();
    stories.forEach((s) => {
      if (!map.has(s.userId)) map.set(s.userId, []);
      map.get(s.userId).push(s);
    });
    return [...map.entries()]
      .filter(([id]) => id !== currentUser.id)
      .map(([userId, items]) => ({ userId, items }));
  }, [stories, currentUser.id]);

  const startIndex = Math.max(
    0,
    groups.findIndex((g) => g.userId === startUserId)
  );
  const [gIndex, setGIndex] = useState(startIndex);
  const [sIndex, setSIndex] = useState(0);
  const [tick, setTick] = useState(0);

  const group = groups[gIndex];
  const story = group?.items[sIndex];
  const user = group ? getUser(group.userId) : null;

  useEffect(() => {
    if (!story) return undefined;
    const t = setTimeout(() => {
      next();
    }, 5000);
    return () => clearTimeout(t);
  }, [gIndex, sIndex, tick]);

  const next = () => {
    if (!group) return onClose();
    if (sIndex < group.items.length - 1) {
      setSIndex((i) => i + 1);
      setTick((n) => n + 1);
      return;
    }
    if (gIndex < groups.length - 1) {
      setGIndex((i) => i + 1);
      setSIndex(0);
      setTick((n) => n + 1);
      return;
    }
    onClose();
  };

  const prev = () => {
    if (sIndex > 0) {
      setSIndex((i) => i - 1);
      setTick((n) => n + 1);
      return;
    }
    if (gIndex > 0) {
      const prevG = groups[gIndex - 1];
      setGIndex((i) => i - 1);
      setSIndex(prevG.items.length - 1);
      setTick((n) => n + 1);
    }
  };

  if (!story || !user) return null;

  return (
    <div className="modal-backdrop fixed inset-0 z-[75] flex items-center justify-center bg-black">
      <button type="button" onClick={onClose} className="absolute right-4 top-4 z-10 text-white">
        <X size={28} />
      </button>

      <button
        type="button"
        onClick={prev}
        className="absolute left-2 z-10 hidden rounded-full bg-white/10 p-2 text-white md:block"
      >
        <ChevronLeft />
      </button>
      <button
        type="button"
        onClick={next}
        className="absolute right-2 z-10 hidden rounded-full bg-white/10 p-2 text-white md:block"
      >
        <ChevronRight />
      </button>

      <div className="relative h-full w-full md:max-w-[420px]">
        <div className="absolute left-0 right-0 top-0 z-10 flex gap-1 p-3">
          {group.items.map((item, i) => (
            <div key={item.id} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30">
              {i < sIndex ? <div className="h-full w-full bg-white" /> : null}
              {i === sIndex ? <div key={tick} className="story-progress h-full bg-white" /> : null}
            </div>
          ))}
        </div>
        <div className="absolute left-3 top-6 z-10 flex items-center gap-2 text-white">
          <img src={user.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
          <span className="text-sm font-semibold">{user.username}</span>
        </div>
        <img src={story.image} alt="" className="h-full w-full object-cover" />
        <button type="button" className="absolute inset-y-0 left-0 w-1/3" onClick={prev} />
        <button type="button" className="absolute inset-y-0 right-0 w-1/3" onClick={next} />
      </div>
    </div>
  );
}
