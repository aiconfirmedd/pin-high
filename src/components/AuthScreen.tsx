import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Mode = "login" | "signup";

const FEATURES = [
  { icon: "â³", label: "Track Every Round" },
  { icon: "ð", label: "Smart Insights" },
  { icon: "ð¸", label: "OCR Scorecard Import" },
  { icon: "ðï¸", label: "Club Performance" },
];

export default function AuthScreen({ onAuth }: { onAuth: () => void }) {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuth();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        if (data.session) {
          onAuth();
          setInfo("Account created. You are signed in.");
        } else {
          setInfo("Check your email to confirm your account. The link will bring you back here and sign you in.");
          setMode("login");
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      setForgotSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (showForgot) {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="auth-logo-frame">
              <img src="/icon.svg" alt="Pin High" className="auth-icon" />
            </div>
          </div>
          {forgotSent ? (
            <div className="auth-forgot-success">
              <div className="auth-forgot-check">â</div>
              <h3>Check Your Email</h3>
              <p>We sent a password reset link to <strong>{forgotEmail}</strong></p>
              <button className="auth-btn" onClick={() => { setShowForgot(false); setForgotSent(false); }}>
                Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="auth-form">
              <h2 className="auth-forgot-title">Reset Password</h2>
              <p className="auth-forgot-desc">Enter your email and we'll send you a reset link.</p>
              {error && <div className="auth-error">{error}</div>}
              <label className="auth-label">
                Email
                <input
                  type="email"
                  className="auth-input"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  required
                  autoFocus
                  placeholder="your@email.com"
                />
              </label>
              <button className="auth-btn" disabled={loading}>
                {loading ? "Sendingâ¦" : "Send Reset Link"}
              </button>
              <button type="button" className="auth-switch" onClick={() => { setShowForgot(false); setError(""); }}>
                Back to Sign In
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="auth-screen">
      <div className="auth-card auth-card--hero">
        {/* Hero Section */}
        <div className="auth-hero">
          <div className="auth-logo">
            <div className="auth-logo-frame">
              <img src="/icon.svg" alt="Pin High" className="auth-icon" />
            </div>
            <div className="auth-wordmark">
              <div className="auth-brand">Pin High</div>
              <div className="auth-tagline">Premium Golf Scorecard</div>
            </div>
          </div>
          <p className="auth-value-prop">
            Track scores, analyze performance, and improve your game â all from your phone.
          </p>
          <div className="auth-features">
            {FEATURES.map(f => (
              <div key={f.label} className="auth-feature-pill">
                <span className="auth-feature-icon">{f.icon}</span>
                <span className="auth-feature-label">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="auth-divider">
          <span>{mode === "login" ? "Sign in to continue" : "Create your account"}</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}
          {info && <div className="auth-info">{info}</div>}

          <label className="auth-label">
            Email
            <input
              type="email"
              className="auth-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="your@email.com"
            />
          </label>

          <label className="auth-label">
            Password
            <input
              type="password"
              className="auth-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder="â¢â¢â¢â¢â¢â¢â¢â¢"
            />
          </label>

          {mode === "login" && (
            <button
              type="button"
              className="auth-forgot-link"
              onClick={() => { setShowForgot(true); setForgotEmail(email); setError(""); }}
            >
              Forgot password?
            </button>
          )}

          <button className="auth-btn" disabled={loading}>
            {loading
              ? (mode === "login" ? "Signing inâ¦" : "Creating accountâ¦")
              : (mode === "login" ? "Sign In" : "Create Account")}
          </button>

          <button
            type="button"
            className="auth-switch"
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); setInfo(""); }}
          >
            {mode === "login" ? "New here? Create an account" : "Already have an account? Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
