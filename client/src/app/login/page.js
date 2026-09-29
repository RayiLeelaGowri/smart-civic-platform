"use client";

import { useState } from "react";

const API_URL = "http://localhost:5000/api";

const inputClassName =
  "w-full rounded-xl border border-aurora-border bg-aurora-panel-soft px-4 py-3 text-slate-100 placeholder-aurora-subtle outline-none transition focus:border-aurora-cyan focus:ring-2 focus:ring-aurora-cyan/20";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      if (!data.token) {
        throw new Error(
          "Login succeeded, but no authentication token was returned."
        );
      }

      localStorage.setItem("token", data.token);
      window.location.href = "/admin";
    } catch (loginError) {
      console.error("Login error:", loginError);
      setError(loginError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-transparent px-6 py-10">
      <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-aurora-mint/10 blur-3xl" />

      <div className="pointer-events-none absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-aurora-cyan/10 blur-3xl" />

      <section className="relative w-full max-w-md rounded-3xl border border-aurora-border bg-aurora-panel/95 p-8 shadow-2xl shadow-black/30 backdrop-blur">
        <div className="mb-8 flex items-center gap-3">
          <span className="h-3 w-3 rounded-full bg-aurora-mint shadow-lg shadow-aurora-mint/50" />

          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-aurora-cyan">
            CivicPulse / Secure Access
          </p>
        </div>

        <h1 className="text-3xl font-bold text-slate-100">
          Sign in as Admin
        </h1>

        <p className="mt-2 text-aurora-muted">
          Access the civic operations command center.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-slate-200"
            >
              Email address
            </label>

            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@smartcivic.local"
              className={inputClassName}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold text-slate-200"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className={inputClassName}
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-aurora-mint-strong px-5 py-3 font-semibold text-aurora-ink transition hover:-translate-y-0.5 hover:bg-aurora-mint hover:shadow-lg hover:shadow-aurora-mint/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in as Admin"}
          </button>
        </form>
      </section>
    </main>
  );
}