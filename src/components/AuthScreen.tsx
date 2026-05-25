import React, { useState } from "react";
import { authenticateLocalUser, type LocalUserSession } from "../utils/localStorageStore";

type Props = {
  onAuth: (session: LocalUserSession) => void;
};

export default function AuthScreen({ onAuth }: Props) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [created, setCreated] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCreated(false);

    const result = authenticateLocalUser(name, password);
    if (result.error || !result.session) {
      setError(result.error || "Could not sign in.");
      return;
    }

    setCreated(result.created);
    onAuth(result.session);
  }

  return (
    <div className="auth-screen">
      <div className="auth-card auth-card--hero">
        <div className="auth-hero">
          <div className="auth-logo">
            <div className="auth-logo-frame">
              <img src="/icon.svg" alt="Pin High" className="auth-icon" />
            </div>
            <div className="auth-wordmark">
              <div className="auth-brand">Pin High</div>
              <div className="auth-tagline">Golf Scorecard</div>
            </div>
          </div>
          <p className="auth-value-prop">
            Sign in locally with your name and a simple password. The app works offline on the course.
          </p>
        </div>

        <div className="auth-divider">
          <span>Player Login</span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}
          {created && <div className="auth-info">Local player profile created.</div>}

          <label className="auth-label">
            Name
            <input
              type="text"
              className="auth-input"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoComplete="name"
              placeholder="Your name"
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
              minLength={4}
              autoComplete="current-password"
              placeholder="Simple password"
            />
          </label>

          <button className="auth-btn" type="submit">
            Enter Pin High
          </button>

          <div className="auth-helper">
            New names are created automatically on this device. Existing names require the same password.
          </div>
        </form>
      </div>
    </div>
  );
}
