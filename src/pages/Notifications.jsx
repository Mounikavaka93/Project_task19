import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useSocial } from "../context/SocialContext.jsx";
import { timeAgo } from "../utils/format.js";

const tabs = ["all", "like", "comment", "follow"];

export default function Notifications() {
  const { notifications, markAllRead } = useSocial();
  const { getUser } = useAuth();
  const [tab, setTab] = useState("all");

  const list = useMemo(
    () => (tab === "all" ? notifications : notifications.filter((n) => n.type === tab)),
    [notifications, tab]
  );

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-white">
      <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-ig-line px-4 md:px-6">
        <h1 className="text-xl font-semibold">Notifications</h1>
        <button type="button" onClick={markAllRead} className="text-sm font-semibold text-ig-blue">
          Mark all read
        </button>
      </div>
      <div className="scroll-x flex shrink-0 gap-1 border-b border-ig-line px-3 py-2">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full px-3 py-1.5 text-sm capitalize ${
              tab === t ? "bg-ink-900 font-semibold text-white" : "bg-zinc-100 text-ink-600"
            }`}
          >
            {t === "all" ? "All" : `${t}s`}
          </button>
        ))}
      </div>
      <div className="scroll-area min-h-0 flex-1">
        {list.length === 0 ? (
          <p className="px-6 py-16 text-center text-sm text-ink-500">Nothing here yet.</p>
        ) : (
          list.map((n) => {
            const actor = getUser(n.actorId);
            if (!actor) return null;
            return (
              <Link
                key={n.id}
                to={n.postId ? `/explore?post=${n.postId}` : `/profile/${actor.username}`}
                className={`flex items-center gap-3 border-b border-zinc-100 px-4 py-3 ${n.read ? "bg-white" : "bg-sky-50"}`}
              >
                <span className="h-11 w-11 overflow-hidden rounded-full">
                  <img src={actor.avatar} alt="" className="h-full w-full object-cover" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-5">
                    <span className="font-semibold">{actor.username}</span> {n.text}
                  </p>
                  <p className="text-xs text-ink-400">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.read ? <span className="h-2 w-2 shrink-0 rounded-full bg-brand-500" /> : null}
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
