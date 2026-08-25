import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function PeopleListModal({ title, userIds, onClose }) {
  const { currentUser, getUser, toggleFollow } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const people = useMemo(() => {
    const list = userIds.map((id) => getUser(id)).filter(Boolean);
    const term = q.trim().toLowerCase();
    if (!term) return list;
    return list.filter(
      (u) => u.name.toLowerCase().includes(term) || u.username.toLowerCase().includes(term)
    );
  }, [userIds, q, getUser]);

  return (
    <div className="modal-backdrop fixed inset-0 z-[70] flex items-end justify-center bg-black/50 md:items-center" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="modal-panel flex h-[min(640px,88vh)] w-full max-w-[420px] flex-col overflow-hidden rounded-t-2xl bg-white md:rounded-2xl"
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 px-4">
          <h2 className="text-sm font-bold">{title}</h2>
          <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full hover:bg-zinc-100">
            <X size={18} />
          </button>
        </div>
        <div className="shrink-0 px-3 py-2">
          <label className="flex h-10 items-center gap-2 rounded-xl bg-zinc-100 px-3">
            <Search size={16} className="text-ink-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search"
              className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
          </label>
        </div>
        <div className="scroll-area min-h-0 flex-1">
          {people.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-ink-500">No people to show.</p>
          ) : (
            people.map((u) => {
              const isMe = u.id === currentUser.id;
              const following = currentUser.following.includes(u.id);
              return (
                <div key={u.id} className="flex items-center gap-3 px-4 py-2.5">
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    onClick={() => {
                      onClose();
                      navigate(`/profile/${u.username}`);
                    }}
                  >
                    <img src={u.avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{u.username}</p>
                      <p className="truncate text-xs text-ink-500">{u.name}</p>
                    </div>
                  </button>
                  {!isMe ? (
                    <button
                      type="button"
                      onClick={() => toggleFollow(u.id)}
                        className={`h-8 shrink-0 rounded-lg px-3 text-xs font-semibold ${
                        following ? "bg-[#efefef] text-ig-text" : "bg-ig-blue text-white"
                      }`}
                    >
                      {following ? "Following" : "Follow"}
                    </button>
                  ) : (
                    <span className="text-xs font-medium text-ink-400">You</span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
