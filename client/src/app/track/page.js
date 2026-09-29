"use client";

import Link from "next/link";
import { useState } from "react";

const API_URL = "http://localhost:5000";

const inputClassName =
  "w-full rounded-xl border border-aurora-border bg-[#12283a] px-4 py-3 text-[#f3f7f5] placeholder:text-[#9aafbd] caret-aurora-mint outline-none transition focus:border-aurora-cyan focus:ring-2 focus:ring-aurora-cyan/20";

export default function TrackComplaintPage() {
  const [complaintId, setComplaintId] = useState("");
  const [email, setEmail] = useState("");
  const [complaint, setComplaint] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setComplaint(null);
    setError("");

    if (!complaintId.trim() || !email.trim()) {
      setError("Complaint ID and email are required.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/complaints/track/${complaintId.trim()}?email=${encodeURIComponent(
          email.trim()
        )}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to find complaint.");
      }

      setComplaint(data.complaint);
    } catch (requestError) {
      console.error("Complaint tracking error:", requestError);
      setError(requestError.message || "Unable to find complaint.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-transparent px-6 py-10 text-slate-100">
      <section className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-aurora-border bg-aurora-panel p-8 shadow-2xl shadow-black/20">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-aurora-cyan shadow-lg shadow-aurora-cyan/50" />

                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-aurora-cyan">
                  CivicPulse / Tracking
                </p>
              </div>

              <h1 className="mt-3 text-3xl font-bold text-slate-100">
                Track Your Complaint
              </h1>

              <p className="mt-2 text-aurora-muted">
                Enter your complaint ID and registered email address to view
                the latest complaint status.
              </p>
            </div>

            <Link
              href="/"
              className="rounded-lg border border-aurora-border px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-aurora-cyan hover:bg-aurora-panel-soft"
            >
              Home
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="complaintId"
                className="mb-2 block text-sm font-semibold text-slate-200"
              >
                Complaint ID
              </label>

              <input
                id="complaintId"
                name="complaintId"
                type="number"
                min="1"
                required
                value={complaintId}
                onChange={(event) => setComplaintId(event.target.value)}
                placeholder="Example: 1"
                className={inputClassName}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-200"
              >
                Registered email address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Example: leela@example.com"
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
              className="rounded-xl bg-aurora-mint-strong px-5 py-3 font-semibold text-aurora-ink transition hover:-translate-y-0.5 hover:bg-aurora-mint hover:shadow-lg hover:shadow-aurora-mint/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Searching..." : "Track Complaint"}
            </button>
          </form>
        </div>

        {complaint && (
          <section className="mt-6 rounded-3xl border border-aurora-border bg-aurora-panel p-8 shadow-2xl shadow-black/20">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm text-aurora-cyan">
                  Complaint #{complaint.id}
                </p>

                <h2 className="text-2xl font-bold text-slate-100">
                  {complaint.title}
                </h2>
              </div>

              <span
                className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                  complaint.status === "Resolved"
                    ? "border-aurora-mint/30 bg-aurora-mint/10 text-aurora-mint"
                    : complaint.status === "Rejected"
                    ? "border-red-400/30 bg-red-400/10 text-red-300"
                    : complaint.status === "In Progress"
                    ? "border-aurora-cyan/30 bg-aurora-cyan/10 text-aurora-cyan"
                    : "border-aurora-coral/30 bg-aurora-coral/10 text-aurora-coral"
                }`}
              >
                {complaint.status || "Unknown"}
              </span>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <InfoItem label="Category" value={complaint.category} />
              <InfoItem label="Priority" value={complaint.priority} />
              <InfoItem label="Location" value={complaint.location} />
              <InfoItem label="Department" value={complaint.department} />

              <InfoItem
                label="Assigned officer"
                value={complaint.assigned_user_name || complaint.assigned_to}
              />

              <InfoItem
                label="Submitted on"
                value={formatDate(complaint.created_at)}
              />
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-aurora-muted">
                Description
              </h3>

              <p className="mt-2 rounded-xl border border-aurora-border bg-aurora-panel-soft p-4 text-slate-200">
                {complaint.description || "No description available."}
              </p>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-aurora-muted">
                Resolution notes
              </h3>

              <p className="mt-2 rounded-xl border border-aurora-border bg-aurora-panel-soft p-4 text-slate-200">
                {complaint.resolution_notes ||
                  "No resolution notes available yet."}
              </p>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="rounded-xl border border-aurora-border bg-aurora-panel-soft p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-aurora-subtle">
        {label}
      </p>

      <p className="mt-1 text-slate-100">{value || "Not assigned"}</p>
    </div>
  );
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "Not available";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleString();
}