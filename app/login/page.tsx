"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { login, signup, ApiError } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const authFn = isSignup ? signup : login;
      const result = await authFn(email, password);
      const params = new URLSearchParams({
        challengeId: result.challengeId,
        email,
      });
      router.push(`/verify?${params.toString()}`);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setError("Email already registered. Try logging in instead.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>{isSignup ? "Create account" : "Sign in"}</h1>
        <p className="subtitle">
          Hemi Patient Overview – Clinician Portal
        </p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@clinic.com"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading
              ? "Sending code…"
              : isSignup
              ? "Sign up"
              : "Sign in"}
          </button>
        </form>

        <p className="hint">
          {isSignup ? "Already have an account?" : "No account yet?"}{" "}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setIsSignup(!isSignup);
              setError("");
            }}
          >
            {isSignup ? "Sign in" : "Create one"}
          </a>
        </p>
      </div>
    </div>
  );
}
