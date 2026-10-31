import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const BG = "https://i.pinimg.com/736x/0f/5c/06/0f5c067d1e696b6c024ac30da1d336ef.jpg";

export default function AstralLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message || "Login failed.");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch {
      setError("Unable to connect to server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden"
      style={{ backgroundImage: `url(${BG})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

      {/* Glass card */}
      <div className="relative z-10 w-full max-w-sm mx-4 rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl px-8 py-10 flex flex-col items-center">

        {/* Avatar */}
        <div className="mb-4 h-16 w-16 overflow-hidden rounded-full ring-2 ring-white/40 ring-offset-2 ring-offset-transparent">
          <img
            src="https://z2jsknicy5.ufs.sh/f/HcyboFZa5mETW7ygJex3K01ERYkZiQOyH5lnc4NJtLmhIqVg"
            alt="Profile"
            className="h-full w-full object-cover"
          />
        </div>

        <h1 className="text-3xl font-bold text-white tracking-tight">Welcome Back!</h1>
        <p className="mt-1 text-xs tracking-widest text-white/60 uppercase">KDMS</p>

        <form onSubmit={handleSubmit} className="mt-8 w-full space-y-4">
          <input
            type="email"
            placeholder="Email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 w-full rounded-xl border border-white/25 bg-white/15 px-4 text-sm text-white placeholder-white/50 outline-none backdrop-blur-sm transition focus:border-white/60 focus:bg-white/20"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 w-full rounded-xl border border-white/25 bg-white/15 px-4 pr-11 text-sm text-white placeholder-white/50 outline-none backdrop-blur-sm transition focus:border-white/60 focus:bg-white/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.58 10.59a2 2 0 002.83 2.83M9.88 5.09A10.9 10.9 0 0112 5c4.48 0 8.27 2.94 9.54 7a10.7 10.7 0 01-4.02 5.36M6.23 6.23A11.2 11.2 0 012.46 12c1.27 4.06 5.06 7 9.54 7 1.1 0 2.16-.18 3.15-.5" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.46 12C3.73 7.94 7.52 5 12 5s8.27 2.94 9.54 7c-1.27 4.06-5.06 7-9.54 7s-8.27-2.94-9.54-7z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          {error && <p role="alert" className="text-center text-xs text-red-300">{error}</p>}

          <div className="flex justify-end">
            <button type="button" className="text-xs text-white/60 hover:text-white transition">
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 h-11 w-full rounded-xl bg-white/20 border border-white/30 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/30 active:scale-[0.98] disabled:opacity-60"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-white/60">
          Don't have an account?{" "}
          <Link to="/signup" className="font-semibold text-white hover:underline">
            Sign up
          </Link>
        </p>

        <p className="mt-6 text-[10px] text-white/30">© {new Date().getFullYear()} KDMS. All rights reserved.</p>
      </div>
    </main>
  );
}
