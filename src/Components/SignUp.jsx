import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const BG = "https://i.pinimg.com/736x/0f/5c/06/0f5c067d1e696b6c024ac30da1d336ef.jpg";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setIsError(true);
      setMessage("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    setMessage("");
    try {
      const res = await fetch("krishnasoftwarebackend.vercel.app/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setIsError(true);
        setMessage(data.message || "Signup failed.");
      } else {
        setIsError(false);
        setMessage(data.message);
        setTimeout(() => navigate("/login"), 1200);
      }
    } catch {
      setIsError(true);
      setMessage("Unable to connect to server.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls =
    "h-11 w-full rounded-xl border border-white/25 bg-white/15 px-4 text-sm text-white placeholder-white/50 outline-none backdrop-blur-sm transition focus:border-white/60 focus:bg-white/20";

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

        <h1 className="text-3xl font-bold text-white tracking-tight">Create Account</h1>
        <p className="mt-1 text-xs tracking-widest text-white/60 uppercase">Join KDMS</p>

        <form onSubmit={handleSubmit} className="mt-8 w-full space-y-4">
          <input
            type="text"
            placeholder="Full name"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
          />
          <input
            type="email"
            placeholder="Email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
          />
          <input
            type="password"
            placeholder="Password"
            autoComplete="new-password"
            minLength={8}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputCls}
          />
          <input
            type="password"
            placeholder="Confirm password"
            autoComplete="new-password"
            minLength={8}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputCls}
          />

          {message && (
            <p role="status" className={`text-center text-xs ${isError ? "text-red-300" : "text-green-300"}`}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 h-11 w-full rounded-xl bg-white/20 border border-white/30 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/30 active:scale-[0.98] disabled:opacity-60"
          >
            {isLoading ? "Creating..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-white/60">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-white hover:underline">
            Login
          </Link>
        </p>

        <p className="mt-6 text-[10px] text-white/30">© {new Date().getFullYear()} KDMS. All rights reserved.</p>
      </div>
    </main>
  );
}
