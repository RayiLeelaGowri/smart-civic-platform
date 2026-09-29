"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";

const ComplaintMap = dynamic(
  () => import("@/components/ComplaintMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[380px] items-center justify-center rounded-2xl border border-aurora-border bg-aurora-panel-soft text-sm text-aurora-muted">
        Loading map...
      </div>
    ),
  }
);

const initialFormData = {
  title: "",
  description: "",
  category: "Streetlight",
  location: "",
  priority: "Medium",
  citizenName: "",
  citizenEmail: "",
};

const inputClassName =
  "w-full rounded-xl border border-aurora-border bg-aurora-panel-soft px-4 py-3 text-slate-100 placeholder-aurora-subtle outline-none transition focus:border-aurora-cyan focus:ring-2 focus:ring-aurora-cyan/20";

export default function ReportComplaintPage() {
  const [formData, setFormData] = useState(initialFormData);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    if (name === "location" && value.trim()) {
      setErrorMessage("");
    }
  }

  function handleLocationSelect(locationData) {
    setSelectedLocation(locationData);
    setErrorMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    const hasTextLocation = formData.location.trim().length >= 3;
    const hasMapLocation =
      selectedLocation &&
      Number.isFinite(Number(selectedLocation.latitude)) &&
      Number.isFinite(Number(selectedLocation.longitude));

    if (!hasTextLocation && !hasMapLocation) {
      setLoading(false);
      setErrorMessage(
        "Please enter a location or select a point on the map."
      );
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/complaints",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            location: formData.location.trim() || "Map-selected location",
            latitude: hasMapLocation
              ? Number(selectedLocation.latitude)
              : null,
            longitude: hasMapLocation
              ? Number(selectedLocation.longitude)
              : null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit complaint.");
      }

      setSuccessMessage(
        `Complaint submitted successfully. Your complaint ID is #${data.complaint.id}.`
      );

      setFormData(initialFormData);
      setSelectedLocation(null);
    } catch (requestError) {
      console.error("Complaint submission error:", requestError);

      setErrorMessage(
        requestError.message || "Failed to submit complaint."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-transparent text-slate-100">
      <header className="border-b border-aurora-border/70 bg-aurora-panel/90 px-6 py-5 shadow-2xl shadow-black/20 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-aurora-mint shadow-lg shadow-aurora-mint/50" />

              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-aurora-cyan">
                CivicPulse / Citizen Desk
              </p>
            </div>

            <h1 className="mt-2 text-2xl font-bold">
              Report a Civic Issue
            </h1>

            <p className="mt-1 text-sm text-aurora-muted">
              Help your city identify and resolve local problems.
            </p>
          </div>

          <Link
            href="/"
            className="rounded-lg border border-aurora-border px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-aurora-cyan hover:bg-aurora-panel-soft"
          >
            Home
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="rounded-3xl border border-aurora-border bg-aurora-panel p-6 shadow-2xl shadow-black/20 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-aurora-mint">
            New civic report
          </p>

          <h2 className="mt-2 text-2xl font-bold text-slate-100">
            Submit a Complaint
          </h2>

          <p className="mt-2 text-sm text-aurora-muted">
            Provide accurate details and use either the text location or the
            map to identify the issue.
          </p>

          {successMessage && (
            <div className="mt-6 rounded-xl border border-aurora-mint/40 bg-aurora-mint/10 p-4 text-aurora-mint">
              {successMessage}

              <p className="mt-2 text-sm text-aurora-muted">
                Save your complaint ID and use your registered email to track
                its progress.
              </p>

              <Link
                href="/track"
                className="mt-4 inline-block rounded-lg bg-aurora-mint-strong px-4 py-2 text-sm font-semibold text-aurora-ink transition hover:bg-aurora-mint"
              >
                Track This Complaint
              </Link>
            </div>
          )}

          {errorMessage && (
            <div className="mt-6 rounded-xl border border-red-400/40 bg-red-400/10 p-4 text-red-200">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-semibold text-slate-200"
              >
                Complaint Title *
              </label>

              <input
                id="title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Example: Streetlight not working"
                required
                className={inputClassName}
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-semibold text-slate-200"
              >
                Description *
              </label>

              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the civic issue clearly..."
                required
                rows="4"
                className={inputClassName}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="category"
                  className="mb-2 block text-sm font-semibold text-slate-200"
                >
                  Category *
                </label>

                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={inputClassName}
                >
                  <option>Streetlight</option>
                  <option>Garbage Collection</option>
                  <option>Pothole</option>
                  <option>Water Supply</option>
                  <option>Drainage</option>
                  <option>Road Damage</option>
                  <option>Public Safety</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="priority"
                  className="mb-2 block text-sm font-semibold text-slate-200"
                >
                  Priority
                </label>

                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className={inputClassName}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="location"
                className="mb-2 block text-sm font-semibold text-slate-200"
              >
                Location *
              </label>

              <input
                id="location"
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Example: MG Road, near Central Bus Stop"
                className={inputClassName}
              />

              <p className="mt-2 text-xs text-aurora-subtle">
                Enter a location here or select the exact point on the map
                below. Either one is enough.
              </p>
            </div>

            <div className="relative z-0">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <label className="block text-sm font-semibold text-slate-200">
                  Select Issue Location on Map
                </label>

                <span className="text-xs text-aurora-subtle">
                  Optional if you enter a location above
                </span>
              </div>

              <ComplaintMap
                selectable
                selectedLocation={selectedLocation}
                onLocationSelect={handleLocationSelect}
                height="380px"
              />

              {selectedLocation ? (
                <div className="mt-3 rounded-xl border border-aurora-mint/30 bg-aurora-mint/10 px-4 py-3 text-sm text-aurora-mint">
                  Selected coordinates:{" "}
                  {selectedLocation.latitude.toFixed(6)},{" "}
                  {selectedLocation.longitude.toFixed(6)}
                </div>
              ) : (
                <p className="mt-3 text-sm text-aurora-subtle">
                  You may click the map to select an exact location.
                </p>
              )}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="citizenName"
                  className="mb-2 block text-sm font-semibold text-slate-200"
                >
                  Your Name
                </label>

                <input
                  id="citizenName"
                  type="text"
                  name="citizenName"
                  value={formData.citizenName}
                  onChange={handleChange}
                  placeholder="Optional"
                  className={inputClassName}
                />
              </div>

              <div>
                <label
                  htmlFor="citizenEmail"
                  className="mb-2 block text-sm font-semibold text-slate-200"
                >
                  Email Address
                </label>

                <input
                  id="citizenEmail"
                  type="email"
                  name="citizenEmail"
                  value={formData.citizenEmail}
                  onChange={handleChange}
                  placeholder="Optional"
                  className={inputClassName}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-aurora-mint-strong px-5 py-3 font-semibold text-aurora-ink transition hover:-translate-y-0.5 hover:bg-aurora-mint hover:shadow-lg hover:shadow-aurora-mint/20 disabled:cursor-not-allowed disabled:bg-aurora-subtle"
            >
              {loading ? "Submitting Complaint..." : "Submit Complaint"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}