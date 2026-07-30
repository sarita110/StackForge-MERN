import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Terminal, Loader2, AlertCircle } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Connection failed. Please check credentials.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg relative flex flex-col items-center justify-center px-4 overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-100 pointer-events-none z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-accent/5 rounded-full blur-3xl pointer-events-none z-0" />

      <div className="w-full max-w-md bg-brand-panel border border-brand-border rounded-xl p-8 space-y-6 relative z-10 shadow-2xl">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-accent to-brand-accent-light flex items-center justify-center shadow-lg shadow-brand-accent/25">
            <Terminal className="w-5 h-5 text-brand-bg font-bold" />
          </div>
          <span className="text-sm font-semibold tracking-wider text-white uppercase font-mono mt-2">
            Stack<span className="text-brand-accent-light">Forge</span>{" "}
            Authentication
          </span>
          <p className="text-xs text-brand-text-muted">
            Enter your developer credentials to log in.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-950/20 border border-red-900/30 text-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <span className="text-xs">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="developer@stackforge.com"
              className="w-full bg-brand-bg border border-brand-border rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-accent-light transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-brand-bg border border-brand-border rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-accent-light transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand-accent hover:bg-brand-accent-light text-brand-bg font-semibold rounded-lg py-2.5 text-xs transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-brand-bg" />{" "}
                Authenticating...
              </>
            ) : (
              "Access Workspace"
            )}
          </button>
        </form>

        {/* Redirect Option Link */}
        <div className="text-center pt-2">
          <span className="text-xs text-brand-text-muted font-medium">
            New developer?{" "}
          </span>
          <Link
            to="/register"
            className="text-xs font-semibold text-brand-accent-light hover:text-white transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
