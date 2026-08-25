import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useSocial } from "../context/SocialContext.jsx";

export default function RightPanel() {
  const { currentUser, users, toggleFollow } = useAuth();
  const { showToast } = useSocial();

  const suggestions = users
    .filter((u) => u.id !== currentUser.id && !currentUser.following.includes(u.id))
    .slice(0, 5);

  return (
    <aside className="scroll-area hidden h-full w-[319px] shrink-0 border-l border-ig-line bg-white p-6 xl:block">
      <div className="flex items-center gap-3">
        <Link to={`/profile/${currentUser.username}`} className="h-14 w-14 overflow-hidden rounded-full">
          <img src={currentUser.avatar} alt="" className="h-full w-full object-cover" />
        </Link>
        <div className="min-w-0 flex-1">
          <Link to={`/profile/${currentUser.username}`} className="block truncate text-sm font-semibold text-ig-text">
            {currentUser.username}
          </Link>
          <p className="truncate text-sm text-ig-muted">{currentUser.name}</p>
        </div>
        <Link to="/settings" className="text-xs font-semibold text-ig-blue">
          Switch
        </Link>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm font-semibold text-ig-muted">Suggested for you</p>
        <Link to="/explore" className="text-xs font-semibold text-ig-text">
          See All
        </Link>
      </div>

      <div className="mt-4 space-y-4">
        {suggestions.map((u) => (
          <div key={u.id} className="flex items-center gap-3">
            <Link to={`/profile/${u.username}`} className="h-8 w-8 overflow-hidden rounded-full">
              <img src={u.avatar} alt="" className="h-full w-full object-cover" />
            </Link>
            <div className="min-w-0 flex-1">
              <Link to={`/profile/${u.username}`} className="block truncate text-[13px] font-semibold">
                {u.username}
              </Link>
              <p className="truncate text-xs text-ig-muted">Suggested for you</p>
            </div>
            <button
              type="button"
              onClick={() => {
                toggleFollow(u.id);
                showToast(`Followed ${u.username}`);
              }}
              className="text-xs font-semibold text-ig-blue"
            >
              Follow
            </button>
          </div>
        ))}
      </div>

      <p className="mt-8 text-[11px] leading-5 text-[#c7c7c7]">
        About · Help · Press · API · Jobs · Privacy · Terms · Locations · Language
      </p>
      <p className="mt-4 text-[11px] text-[#c7c7c7]">© {new Date().getFullYear()} PULSE</p>
    </aside>
  );
}
