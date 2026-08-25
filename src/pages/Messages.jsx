import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Send } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useSocial } from "../context/SocialContext.jsx";
import { timeAgo } from "../utils/format.js";

export default function Messages() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, getUser } = useAuth();
  const { conversations, sendMessage } = useSocial();
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  const active = conversations.find((c) => c.id === id) || conversations[0];

  useEffect(() => {
    if (id || !conversations[0]) return;
    if (typeof window !== "undefined" && window.innerWidth < 768) return;
    navigate(`/messages/${conversations[0].id}`, { replace: true });
  }, [id, conversations, navigate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [active?.id, active?.messages.length]);

  const other = useMemo(() => {
    if (!active) return null;
    const oid = active.participants.find((p) => p !== currentUser.id);
    return getUser(oid);
  }, [active, currentUser.id, getUser]);

  const onSend = (e) => {
    e.preventDefault();
    if (!active) return;
    const result = sendMessage(active.id, draft);
    if (!result.ok) {
      setError(result.error || "Could not send");
      return;
    }
    setDraft("");
    setError("");
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-white">
      <div className={`${id ? "hidden md:flex" : "flex"} h-full w-full shrink-0 flex-col border-r border-ig-line md:w-[300px] xl:w-[350px]`}>
        <div className="flex h-[60px] items-center px-5">
          <h1 className="truncate text-xl font-bold">{currentUser.username}</h1>
        </div>
        <div className="scroll-area min-h-0 flex-1">
          {conversations.map((c) => {
            const oid = c.participants.find((p) => p !== currentUser.id);
            const u = getUser(oid);
            if (!u) return null;
            const last = c.messages[c.messages.length - 1];
            const selected = active?.id === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => navigate(`/messages/${c.id}`)}
                className={`flex w-full items-center gap-3 px-5 py-3 text-left ${selected ? "bg-ig-hover" : "hover:bg-ig-hover"}`}
              >
                <img src={u.avatar} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{u.name}</p>
                    {last ? <span className="shrink-0 text-[11px] text-ig-muted">{timeAgo(last.createdAt)}</span> : null}
                  </div>
                  <p className="truncate text-sm text-ig-muted">{last?.text || "No messages yet"}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className={`${id ? "flex" : "hidden md:flex"} min-w-0 flex-1 flex-col`}>
        {active && other ? (
          <>
            <div className="flex h-[60px] items-center gap-3 border-b border-ig-line px-3 md:px-5">
              <button type="button" className="grid h-9 w-9 place-items-center md:hidden" onClick={() => navigate("/messages")}>
                <ChevronLeft size={22} />
              </button>
              <Link to={`/profile/${other.username}`} className="flex min-w-0 items-center gap-3">
                <img src={other.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold leading-4">{other.name}</p>
                  <p className="truncate text-xs text-ig-muted">@{other.username}</p>
                </div>
              </Link>
            </div>
            <div className="scroll-area min-h-0 flex-1 px-4 py-4">
              <div className="flex flex-col gap-2">
                {active.messages.map((m) => {
                  const mine = m.senderId === currentUser.id;
                  return (
                    <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] rounded-[22px] px-4 py-2 text-sm leading-5 md:max-w-[75%] ${
                          mine ? "bg-[#3797f0] text-white" : "bg-[#efefef] text-ig-text"
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
            </div>
            <form onSubmit={onSend} className="shrink-0 p-3 md:p-4">
              <div className="flex items-center gap-2 rounded-full border border-ig-border px-4">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Message..."
                  className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none"
                />
                <button type="submit" disabled={!draft.trim()} className="text-ig-blue disabled:opacity-40">
                  <Send size={18} />
                </button>
              </div>
              {error ? <p className="px-3 pt-1 text-xs text-ig-red">{error}</p> : null}
            </form>
          </>
        ) : (
          <div className="grid h-full place-items-center text-sm text-ig-muted">Select a conversation</div>
        )}
      </div>
    </div>
  );
}
