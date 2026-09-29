"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LogoutButton from "@/components/LogoutButton";
import { apiRequest } from "@/lib/api";

const statusColors = {
  Pending: "border-aurora-coral/30 bg-aurora-coral/10 text-aurora-coral",
  "In Progress":
    "border-aurora-cyan/30 bg-aurora-cyan/10 text-aurora-cyan",
  Resolved:
    "border-aurora-mint/30 bg-aurora-mint/10 text-aurora-mint",
  Rejected: "border-red-400/30 bg-red-400/10 text-red-300",
};

export default function ComplaintDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const complaintId = params?.id;

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setCheckingAuth(false);
      setLoading(false);
      router.replace("/login");
      return;
    }

    setCheckingAuth(false);
  }, [router]);

  useEffect(() => {
    async function loadComplaint() {
      try {
        setLoading(true);
        setError("");

        const response = await apiRequest(`/complaints/${complaintId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not load complaint.");
        }

        setComplaint(data.complaint);
      } catch (requestError) {
        console.error("Complaint details error:", requestError);

        setError(
          requestError.message || "Failed to load complaint details."
        );
      } finally {
        setLoading(false);
      }
    }

    const token = localStorage.getItem("token");

    if (token && complaintId) {
      loadComplaint();
    }
  }, [complaintId]);

  if (checkingAuth || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-transparent">
        <p className="text-lg font-semibold text-aurora-mint">
          Loading complaint details...
        </p>
      </main>
    );
  }

  if (error || !complaint) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-transparent px-6">
        <section className="rounded-2xl border border-aurora-border bg-aurora-panel p-8 text-center shadow-2xl shadow-black/20">
          <h1 className="text-xl font-bold text-aurora-coral">
            Complaint unavailable
          </h1>

          <p className="mt-3 text-aurora-muted">
            {error || "The requested complaint could not be found."}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/complaints"
              className="rounded-lg bg-aurora-mint-strong px-5 py-3 font-semibold text-aurora-ink transition hover:bg-aurora-mint"
            >
              Back to Complaints
            </Link>

            <Link
              href="/admin"
              className="rounded-lg border border-aurora-border px-5 py-3 font-semibold text-slate-100 transition hover:border-aurora-cyan hover:bg-aurora-panel-soft"
            >
              Dashboard
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-transparent text-slate-100">
      <header className="border-b border-aurora-border/70 bg-aurora-panel/90 px-6 py-5 shadow-2xl shadow-black/20 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-aurora-mint shadow-lg shadow-aurora-mint/50" />

              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-aurora-cyan">
                CivicPulse / Case File
              </p>
            </div>

            <h1 className="mt-2 text-2xl font-bold text-slate-100">
              Complaint Details
            </h1>

            <p className="mt-1 text-sm text-aurora-muted">
              Review report information and operational assignment.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="rounded-lg border border-aurora-border px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-aurora-cyan hover:bg-aurora-panel-soft"
            >
              Dashboard
            </Link>

            <Link
              href="/complaints"
              className="rounded-lg border border-aurora-border px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-aurora-cyan hover:bg-aurora-panel-soft"
            >
              All Complaints
            </Link>

            <LogoutButton />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-aurora-cyan">
              Complaint #{complaint.id}
            </p>

            <h2 className="mt-1 text-3xl font-bold text-slate-100">
              {complaint.title}
            </h2>
          </div>

          <span
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${
              statusColors[complaint.status] ||
              "border-aurora-border bg-aurora-panel-soft text-aurora-muted"
            }`}
          >
            {complaint.status || "Unknown"}
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-aurora-border bg-aurora-panel p-6 shadow-xl shadow-black/10 lg:col-span-2">
            <h3 className="mb-4 text-lg font-bold text-slate-100">
              Complaint Information
            </h3>

            <div className="space-y-5">
              <div>
                <p className="text-sm font-semibold text-aurora-muted">
                  Description
                </p>

                <p className="mt-1 whitespace-pre-wrap text-slate-200">
                  {complaint.description || "No description provided"}
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <InfoItem
                  label="Category"
                  value={complaint.category || "Not provided"}
                />

                <InfoItem
                  label="Priority"
                  value={complaint.priority || "Not provided"}
                />

                <InfoItem
                  label="Location"
                  value={complaint.location || "Not provided"}
                />

                <InfoItem
                  label="Created"
                  value={formatDate(complaint.created_at)}
                />

                <InfoItem
                  label="Last Updated"
                  value={formatDate(complaint.updated_at)}
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-aurora-border bg-aurora-panel p-6 shadow-xl shadow-black/10">
            <h3 className="mb-4 text-lg font-bold text-slate-100">
              Citizen Information
            </h3>

            <div className="space-y-4">
              <InfoItem
                label="Name"
                value={complaint.citizen_name || "Not provided"}
              />

              <InfoItem
                label="Email"
                value={complaint.citizen_email || "Not provided"}
                breakAll
              />
            </div>
          </section>

          <section className="rounded-2xl border border-aurora-border bg-aurora-panel p-6 shadow-xl shadow-black/10 lg:col-span-2">
            <h3 className="mb-4 text-lg font-bold text-slate-100">
              Assignment
            </h3>

            <div className="grid gap-5 sm:grid-cols-2">
              <InfoItem
                label="Department"
                value={complaint.department || "Not assigned"}
              />

              <div>
                <p className="text-sm font-semibold text-aurora-muted">
                  Assigned Officer
                </p>

                <p className="mt-1 text-slate-200">
                  {complaint.assigned_user_name || "Not assigned"}
                </p>

                {complaint.assigned_user_email && (
                  <p className="mt-1 text-sm text-aurora-subtle">
                    {complaint.assigned_user_email}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-aurora-border bg-aurora-panel p-6 shadow-xl shadow-black/10">
            <h3 className="mb-4 text-lg font-bold text-slate-100">
              Resolution Notes
            </h3>

            <p className="whitespace-pre-wrap text-aurora-muted">
              {complaint.resolution_notes ||
                "No resolution notes added yet."}
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}

function InfoItem({ label, value, breakAll = false }) {
  return (
    <div>
      <p className="text-sm font-semibold text-aurora-muted">{label}</p>

      <p className={`mt-1 text-slate-200 ${breakAll ? "break-all" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleString();
}