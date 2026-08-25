import { Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useSocial } from "../context/SocialContext.jsx";

export default function Stories({ onOpen, onAdd }) {
  const { currentUser, getUser } = useAuth();
  const { stories } = useSocial();

  const grouped = [];
  const seen = new Set();
  stories.forEach((s) => {
    if (seen.has(s.userId)) return;
    seen.add(s.userId);
    grouped.push({ userId: s.userId, items: stories.filter((x) => x.userId === s.userId) });
  });

  const mine = grouped.filter((g) => g.userId === currentUser.id);
  const others = grouped.filter((g) => g.userId !== currentUser.id);
  const ordered = [...mine, ...others];

  return (
    <div className="w-full border-b border-ig-line">
      <div className="scroll-x flex gap-3 px-3 py-3">
        <button type="button" onClick={onAdd} className="flex w-[66px] shrink-0 flex-col items-center gap-1">
          <span className="relative h-[66px] w-[66px]">
            <img src={currentUser.avatar} alt="" className="h-[66px] w-[66px] rounded-full object-cover p-[2px]" />
            <span className="absolute bottom-0 right-0 grid h-[18px] w-[18px] place-items-center rounded-full bg-ig-blue text-white ring-2 ring-white">
              <Plus size={11} strokeWidth={3} />
            </span>
          </span>
          <span className="w-full truncate text-center text-[12px] text-ig-text">Your story</span>
        </button>

        {ordered.map((g) => {
          const user = getUser(g.userId);
          if (!user || user.id === currentUser.id) return null;
          return (
            <button
              key={g.userId}
              type="button"
              onClick={() => onOpen(g.userId)}
              className="flex w-[66px] shrink-0 flex-col items-center gap-1 transition-transform hover:scale-[1.04]"
            >
              <span className="story-ring grid h-[66px] w-[66px] place-items-center rounded-full p-[2px]">
                <span className="grid h-full w-full place-items-center rounded-full bg-white p-[2px]">
                  <img src={user.avatar} alt="" className="h-full w-full rounded-full object-cover" />
                </span>
              </span>
              <span className="w-full truncate text-center text-[12px] text-ig-text">{user.username}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
