"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

export default function AdminDashboard() {
  const router = useRouter();

  const [dashboard, setDashboard] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const loadDashboardData = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }

    try {
      const [
        statsResponse,
        complaintsResponse,
        departmentsResponse,
      ] = await Promise.all([
        apiRequest("/dashboard/stats"),
        apiRequest("/complaints"),
        apiRequest("/dashboard/departments"),
      ]);

      if (
        !statsResponse.ok ||
        !complaintsResponse.ok ||
        !departmentsResponse.ok
      ) {
        throw new Error("Could not load data from the backend.");
      }

      const statsData = await statsResponse.json();
      const complaintsData = await complaintsResponse.json();
      const departmentsData = await departmentsResponse.json();

      setDashboard(statsData);
      setComplaints(complaintsData.complaints || []);
      setDepartments(departmentsData.departments || []);
      setError("");
    } catch (requestError) {
      console.error("Dashboard loading error:", requestError);

      setError(
        requestError.message ||
          "Unable to load dashboard data. Make sure you are logged in and the backend is running on port 5000."
      );
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setCheckingAuth(false);
      setLoading(false);
      router.replace("/login");
      return;
    }

    setCheckingAuth(false);
    loadDashboardData();
  }, [loadDashboardData, router]);

  async function handleStatusUpdate(complaintId, newStatus) {
    setUpdatingId(complaintId);
    setStatusMessage("");
    setError("");

    try {
      const response = await apiRequest(
        `/complaints/${complaintId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update complaint status.");
      }

      setComplaints((currentComplaints) =>
        currentComplaints.map((complaint) =>
          complaint.id === complaintId ? data.complaint : complaint
        )
      );

      setStatusMessage(
        `Complaint #${complaintId} was updated to "${newStatus}".`
      );

      await loadDashboardData(false);
    } catch (requestError) {
      console.error("Status update error:", requestError);
      setError(requestError.message);
    } finally {
      setUpdatingId(null);
    }
  }

  const summary = dashboard?.summary;

  const cards = [
    {
      label: "Total Complaints",
      value: summary?.total_complaints || 0,
      color: "border-aurora-cyan/40",
      number: "text-aurora-cyan",
    },
    {
      label: "Pending",
      value: summary?.pending_complaints || 0,
      color: "border-aurora-coral/40",
      number: "text-aurora-coral",
    },
    {
      label: "In Progress",
      value: summary?.in_progress_complaints || 0,
      color: "border-aurora-lilac/40",
      number: "text-aurora-lilac",
    },
    {
      label: "Resolved",
      value: summary?.resolved_complaints || 0,
      color: "border-aurora-mint/40",
      number: "text-aurora-mint",
    },
    {
      label: "High Priority",
      value: summary?.high_priority_complaints || 0,
      color: "border-red-400/40",
      number: "text-red-300",
    },
  ];

  if (checkingAuth || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-transparent">
        <p className="text-lg font-semibold text-aurora-mint">
          Loading CivicPulse operations...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-transparent text-slate-100">
      <header className="border-b border-aurora-border/70 bg-aurora-panel/90 px-6 py-5 shadow-2xl shadow-black/20 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-aurora-mint shadow-lg shadow-aurora-mint/50" />

              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-aurora-cyan">
                CivicPulse / Operations
              </p>
            </div>

            <h1 className="mt-2 text-2xl font-bold text-slate-100">
              City Operations Command Center
            </h1>

            <p className="mt-1 text-sm text-aurora-muted">
              Monitor complaints, response activity, and resolution progress.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/complaints"
              className="rounded-lg border border-aurora-border px-4 py-2 text-sm font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:border-aurora-cyan hover:bg-aurora-panel-soft"
            >
              Manage Complaints
            </Link>

            <Link
              href="/report"
              className="rounded-lg bg-aurora-mint-strong px-4 py-2 text-sm font-semibold text-aurora-ink transition hover:-translate-y-0.5 hover:bg-aurora-mint"
            >
              Report an Issue
            </Link>

            <Link
              href="/track"
              className="rounded-lg border border-aurora-border px-4 py-2 text-sm font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:border-aurora-cyan hover:bg-aurora-panel-soft"
            >
              Track Complaint
            </Link>

            <LogoutButton />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        {error && (
          <div className="mb-6 rounded-xl border border-red-400/40 bg-red-400/10 p-4 text-red-200">
            {error}
          </div>
        )}

        {statusMessage && (
          <div className="mb-6 rounded-xl border border-aurora-mint/40 bg-aurora-mint/10 p-4 text-aurora-mint">
            {statusMessage}
          </div>
        )}

        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-aurora-cyan">
              Live overview
            </p>

            <h2 className="mt-2 text-xl font-bold text-slate-100">
              Complaint Overview
            </h2>
          </div>

          <span className="hidden text-sm text-aurora-subtle sm:block">
            Operations dashboard
          </span>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {cards.map((card) => (
            <div
              key={card.label}
              className={`rounded-2xl border ${card.color} bg-aurora-panel p-5 shadow-xl shadow-black/10`}
            >
              <p className="text-sm font-medium text-aurora-muted">
                {card.label}
              </p>

              <p className={`mt-2 text-3xl font-bold ${card.number}`}>
                {card.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-aurora-border bg-aurora-panel p-6 shadow-xl shadow-black/10 lg:col-span-2">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-100">
                  Recent Complaints
                </h2>

                <p className="mt-1 text-sm text-aurora-muted">
                  Update a complaint status directly from the command center.
                </p>
              </div>

              <span className="text-sm text-aurora-subtle">
                {complaints.length} total
              </span>
            </div>

            {complaints.length === 0 ? (
              <p className="rounded-xl border border-aurora-border bg-aurora-panel-soft p-4 text-aurora-muted">
                No complaints have been submitted yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-aurora-border bg-aurora-panel-soft text-aurora-muted">
                    <tr>
                      <th className="px-3 py-3 font-semibold">ID</th>
                      <th className="px-3 py-3 font-semibold">Complaint</th>
                      <th className="px-3 py-3 font-semibold">Category</th>
                      <th className="px-3 py-3 font-semibold">Priority</th>
                      <th className="px-3 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {complaints.slice(0, 6).map((complaint) => (
                      <tr
                        key={complaint.id}
                        className="border-b border-aurora-border/60 hover:bg-aurora-panel-soft/70"
                      >
                        <td className="px-3 py-4 font-medium text-aurora-cyan">
                          #{complaint.id}
                        </td>

                        <td className="px-3 py-4">
                          <Link
                            href={`/complaints/${complaint.id}`}
                            className="font-semibold text-aurora-mint hover:text-aurora-cyan hover:underline"
                          >
                            {complaint.title}
                          </Link>

                          <p className="max-w-xs truncate text-xs text-aurora-subtle">
                            {complaint.location}
                          </p>
                        </td>

                        <td className="px-3 py-4 text-slate-200">
                          {complaint.category}
                        </td>

                        <td className="px-3 py-4 text-slate-200">
                          {complaint.priority}
                        </td>

                        <td className="px-3 py-4">
                          <select
                            value={complaint.status}
                            disabled={updatingId === complaint.id}
                            onChange={(event) =>
                              handleStatusUpdate(
                                complaint.id,
                                event.target.value
                              )
                            }
                            className={`cursor-pointer rounded-full border px-3 py-2 text-xs font-semibold outline-none ${
                              statusColors[complaint.status] ||
                              "border-aurora-border bg-aurora-panel-soft text-aurora-muted"
                            } disabled:cursor-not-allowed disabled:opacity-60`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-aurora-border bg-aurora-panel p-6 shadow-xl shadow-black/10">
            <h2 className="mb-5 text-xl font-bold text-slate-100">
              Issues by Category
            </h2>

            {!dashboard?.complaintsByCategory?.length ? (
              <p className="text-sm text-aurora-muted">
                No category data available yet.
              </p>
            ) : (
              <div className="space-y-4">
                {dashboard.complaintsByCategory.map((item) => (
                  <div key={item.category}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-medium text-slate-200">
                        {item.category}
                      </span>

                      <span className="text-aurora-muted">
                        {item.complaint_count}
                      </span>
                    </div>

                    <div className="h-2 rounded-full bg-aurora-panel-soft">
                      <div
                        className="h-2 rounded-full bg-aurora-cyan shadow-lg shadow-aurora-cyan/30"
                        style={{
                          width: `${
                            summary?.total_complaints
                              ? (item.complaint_count /
                                  summary.total_complaints) *
                                100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <section className="mt-6 rounded-2xl border border-aurora-border bg-aurora-panel p-6 shadow-xl shadow-black/10">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-100">
              Department Workload
            </h2>

            <p className="mt-1 text-sm text-aurora-muted">
              Track complaint volume and resolution progress by department.
            </p>
          </div>

          {departments.length === 0 ? (
            <p className="rounded-xl border border-aurora-border bg-aurora-panel-soft p-4 text-aurora-muted">
              No department assignments available yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="border-b border-aurora-border bg-aurora-panel-soft text-aurora-muted">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Department</th>
                    <th className="px-4 py-3 font-semibold">Total</th>
                    <th className="px-4 py-3 font-semibold">Pending</th>
                    <th className="px-4 py-3 font-semibold">In Progress</th>
                    <th className="px-4 py-3 font-semibold">Resolved</th>
                    <th className="px-4 py-3 font-semibold">Rejected</th>
                  </tr>
                </thead>

                <tbody>
                  {departments.map((department) => (
                    <tr
                      key={department.department}
                      className="border-b border-aurora-border/60 hover:bg-aurora-panel-soft/70"
                    >
                      <td className="px-4 py-4 font-semibold text-slate-100">
                        {department.department}
                      </td>

                      <td className="px-4 py-4 text-slate-200">
                        {department.total_complaints}
                      </td>

                      <td className="px-4 py-4 text-aurora-coral">
                        {department.pending_complaints}
                      </td>

                      <td className="px-4 py-4 text-aurora-cyan">
                        {department.in_progress_complaints}
                      </td>

                      <td className="px-4 py-4 text-aurora-mint">
                        {department.resolved_complaints}
                      </td>

                      <td className="px-4 py-4 text-red-300">
                        {department.rejected_complaints}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}