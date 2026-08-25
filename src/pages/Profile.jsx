import { useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Bookmark, Grid3x3, Heart, MessageCircle, Settings } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useSocial } from "../context/SocialContext.jsx";
import PeopleListModal from "../components/PeopleListModal.jsx";
import PostModal from "../components/PostModal.jsx";

export default function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { currentUser, getUser, toggleFollow } = useAuth();
  const { posts, startConversation } = useSocial();
  const [tab, setTab] = useState("posts");
  const [listType, setListType] = useState(null);
  const [openPost, setOpenPost] = useState(null);
  const gridRef = useRef(null);

  const user = getUser(username);
  const isMe = user && user.id === currentUser.id;

  const userPosts = useMemo(
    () => (user ? posts.filter((p) => p.userId === user.id) : []),
    [posts, user]
  );
  const savedPosts = useMemo(
    () => (isMe ? posts.filter((p) => currentUser.saved?.includes(p.id)) : []),
    [posts, currentUser.saved, isMe]
  );

  if (!user) {
    return (
      <div className="grid h-full w-full place-items-center bg-white text-sm text-ig-muted">User not found</div>
    );
  }

  const following = currentUser.following.includes(user.id);
  const grid = tab === "saved" ? savedPosts : userPosts;

  const actions = isMe ? (
    <>
      <Link
        to="/settings"
        className="inline-flex h-8 flex-1 items-center justify-center rounded-lg bg-[#efefef] px-4 text-sm font-semibold text-ig-text md:flex-none"
      >
        Edit profile
      </Link>
      <button
        type="button"
        onClick={() => navigate("/settings")}
        className="grid h-8 w-8 place-items-center rounded-lg bg-[#efefef] text-ig-text"
      >
        <Settings size={18} />
      </button>
    </>
  ) : (
    <>
      <button
        type="button"
        onClick={() => toggleFollow(user.id)}
        className={`inline-flex h-8 flex-1 items-center justify-center rounded-lg px-4 text-sm font-semibold md:flex-none ${
          following ? "bg-[#efefef] text-ig-text" : "bg-ig-blue text-white"
        }`}
      >
        {following ? "Following" : "Follow"}
      </button>
      <button
        type="button"
        onClick={() => {
          const cid = startConversation(user.id);
          if (cid) navigate(`/messages/${cid}`);
        }}
        className="inline-flex h-8 flex-1 items-center justify-center rounded-lg bg-[#efefef] px-4 text-sm font-semibold md:flex-none"
      >
        Message
      </button>
    </>
  );

  return (
    <div className="scroll-area h-full w-full bg-white">
      <div className="w-full px-4 pt-5 md:hidden">
        <div className="flex items-center justify-between">
          <h1 className="truncate text-xl font-semibold">{user.username}</h1>
        </div>
        <div className="mt-5 flex items-center gap-6">
          <img src={user.avatar} alt={user.name} className="h-[86px] w-[86px] shrink-0 rounded-full object-cover" />
          <div className="flex min-w-0 flex-1 justify-around text-center">
            <button type="button" onClick={() => gridRef.current?.scrollIntoView({ behavior: "smooth" })}>
              <span className="block text-[16px] font-semibold">{userPosts.length}</span>
              <span className="text-sm text-ig-muted">posts</span>
            </button>
            <button type="button" onClick={() => setListType("followers")}>
              <span className="block text-[16px] font-semibold">{user.followers.length}</span>
              <span className="text-sm text-ig-muted">followers</span>
            </button>
            <button type="button" onClick={() => setListType("following")}>
              <span className="block text-[16px] font-semibold">{user.following.length}</span>
              <span className="text-sm text-ig-muted">following</span>
            </button>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm font-semibold">{user.name}</p>
          {user.bio ? <p className="mt-1 text-sm leading-5">{user.bio}</p> : null}
          {user.location ? <p className="mt-1 text-sm text-ig-muted">{user.location}</p> : null}
        </div>
        <div className="mt-3 flex items-center gap-2">{actions}</div>
      </div>

      <div className="hidden w-full px-6 pt-8 md:block xl:px-10">
        <div className="flex items-start gap-10">
          <img
            src={user.avatar}
            alt={user.name}
            className="h-[150px] w-[150px] shrink-0 rounded-full object-cover"
          />
          <div className="min-w-0 flex-1 pt-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-[20px] font-normal text-ig-text">{user.username}</h1>
              <div className="flex items-center gap-2">{actions}</div>
            </div>
            <div className="mt-6 flex gap-10 text-[16px]">
              <button type="button" onClick={() => gridRef.current?.scrollIntoView({ behavior: "smooth" })}>
                <span className="font-semibold">{userPosts.length}</span> posts
              </button>
              <button type="button" onClick={() => setListType("followers")}>
                <span className="font-semibold">{user.followers.length}</span> followers
              </button>
              <button type="button" onClick={() => setListType("following")}>
                <span className="font-semibold">{user.following.length}</span> following
              </button>
            </div>
            <div className="mt-5">
              <p className="text-sm font-semibold">{user.name}</p>
              {user.bio ? <p className="mt-1 max-w-xl whitespace-pre-line text-sm leading-5">{user.bio}</p> : null}
              {user.location ? <p className="mt-1 text-sm text-ig-muted">{user.location}</p> : null}
              {user.website ? <p className="text-sm font-semibold text-ig-link">{user.website}</p> : null}
            </div>
          </div>
        </div>
      </div>

      <div ref={gridRef} className="mt-5 flex w-full border-t border-ig-line">
        <button
          type="button"
          onClick={() => setTab("posts")}
          className={`flex h-[53px] flex-1 items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wider ${
            tab === "posts" ? "-mt-px border-t border-ig-text text-ig-text" : "text-ig-muted"
          }`}
        >
          <Grid3x3 size={12} /> Posts
        </button>
        {isMe ? (
          <button
            type="button"
            onClick={() => setTab("saved")}
            className={`flex h-[53px] flex-1 items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wider ${
              tab === "saved" ? "-mt-px border-t border-ig-text text-ig-text" : "text-ig-muted"
            }`}
          >
            <Bookmark size={12} /> Saved
          </button>
        ) : null}
      </div>

      <div className="grid w-full grid-cols-3 gap-px bg-ig-line pb-10">
        {grid.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setOpenPost(p.id)}
            className="group relative aspect-square overflow-hidden bg-ig-line"
          >
            <img
              src={p.image}
              alt=""
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <span className="absolute inset-0 flex items-center justify-center gap-6 bg-black/0 text-sm font-bold text-white opacity-0 transition-all duration-200 group-hover:bg-black/40 group-hover:opacity-100">
              <span className="inline-flex items-center gap-1.5">
                <Heart size={20} className="fill-white" /> {p.likes.length}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MessageCircle size={20} className="fill-white" /> {p.comments.length}
              </span>
            </span>
          </button>
        ))}
      </div>
      {grid.length === 0 ? (
        <p className="px-6 py-16 text-center text-sm text-ig-muted">
          {tab === "saved" ? "No saved posts yet." : "No posts yet."}
        </p>
      ) : null}

      {listType === "followers" ? (
        <PeopleListModal title="Followers" userIds={user.followers} onClose={() => setListType(null)} />
      ) : null}
      {listType === "following" ? (
        <PeopleListModal title="Following" userIds={user.following} onClose={() => setListType(null)} />
      ) : null}
      {openPost ? <PostModal postId={openPost} onClose={() => setOpenPost(null)} /> : null}
    </div>
  );
}
