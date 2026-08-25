import { useEffect, useMemo, useState } from "react";
import { Hash, Heart, MapPin, MessageCircle, Search, UserRound, X } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useSocial } from "../context/SocialContext.jsx";
import PostModal from "../components/PostModal.jsx";
import { extractHashtags, normalizeQuery } from "../utils/format.js";

const RECENTS_KEY = "pulse_recent_searches";
const TABS = [
  { id: "top", label: "Top" },
  { id: "people", label: "People" },
  { id: "posts", label: "Posts" },
  { id: "tags", label: "Tags" },
  { id: "places", label: "Places" },
];

function loadRecents() {
  try {
    return JSON.parse(localStorage.getItem(RECENTS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveRecent(entry) {
  const prev = loadRecents().filter((r) => r.q.toLowerCase() !== entry.q.toLowerCase());
  localStorage.setItem(RECENTS_KEY, JSON.stringify([entry, ...prev].slice(0, 8)));
}

export default function Explore() {
  const { posts } = useSocial();
  const { users, currentUser, toggleFollow, getUser } = useAuth();
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const tab = TABS.some((t) => t.id === params.get("tab")) ? params.get("tab") : "top";
  const openPost = params.get("post");
  const [draft, setDraft] = useState(q);
  const [recents, setRecents] = useState(loadRecents);

  useEffect(() => setDraft(q), [q]);

  const setSearch = (nextQ, nextTab = tab, post = null) => {
    const next = new URLSearchParams();
    if (nextQ) next.set("q", nextQ);
    if (nextTab && nextTab !== "top") next.set("tab", nextTab);
    if (post) next.set("post", post);
    setParams(next, { replace: true });
  };

  const commitSearch = (value) => {
    const trimmed = value.trim();
    if (trimmed) {
      saveRecent({ q: trimmed, at: Date.now() });
      setRecents(loadRecents());
    }
    setSearch(trimmed, "top");
  };

  const term = normalizeQuery(q);

  const people = useMemo(() => {
    if (!term) return [];
    return users.filter((u) => {
      const blob = `${u.name} ${u.username} ${u.bio || ""} ${u.location || ""}`.toLowerCase();
      return blob.includes(term);
    });
  }, [users, term]);

  const matchedPosts = useMemo(() => {
    if (!term) return posts;
    return posts.filter((p) => {
      const author = users.find((u) => u.id === p.userId);
      const blob = `${p.caption || ""} ${p.location || ""} ${author?.name || ""} ${author?.username || ""}`.toLowerCase();
      const tags = extractHashtags(p.caption);
      return blob.includes(term) || tags.includes(term);
    });
  }, [posts, term, users]);

  const tags = useMemo(() => {
    const counts = new Map();
    posts.forEach((p) => {
      extractHashtags(p.caption).forEach((tag) => {
        counts.set(tag, (counts.get(tag) || 0) + 1);
      });
    });
    const all = [...counts.entries()]
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
    if (!term) return all.slice(0, 8);
    return all.filter((t) => t.tag.includes(term));
  }, [posts, term]);

  const places = useMemo(() => {
    const map = new Map();
    posts.forEach((p) => {
      if (!p.location) return;
      const key = p.location;
      if (!map.has(key)) map.set(key, { name: key, count: 0, posts: [] });
      const row = map.get(key);
      row.count += 1;
      row.posts.push(p.id);
    });
    const all = [...map.values()].sort((a, b) => b.count - a.count);
    if (!term) return all.slice(0, 6);
    return all.filter((p) => p.name.toLowerCase().includes(term));
  }, [posts, term]);

  const suggested = useMemo(
    () =>
      users
        .filter((u) => u.id !== currentUser.id && !currentUser.following.includes(u.id))
        .slice(0, 6),
    [users, currentUser]
  );

  const searching = Boolean(term);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-white">
      <div className="shrink-0 border-b border-zinc-200 px-4 py-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            commitSearch(draft);
          }}
          className="flex h-9 items-center gap-3 rounded-lg bg-[#efefef] px-4"
        >
          <Search size={18} className="shrink-0 text-ink-400" />
          <input
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setSearch(e.target.value, tab);
            }}
            placeholder="Search people, posts, tags, places"
            className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none"
            autoComplete="off"
          />
          {draft ? (
            <button
              type="button"
              onClick={() => {
                setDraft("");
                setSearch("", "top");
              }}
              className="text-ink-400"
            >
              <X size={16} />
            </button>
          ) : null}
        </form>
        {searching ? (
          <div className="scroll-x mt-3 flex gap-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSearch(q, t.id)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${
                  tab === t.id ? "bg-ink-900 font-semibold text-white" : "bg-zinc-100 text-ink-600"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="scroll-area min-h-0 flex-1">
        {!searching ? (
          <>
            {recents.length > 0 ? (
              <section className="border-b border-zinc-200 px-4 py-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-bold">Recent</p>
                  <button
                    type="button"
                    className="text-xs font-semibold text-brand-500"
                    onClick={() => {
                      localStorage.removeItem(RECENTS_KEY);
                      setRecents([]);
                    }}
                  >
                    Clear
                  </button>
                </div>
                {recents.map((r) => (
                  <button
                    key={r.q}
                    type="button"
                    onClick={() => commitSearch(r.q)}
                    className="flex w-full items-center gap-3 py-2 text-left"
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-zinc-100 text-ink-600">
                      <Search size={16} />
                    </span>
                    <span className="text-sm font-medium">{r.q}</span>
                  </button>
                ))}
              </section>
            ) : null}

            <section className="border-b border-zinc-200 px-4 py-3">
              <p className="mb-2 text-sm font-bold">Trending tags</p>
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => (
                  <button
                    key={t.tag}
                    type="button"
                    onClick={() => commitSearch(`#${t.tag}`)}
                    className="rounded-full bg-zinc-100 px-3 py-1.5 text-sm font-medium text-ink-800 hover:bg-zinc-200"
                  >
                    #{t.tag} · {t.count}
                  </button>
                ))}
              </div>
            </section>

            <section className="border-b border-zinc-200 px-4 py-3">
              <p className="mb-2 text-sm font-bold">Suggested people</p>
              {suggested.map((u) => (
                <PersonRow key={u.id} user={u} currentUser={currentUser} toggleFollow={toggleFollow} />
              ))}
            </section>

            <p className="px-4 py-3 text-sm font-bold">Discover</p>
            <PostGrid posts={posts} onOpen={(id) => setSearch(q, tab, id)} />
          </>
        ) : (
          <>
            {(tab === "top" || tab === "people") && people.length > 0 ? (
              <section className="border-b border-zinc-200 px-4 py-3">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-400">People</p>
                {people.map((u) => (
                  <PersonRow key={u.id} user={u} currentUser={currentUser} toggleFollow={toggleFollow} />
                ))}
              </section>
            ) : null}

            {(tab === "top" || tab === "tags") && tags.length > 0 ? (
              <section className="border-b border-zinc-200 px-4 py-3">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-400">Tags</p>
                {tags.map((t) => (
                  <button
                    key={t.tag}
                    type="button"
                    onClick={() => commitSearch(`#${t.tag}`)}
                    className="flex w-full items-center gap-3 py-2 text-left hover:bg-zinc-50"
                  >
                    <span className="grid h-11 w-11 place-items-center rounded-full border border-zinc-200">
                      <Hash size={18} />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">#{t.tag}</span>
                      <span className="text-xs text-ink-500">{t.count} posts</span>
                    </span>
                  </button>
                ))}
              </section>
            ) : null}

            {(tab === "top" || tab === "places") && places.length > 0 ? (
              <section className="border-b border-zinc-200 px-4 py-3">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-400">Places</p>
                {places.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => commitSearch(p.name)}
                    className="flex w-full items-center gap-3 py-2 text-left hover:bg-zinc-50"
                  >
                    <span className="grid h-11 w-11 place-items-center rounded-full border border-zinc-200">
                      <MapPin size={18} />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">{p.name}</span>
                      <span className="text-xs text-ink-500">{p.count} posts</span>
                    </span>
                  </button>
                ))}
              </section>
            ) : null}

            {(tab === "top" || tab === "posts") && matchedPosts.length > 0 ? (
              <section className="px-0 py-2">
                {tab === "top" ? (
                  <div className="space-y-1 px-2 pb-3">
                    <p className="px-2 text-xs font-semibold uppercase tracking-wide text-ink-400">Posts</p>
                    {matchedPosts.slice(0, 6).map((p) => {
                      const author = getUser(p.userId);
                      if (!author) return null;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            saveRecent({ q, at: Date.now() });
                            setSearch(q, tab, p.id);
                          }}
                          className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-zinc-50"
                        >
                          <img src={p.image} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold">{author.username}</span>
                            <span className="block truncate text-sm text-ink-600">{p.caption}</span>
                            {p.location ? (
                              <span className="mt-0.5 block truncate text-xs text-ink-400">{p.location}</span>
                            ) : null}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
                <PostGrid posts={tab === "posts" || tab === "top" ? matchedPosts : []} onOpen={(id) => setSearch(q, tab, id)} />
              </section>
            ) : null}

            {tab === "people" && people.length === 0 ? (
              <p className="px-6 py-16 text-center text-sm text-ink-500">No people match “{q}”.</p>
            ) : null}
            {tab === "posts" && matchedPosts.length === 0 ? (
              <p className="px-6 py-16 text-center text-sm text-ink-500">No posts match “{q}”.</p>
            ) : null}
            {tab === "tags" && tags.length === 0 ? (
              <p className="px-6 py-16 text-center text-sm text-ink-500">No tags match “{q}”.</p>
            ) : null}
            {tab === "places" && places.length === 0 ? (
              <p className="px-6 py-16 text-center text-sm text-ink-500">No places match “{q}”.</p>
            ) : null}
            {tab === "top" && people.length === 0 && matchedPosts.length === 0 && tags.length === 0 && places.length === 0 ? (
              <p className="px-6 py-16 text-center text-sm text-ink-500">No results for “{q}”. Try a name, city, or #tag.</p>
            ) : null}
          </>
        )}
      </div>

      {openPost ? (
        <PostModal
          postId={openPost}
          onClose={() => setSearch(q, tab)}
        />
      ) : null}
    </div>
  );
}

function PersonRow({ user, currentUser, toggleFollow }) {
  const isMe = user.id === currentUser.id;
  const following = currentUser.following.includes(user.id);
  return (
    <div className="flex items-center gap-3 py-2">
      <Link to={`/profile/${user.username}`} className="flex min-w-0 flex-1 items-center gap-3">
        {user.avatar ? (
          <img src={user.avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
        ) : (
          <span className="grid h-11 w-11 place-items-center rounded-full bg-zinc-100">
            <UserRound size={18} />
          </span>
        )}
        <span className="min-w-0 text-left">
          <span className="block truncate text-sm font-semibold">{user.username}</span>
          <span className="block truncate text-xs text-ink-500">
            {user.name}
            {user.location ? ` · ${user.location}` : ""}
          </span>
        </span>
      </Link>
      {!isMe ? (
        <button
          type="button"
          onClick={() => toggleFollow(user.id)}
          className={`h-8 shrink-0 rounded-lg px-3 text-xs font-semibold ${
            following ? "bg-[#efefef] text-ig-text" : "bg-ig-blue text-white"
          }`}
        >
          {following ? "Following" : "Follow"}
        </button>
      ) : null}
    </div>
  );
}

function PostGrid({ posts, onOpen }) {
  if (!posts.length) return null;
  return (
    <div className="grid grid-cols-3 gap-0.5">
      {posts.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onOpen(p.id)}
          className="group relative block aspect-square w-full overflow-hidden"
        >
          <img src={p.image} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
          <span className="absolute inset-0 flex items-center justify-center gap-5 bg-black/0 text-sm font-semibold text-white opacity-0 transition-all duration-200 group-hover:bg-black/45 group-hover:opacity-100">
            <span className="inline-flex items-center gap-1.5">
              <Heart size={18} className="fill-white" /> {p.likes.length}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MessageCircle size={18} className="fill-white" /> {p.comments.length}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}
