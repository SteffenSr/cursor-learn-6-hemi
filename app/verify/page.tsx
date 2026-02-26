"use client";

import { FormEvent, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verify, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuth();

  const challengeId = searchParams.get("challengeId") ?? "";
  const email = searchParams.get("email") ?? "";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await verify(challengeId, code);
      setAuth(result.token, result.user);
      router.replace("/overview");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Verification failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (!challengeId) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>Missing challenge</h1>
          <p className="subtitle">
            No verification challenge found.{" "}
            <a href="/login">Go back to login</a>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Enter verification code</h1>
        <p className="subtitle">
          We sent a 6-digit code to <strong>{email}</strong>.
          <br />
          Check your <strong>spam folder</strong> — it may land there.
        </p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="code">Verification code</label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              autoFocus
              style={{ letterSpacing: "0.3em", fontSize: "1.25rem" }}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Verifying…" : "Verify"}
          </button>
        </form>

        <p className="hint">
          Didn&apos;t receive a code?{" "}
          <a href="/login">Go back</a> and try again.
        </p>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="auth-page">
          <div className="auth-card">
            <div className="loading-state">
              <div className="loading-spinner" />
              <p>Loading…</p>
            </div>
          </div>
        </div>
      }
    >
      <VerifyForm />
    </Suspense>
  );
}
