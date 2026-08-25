import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import PulseLogo from "../components/PulseLogo.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "demo@pulse.com", password: "demo123" });
  const [errors, setErrors] = useState({});

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    const result = login(form);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    navigate("/");
  };

  return (
    <div className="scroll-area flex h-full w-full items-center justify-center bg-white px-4">
      <div className="flex w-full max-w-[820px] items-center justify-center gap-8 py-8">
        <div className="relative hidden h-[580px] w-[380px] lg:block">
          <div className="absolute inset-0 rounded-[40px] border-[8px] border-black bg-black shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&h=1600&fit=crop"
              alt=""
              className="h-full w-full rounded-[32px] object-cover"
            />
          </div>
        </div>

        <div className="w-full max-w-[350px]">
          <div className="border border-ig-border bg-white px-10 pb-6 pt-10">
            <div className="mb-8 text-center">
              <PulseLogo className="text-[48px]" />
            </div>
            <form onSubmit={onSubmit} className="space-y-[6px]" noValidate>
              {errors.form ? <p className="mb-2 text-center text-sm text-ig-red">{errors.form}</p> : null}
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                placeholder="Phone number, username, or email"
                className="h-9 w-full rounded-[3px] border border-ig-border bg-ig-bg px-2 text-xs outline-none focus:border-[#a8a8a8]"
              />
              {errors.email ? <p className="text-xs text-ig-red">{errors.email}</p> : null}
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={onChange}
                placeholder="Password"
                className="h-9 w-full rounded-[3px] border border-ig-border bg-ig-bg px-2 text-xs outline-none focus:border-[#a8a8a8]"
              />
              {errors.password ? <p className="text-xs text-ig-red">{errors.password}</p> : null}
              <button
                type="submit"
                className="mt-2 h-8 w-full rounded-lg bg-ig-blue text-sm font-semibold text-white"
              >
                Log in
              </button>
            </form>
            <div className="my-4 flex items-center gap-4">
              <span className="h-px flex-1 bg-ig-border" />
              <span className="text-xs font-semibold text-ig-muted">OR</span>
              <span className="h-px flex-1 bg-ig-border" />
            </div>
            <p className="text-center text-sm font-semibold text-[#385185]">Log in with Facebook</p>
            <p className="mt-4 text-center text-xs text-ig-link">Forgot password?</p>
          </div>
          <div className="mt-2.5 border border-ig-border bg-white py-5 text-center text-sm">
            Don't have an account?{" "}
            <Link to="/signup" className="font-semibold text-ig-blue">
              Sign up
            </Link>
          </div>
          <p className="mt-4 text-center text-xs text-ig-muted">Demo: demo@pulse.com / demo123</p>
        </div>
      </div>
    </div>
  );
}
