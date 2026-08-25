import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useSocial } from "../context/SocialContext.jsx";

export default function Settings() {
  const { currentUser, updateProfile, logout } = useAuth();
  const { showToast } = useSocial();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    name: currentUser.name,
    username: currentUser.username,
    email: currentUser.email,
    bio: currentUser.bio || "",
    website: currentUser.website || "",
    location: currentUser.location || "",
    avatar: currentUser.avatar,
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState({});
  const [privateAcct, setPrivateAcct] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onAvatar = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors({ avatar: "Choose an image file" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, avatar: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  const onSave = (e) => {
    e.preventDefault();
    const result = updateProfile(form);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    showToast("Settings saved");
  };

  return (
    <div className="scroll-area h-full w-full bg-white">
      <div className="flex h-[60px] items-center border-b border-ig-line px-6">
        <h1 className="text-xl font-semibold">Settings</h1>
      </div>

      <form onSubmit={onSave} className="w-full max-w-none px-4 py-6 md:px-8" noValidate>
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => fileRef.current?.click()} className="relative">
            <img src={form.avatar} alt="" className="h-20 w-20 rounded-full object-cover" />
            <span className="absolute inset-x-0 bottom-0 rounded-b-full bg-black/50 py-0.5 text-center text-[10px] font-semibold text-white">
              Change
            </span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onAvatar} />
          <div>
            <p className="font-semibold">{currentUser.username}</p>
            <p className="text-sm text-ink-500">Profile photo</p>
            {errors.avatar ? <p className="text-xs text-rose-600">{errors.avatar}</p> : null}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Field label="Name" name="name" value={form.name} onChange={onChange} error={errors.name} />
          <Field label="Username" name="username" value={form.username} onChange={onChange} error={errors.username} />
          <Field label="Email" name="email" type="email" value={form.email} onChange={onChange} error={errors.email} />
          <Field label="Location" name="location" value={form.location} onChange={onChange} />
          <Field label="Website" name="website" value={form.website} onChange={onChange} />
          <div className="md:col-span-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-ink-500">Bio</span>
              <textarea
                name="bio"
                value={form.bio}
                onChange={onChange}
                maxLength={150}
                rows={3}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none ring-brand-500 focus:bg-white focus:ring-2"
              />
              <span className="mt-1 block text-xs text-ink-400">{form.bio.length}/150</span>
            </label>
          </div>
          <Field
            label="New password"
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            error={errors.password}
          />
          <Field
            label="Confirm password"
            name="confirm"
            type="password"
            value={form.confirm}
            onChange={onChange}
            error={errors.confirm}
          />
        </div>

        <div className="mt-6 space-y-3 rounded-2xl border border-zinc-200 p-4">
          <p className="text-sm font-bold">Privacy</p>
          <Toggle
            label="Private account"
            hint="Approve followers before they see your posts"
            on={privateAcct}
            setOn={setPrivateAcct}
          />
          <Toggle
            label="Email notifications"
            hint="Get alerts for likes, comments, and follows"
            on={emailNotifs}
            setOn={setEmailNotifs}
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button type="submit" className="inline-flex h-9 items-center rounded-lg bg-ig-blue px-5 text-sm font-semibold text-white hover:opacity-90">
            Save changes
          </button>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="inline-flex h-9 items-center rounded-lg border border-rose-200 px-5 text-sm font-semibold text-rose-600 hover:bg-rose-50"
          >
            Log out
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, name, value, onChange, error, type = "text" }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-ink-500">{label}</span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm outline-none ring-brand-500 focus:bg-white focus:ring-2"
      />
      {error ? <span className="mt-1 block text-xs text-rose-600">{error}</span> : null}
    </label>
  );
}

function Toggle({ label, hint, on, setOn }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-ink-500">{hint}</p>
      </div>
      <button
        type="button"
        onClick={() => setOn(!on)}
        className={`relative h-6 w-11 rounded-full ${on ? "bg-brand-500" : "bg-zinc-300"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${on ? "left-5" : "left-0.5"}`} />
      </button>
    </div>
  );
}
