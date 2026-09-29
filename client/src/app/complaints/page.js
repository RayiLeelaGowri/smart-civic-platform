"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

const departments = [
  "Sanitation",
  "Public Works",
  "Electricity",
  "Water Supply",
  "Roads and Transport",
  "Public Safety",
  "Parks and Recreation",
];

export default function ComplaintsPage() {
  const router = useRouter();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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
    async function loadComplaints() {
      try {
        const response = await apiRequest("/complaints");

        if (!response.ok) {
          throw new Error("Could not load complaints.");
        }

        const data = await response.json();
        setComplaints(data.complaints || []);
        setError("");
      } catch (requestError) {
        console.error("Load complaints error:", requestError);

        setError(requestError.message || "Unable to load complaints.");
      } finally {
        setLoading(false);
      }
    }

    const token = localStorage.getItem("token");

    if (token) {
      loadComplaints();
    }
  }, []);

  const categories = useMemo(() => {
    return [
      ...new Set(
        complaints.map((complaint) => complaint.category).filter(Boolean)
      ),
    ].sort();
  }, [complaints]);

  const filteredComplaints = useMemo(() => {
    const searchText = searchQuery.toLowerCase().trim();

    return complaints.filter((complaint) => {
      const title = String(complaint.title || "").toLowerCase();
      const location = String(complaint.location || "").toLowerCase();
      const description = String(complaint.description || "").toLowerCase();
      const complaintId = String(complaint.id || "");

      const matchesSearch =
        title.includes(searchText) ||
        location.includes(searchText) ||
        description.includes(searchText) ||
        complaintId.includes(searchText);

      const matchesStatus =
        statusFilter === "All" || complaint.status === statusFilter;

      const matchesCategory =
        categoryFilter === "All" || complaint.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [complaints, searchQuery, statusFilter, categoryFilter]);

  async function handleStatusUpdate(complaintId, newStatus) {
    setUpdatingId(complaintId);
    setError("");
    setSuccessMessage("");

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
        throw new Error(data.message || "Failed to update complaint.");
      }

      setComplaints((currentComplaints) =>
        currentComplaints.map((complaint) =>
          complaint.id === complaintId ? data.complaint : complaint
        )
      );

      setSuccessMessage(
        `Complaint #${complaintId} was updated to "${newStatus}".`
      );
    } catch (requestError) {
      console.error("Status update error:", requestError);
      setError(requestError.message);
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleAssignmentUpdate(event, complaint) {
    event.preventDefault();

    setUpdatingId(complaint.id);
    setError("");
    setSuccessMessage("");

    const formData = new FormData(event.currentTarget);

    const department = formData.get("department");
    const assignedTo = formData.get("assignedTo");
    const resolutionNotes = formData.get("resolutionNotes");

    try {
      const response = await apiRequest(
        `/complaints/${complaint.id}/assignment`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            department,
            assignedTo: assignedTo || null,
            resolutionNotes,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update complaint assignment."
        );
      }

      setComplaints((currentComplaints) =>
        currentComplaints.map((currentComplaint) =>
          currentComplaint.id === complaint.id
            ? data.complaint
            : currentComplaint
        )
      );

      setSuccessMessage(
        `Assignment for complaint #${complaint.id} was saved successfully.`
      );
    } catch (requestError) {
      console.error("Assignment update error:", requestError);
      setError(requestError.message);
    } finally {
      setUpdatingId(null);
    }
  }

  if (checkingAuth || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-transparent">
        <p className="text-lg font-semibold text-aurora-mint">
          Loading complaints...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-transparent text-slate-100">
      <header className="border-b border-aurora-border/70 bg-aurora-panel/90 px-6 py-5 text-slate-100 shadow-2xl shadow-black/20 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-aurora-mint shadow-lg shadow-aurora-mint/50" />

              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-aurora-cyan">
                CivicPulse / Operations
              </p>
            </div>

            <h1 className="mt-2 text-2xl font-bold">
              Complaint Management Console
            </h1>

            <p className="mt-1 text-sm text-aurora-muted">
              Search, assign, and move civic issues toward resolution.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="rounded-lg border border-aurora-border px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-aurora-cyan hover:bg-aurora-panel-soft"
            >
              Dashboard
            </Link>

            <Link
              href="/report"
              className="rounded-lg bg-aurora-mint-strong px-4 py-2 text-sm font-semibold text-aurora-ink transition hover:-translate-y-0.5 hover:bg-aurora-mint"
            >
              Report an Issue
            </Link>

            <Link
              href="/track"
              className="rounded-lg border border-aurora-border px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-aurora-cyan hover:bg-aurora-panel-soft"
            >
              Track Complaint
            </Link>

            <LogoutButton />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-aurora-cyan">
            Operations queue
          </p>

          <h2 className="mt-2 text-2xl font-bold text-slate-100">
            All Complaints
          </h2>

          <p className="mt-1 text-sm text-aurora-muted">
            Search, filter, assign, and update reported civic issues.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-400/40 bg-red-400/10 p-4 text-red-200">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 rounded-xl border border-aurora-mint/40 bg-aurora-mint/10 p-4 text-aurora-mint">
            {successMessage}
          </div>
        )}

        <section className="mb-6 rounded-2xl border border-aurora-border bg-aurora-panel p-5 shadow-xl shadow-black/10">
          <div className="grid gap-4 md:grid-cols-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by ID, title, description, or location..."
              className="rounded-xl border border-aurora-border bg-aurora-panel-soft px-4 py-3 text-slate-100 placeholder-aurora-subtle outline-none focus:border-aurora-cyan focus:ring-2 focus:ring-aurora-cyan/20"
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-aurora-border bg-aurora-panel-soft px-4 py-3 text-slate-100 outline-none focus:border-aurora-cyan focus:ring-2 focus:ring-aurora-cyan/20"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="rounded-xl border border-aurora-border bg-aurora-panel-soft px-4 py-3 text-slate-100 outline-none focus:border-aurora-cyan focus:ring-2 focus:ring-aurora-cyan/20"
            >
              <option value="All">All Categories</option>

              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-aurora-border bg-aurora-panel shadow-xl shadow-black/10">
          <div className="flex items-center justify-between border-b border-aurora-border px-6 py-4">
            <p className="font-semibold text-slate-100">
              Showing {filteredComplaints.length} complaint
              {filteredComplaints.length !== 1 ? "s" : ""}
            </p>

            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("All");
                setCategoryFilter("All");
              }}
              className="text-sm font-semibold text-aurora-cyan hover:text-aurora-mint"
            >
              Clear Filters
            </button>
          </div>

          {filteredComplaints.length === 0 ? (
            <p className="p-6 text-aurora-muted">
              No complaints match the selected filters.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px] text-left text-sm">
                <thead className="bg-aurora-panel-soft text-aurora-muted">
                  <tr>
                    <th className="px-4 py-4 font-semibold">ID</th>
                    <th className="px-4 py-4 font-semibold">Complaint</th>
                    <th className="px-4 py-4 font-semibold">Category</th>
                    <th className="px-4 py-4 font-semibold">Location</th>
                    <th className="px-4 py-4 font-semibold">Priority</th>
                    <th className="px-4 py-4 font-semibold">Status</th>
                    <th className="px-4 py-4 font-semibold">Assignment</th>
                    <th className="px-4 py-4 font-semibold">Created</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredComplaints.map((complaint) => (
                    <tr
                      key={complaint.id}
                      className="border-t border-aurora-border/60 align-top hover:bg-aurora-panel-soft/70"
                    >
                      <td className="px-4 py-4 font-semibold">
                        <Link
                          href={`/complaints/${complaint.id}`}
                          className="text-aurora-cyan hover:text-aurora-mint hover:underline"
                        >
                          #{complaint.id}
                        </Link>
                      </td>

                      <td className="max-w-xs px-4 py-4">
                        <p className="font-semibold text-slate-100">
                          {complaint.title}
                        </p>

                        <p className="mt-1 line-clamp-3 text-xs text-aurora-subtle">
                          {complaint.description}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-slate-200">
                        {complaint.category}
                      </td>

                      <td className="px-4 py-4 text-slate-200">
                        {complaint.location}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                            complaint.priority === "High"
                              ? "border-red-400/30 bg-red-400/10 text-red-300"
                              : complaint.priority === "Medium"
                              ? "border-aurora-coral/30 bg-aurora-coral/10 text-aurora-coral"
                              : "border-aurora-mint/30 bg-aurora-mint/10 text-aurora-mint"
                          }`}
                        >
                          {complaint.priority}
                        </span>
                      </td>

                      <td className="px-4 py-4">
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

                      <td className="min-w-[280px] px-4 py-4">
                        <form
                          onSubmit={(event) =>
                            handleAssignmentUpdate(event, complaint)
                          }
                          className="space-y-3"
                        >
                          <select
                            name="department"
                            defaultValue={complaint.department || ""}
                            required
                            disabled={updatingId === complaint.id}
                            className="w-full rounded-lg border border-aurora-border bg-aurora-panel-soft px-3 py-2 text-sm text-slate-100 outline-none focus:border-aurora-cyan focus:ring-2 focus:ring-aurora-cyan/20 disabled:opacity-60"
                          >
                            <option value="" disabled>
                              Select department
                            </option>

                            {departments.map((department) => (
                              <option key={department} value={department}>
                                {department}
                              </option>
                            ))}
                          </select>

                          <input
                            name="assignedTo"
                            type="number"
                            min="1"
                            defaultValue={complaint.assigned_to || ""}
                            placeholder="Assigned user ID"
                            disabled={updatingId === complaint.id}
                            className="w-full rounded-lg border border-aurora-border bg-aurora-panel-soft px-3 py-2 text-sm text-slate-100 placeholder-aurora-subtle outline-none focus:border-aurora-cyan focus:ring-2 focus:ring-aurora-cyan/20 disabled:opacity-60"
                          />

                          <textarea
                            name="resolutionNotes"
                            rows="2"
                            defaultValue={complaint.resolution_notes || ""}
                            placeholder="Resolution notes"
                            disabled={updatingId === complaint.id}
                            className="w-full rounded-lg border border-aurora-border bg-aurora-panel-soft px-3 py-2 text-sm text-slate-100 placeholder-aurora-subtle outline-none focus:border-aurora-cyan focus:ring-2 focus:ring-aurora-cyan/20 disabled:opacity-60"
                          />

                          <button
                            type="submit"
                            disabled={updatingId === complaint.id}
                            className="rounded-lg bg-aurora-mint-strong px-3 py-2 text-xs font-semibold text-aurora-ink transition hover:bg-aurora-mint disabled:cursor-not-allowed disabled:bg-aurora-subtle"
                          >
                            {updatingId === complaint.id
                              ? "Saving..."
                              : "Save Assignment"}
                          </button>

                          {complaint.assigned_user_name && (
                            <p className="text-xs text-aurora-subtle">
                              Current assignee:{" "}
                              {complaint.assigned_user_name}
                            </p>
                          )}
                        </form>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-aurora-subtle">
                        {complaint.created_at
                          ? new Date(
                              complaint.created_at
                            ).toLocaleDateString()
                          : "Not available"}
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