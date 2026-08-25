import { useRef, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useSocial } from "../context/SocialContext.jsx";
import Stories from "../components/Stories.jsx";
import StoryViewer from "../components/StoryViewer.jsx";
import PostCard from "../components/PostCard.jsx";
import RightPanel from "../components/RightPanel.jsx";

export default function Home() {
  const { posts, addStory } = useSocial();
  const { currentUser } = useAuth();
  const [viewer, setViewer] = useState(null);
  const fileRef = useRef(null);

  const onStoryFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => addStory(String(reader.result));
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-white">
      <div className="scroll-area min-h-0 min-w-0 flex-1">
        <Stories onOpen={(id) => setViewer(id)} onAdd={() => fileRef.current?.click()} />
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onStoryFile} />
        {posts.map((post, i) => (
          <div key={post.id} className="page-enter" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
            <PostCard post={post} />
          </div>
        ))}
        {posts.length === 0 ? (
          <p className="px-4 py-16 text-center text-sm text-ig-muted">
            Follow people to see photos, {currentUser.name.split(" ")[0]}.
          </p>
        ) : null}
      </div>
      <RightPanel />
      {viewer ? <StoryViewer startUserId={viewer} onClose={() => setViewer(null)} /> : null}
    </div>
  );
}
