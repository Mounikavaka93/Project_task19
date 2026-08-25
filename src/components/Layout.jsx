import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Compass,
  Heart,
  Home,
  MessageCircle,
  MoreHorizontal,
  PlusSquare,
  Search,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useSocial } from "../context/SocialContext.jsx";
import { useState } from "react";
import CreatePostModal from "./CreatePostModal.jsx";
import PulseLogo from "./PulseLogo.jsx";

export default function Layout() {
  const { currentUser } = useAuth();
  const { unreadCount } = useSocial();
  const [createOpen, setCreateOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const item = (isActive) =>
    `flex w-full items-center justify-center gap-4 rounded-lg px-2 py-3 text-[16px] text-ig-text transition-colors hover:bg-ig-hover xl:justify-start xl:px-3 ${
      isActive ? "font-bold" : "font-normal"
    }`;

  return (
    <div className="flex h-full w-full overflow-hidden bg-white">
      <aside className="hidden h-full w-[72px] shrink-0 flex-col border-r border-ig-line bg-white pt-2 md:flex xl:w-[244px]">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex h-[73px] w-full items-center justify-center px-2 xl:justify-start xl:px-5"
        >
          <span className="hidden xl:block">
            <PulseLogo />
          </span>
          <span className="xl:hidden">
            <PulseLogo compact className="h-7 w-7 rounded-lg object-cover" />
          </span>
        </button>

        <nav className="flex flex-1 flex-col gap-1 px-2 xl:px-3">
          <NavLink to="/" end className={({ isActive }) => item(isActive)}>
            {({ isActive }) => (
              <>
                <Home size={24} strokeWidth={isActive ? 2.4 : 1.8} fill={isActive ? "currentColor" : "none"} />
                <span className="hidden xl:inline">Home</span>
              </>
            )}
          </NavLink>
          <NavLink to="/explore" className={item(false)}>
            <Search size={24} strokeWidth={1.8} />
            <span className="hidden xl:inline">Search</span>
          </NavLink>
          <NavLink to="/explore" className={({ isActive }) => item(isActive)}>
            {({ isActive }) => (
              <>
                <Compass size={24} strokeWidth={isActive ? 2.4 : 1.8} />
                <span className="hidden xl:inline">Explore</span>
              </>
            )}
          </NavLink>
          <NavLink to="/messages" className={({ isActive }) => item(isActive)}>
            <span className="relative inline-flex">
              <MessageCircle size={24} strokeWidth={1.8} />
            </span>
            <span className="hidden xl:inline">Messages</span>
          </NavLink>
          <NavLink to="/notifications" className={({ isActive }) => item(isActive)}>
            <span className="relative inline-flex">
              <Heart size={24} strokeWidth={1.8} />
              {unreadCount > 0 ? (
                <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-ig-red" />
              ) : null}
            </span>
            <span className="hidden xl:inline">Notifications</span>
          </NavLink>
          <button type="button" onClick={() => setCreateOpen(true)} className={item(false)}>
            <PlusSquare size={24} strokeWidth={1.8} />
            <span className="hidden xl:inline">Create</span>
          </button>
          <NavLink to={`/profile/${currentUser.username}`} className={({ isActive }) => item(isActive)}>
            {({ isActive }) => (
              <>
                <img
                  src={currentUser.avatar}
                  alt=""
                  className={`h-6 w-6 rounded-full object-cover ${isActive ? "ring-2 ring-ig-text ring-offset-1" : ""}`}
                />
                <span className="hidden xl:inline">Profile</span>
              </>
            )}
          </NavLink>
        </nav>

        <div className="px-2 pb-5 xl:px-3">
          <NavLink to="/settings" className={({ isActive }) => item(isActive)}>
            <MoreHorizontal size={24} />
            <span className="hidden xl:inline">More</span>
          </NavLink>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-[60px] shrink-0 items-center justify-between border-b border-ig-line bg-white px-4 pt-[env(safe-area-inset-top)] md:hidden">
          <PulseLogo className="text-[26px]" />
          <div className="flex items-center gap-5">
            <button type="button" onClick={() => navigate("/notifications")} className="relative">
              <Heart size={24} strokeWidth={1.8} />
              {unreadCount > 0 ? <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-ig-red" /> : null}
            </button>
            <button type="button" onClick={() => navigate("/messages")}>
              <MessageCircle size={24} strokeWidth={1.8} />
            </button>
          </div>
        </header>

        <main className="min-h-0 min-w-0 flex-1 overflow-hidden bg-white">
          <div key={location.pathname} className="page-enter h-full min-h-0">
            <Outlet />
          </div>
        </main>

        <nav className="flex h-12 shrink-0 items-center justify-around border-t border-ig-line bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
          <NavLink to="/" end className="grid h-12 w-12 place-items-center">
            {({ isActive }) => <Home size={24} fill={isActive ? "currentColor" : "none"} strokeWidth={1.8} />}
          </NavLink>
          <NavLink to="/explore" className="grid h-12 w-12 place-items-center">
            <Search size={24} strokeWidth={1.8} />
          </NavLink>
          <button type="button" onClick={() => setCreateOpen(true)} className="grid h-12 w-12 place-items-center">
            <PlusSquare size={24} strokeWidth={1.8} />
          </button>
          <NavLink to="/messages" className="grid h-12 w-12 place-items-center">
            <MessageCircle size={24} strokeWidth={1.8} />
          </NavLink>
          <NavLink to={`/profile/${currentUser.username}`} className="grid h-12 w-12 place-items-center">
            {({ isActive }) => (
              <img
                src={currentUser.avatar}
                alt=""
                className={`h-6 w-6 rounded-full object-cover ${isActive ? "ring-2 ring-ig-text" : ""}`}
              />
            )}
          </NavLink>
        </nav>
      </div>

      {createOpen ? <CreatePostModal onClose={() => setCreateOpen(false)} /> : null}
    </div>
  );
}
