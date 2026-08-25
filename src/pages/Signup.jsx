import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import PulseLogo from "../components/PulseLogo.jsx";

const empty = { name: "", username: "", email: "", password: "", confirm: "" };

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    const result = signup(form);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    navigate("/");
  };

  return (
    <div className="scroll-area flex h-full w-full items-center justify-center bg-white px-4">
      <div className="w-full max-w-[350px] px-4 py-8">
        <div className="border border-ig-border bg-white px-10 pb-8 pt-10">
          <div className="mb-3 text-center">
            <PulseLogo className="text-[48px]" />
          </div>
          <p className="mb-4 text-center text-base font-semibold text-ig-muted">
            Sign up to see photos and videos from your friends.
          </p>
          <form onSubmit={onSubmit} className="space-y-[6px]" noValidate>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              placeholder="Mobile number or email"
              className="h-9 w-full rounded-[3px] border border-ig-border bg-ig-bg px-2 text-xs outline-none"
            />
            {errors.email ? <p className="text-xs text-ig-red">{errors.email}</p> : null}
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="Full Name"
              className="h-9 w-full rounded-[3px] border border-ig-border bg-ig-bg px-2 text-xs outline-none"
            />
            {errors.name ? <p className="text-xs text-ig-red">{errors.name}</p> : null}
            <input
              name="username"
              value={form.username}
              onChange={onChange}
              placeholder="Username"
              className="h-9 w-full rounded-[3px] border border-ig-border bg-ig-bg px-2 text-xs outline-none"
            />
            {errors.username ? <p className="text-xs text-ig-red">{errors.username}</p> : null}
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              placeholder="Password"
              className="h-9 w-full rounded-[3px] border border-ig-border bg-ig-bg px-2 text-xs outline-none"
            />
            {errors.password ? <p className="text-xs text-ig-red">{errors.password}</p> : null}
            <input
              name="confirm"
              type="password"
              value={form.confirm}
              onChange={onChange}
              placeholder="Confirm password"
              className="h-9 w-full rounded-[3px] border border-ig-border bg-ig-bg px-2 text-xs outline-none"
            />
            {errors.confirm ? <p className="text-xs text-ig-red">{errors.confirm}</p> : null}
            <button type="submit" className="mt-2 h-8 w-full rounded-lg bg-ig-blue text-sm font-semibold text-white">
              Sign up
            </button>
          </form>
        </div>
        <div className="mt-2.5 border border-ig-border bg-white py-5 text-center text-sm">
          Have an account?{" "}
          <Link to="/login" className="font-semibold text-ig-blue">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
