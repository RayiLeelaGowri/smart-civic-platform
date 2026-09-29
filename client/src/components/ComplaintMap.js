"use client";

import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { useState } from "react";

const DEFAULT_CENTER = [20.5937, 78.9629];

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(event) {
      onLocationSelect({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      });
    },
  });

  return null;
}

function MapMover({ position }) {
  const map = useMap();

  if (position) {
    map.setView(position, 15, {
      animate: true,
    });
  }

  return null;
}

function getMarkerColor(priority) {
  if (priority === "High") {
    return "#ff9b78";
  }

  if (priority === "Medium") {
    return "#74d9e8";
  }

  return "#9ee7c1";
}

export default function ComplaintMap({
  complaints = [],
  selectable = false,
  selectedLocation = null,
  onLocationSelect = () => {},
  height = "420px",
}) {
  const [pinCode, setPinCode] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [mapPosition, setMapPosition] = useState(null);

  const hasSelectedLocation =
    selectedLocation &&
    Number.isFinite(Number(selectedLocation.latitude)) &&
    Number.isFinite(Number(selectedLocation.longitude));

  const selectedPosition = hasSelectedLocation
    ? [
        Number(selectedLocation.latitude),
        Number(selectedLocation.longitude),
      ]
    : null;

  const center = selectedPosition || mapPosition || DEFAULT_CENTER;

  async function handlePinCodeSearch() {
    const normalizedPinCode = pinCode.trim();

    if (!/^\d{6}$/.test(normalizedPinCode)) {
      setSearchError("Enter a valid 6-digit Indian PIN code.");
      return;
    }

    setSearching(true);
    setSearchError("");

    try {
      const query = new URLSearchParams({
        postalcode: normalizedPinCode,
        country: "India",
        format: "jsonv2",
        limit: "1",
      });

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${query.toString()}`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("PIN code search failed.");
      }

      const results = await response.json();

      if (!results.length) {
        throw new Error("No location found for this PIN code.");
      }

      const latitude = Number(results[0].lat);
      const longitude = Number(results[0].lon);

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        throw new Error("The returned location coordinates are invalid.");
      }

      const nextPosition = [latitude, longitude];

      setMapPosition(nextPosition);

      onLocationSelect({
        latitude,
        longitude,
      });
    } catch (error) {
      console.error("PIN code search error:", error);

      setSearchError(
        error.message || "Unable to find this PIN code."
      );
    } finally {
      setSearching(false);
    }
  }

  return (
    <div
      className="relative z-0 overflow-hidden rounded-2xl border border-aurora-border shadow-xl shadow-black/20"
      style={{
        height,
        width: "100%",
      }}
    >
      {selectable && (
        <div className="absolute left-3 right-3 top-3 z-[1000] rounded-xl border border-aurora-border bg-aurora-panel/95 p-3 shadow-xl backdrop-blur">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              inputMode="numeric"
              maxLength="6"
              value={pinCode}
              onChange={(event) =>
                setPinCode(event.target.value.replace(/\D/g, ""))
              }
              placeholder="Enter 6-digit PIN code"
              className="min-w-0 flex-1 rounded-lg border border-aurora-border bg-aurora-panel-soft px-3 py-2 text-sm text-slate-100 placeholder-aurora-subtle outline-none focus:border-aurora-cyan focus:ring-2 focus:ring-aurora-cyan/20"
            />

            <button
              type="button"
              onClick={handlePinCodeSearch}
              disabled={searching}
              className="rounded-lg bg-aurora-cyan px-4 py-2 text-sm font-semibold text-aurora-ink transition hover:bg-aurora-mint disabled:cursor-not-allowed disabled:opacity-60"
            >
              {searching ? "Finding..." : "Find PIN"}
            </button>
          </div>

          {searchError && (
            <p className="mt-2 text-xs text-aurora-coral">
              {searchError}
            </p>
          )}
        </div>
      )}

      <MapContainer
        center={center}
        zoom={hasSelectedLocation || mapPosition ? 15 : 5}
        minZoom={3}
        maxZoom={19}
        scrollWheelZoom
        className="h-full w-full"
        style={{
          height: "100%",
          width: "100%",
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <MapMover position={mapPosition} />

        {selectable && (
          <MapClickHandler onLocationSelect={onLocationSelect} />
        )}

        {hasSelectedLocation && (
          <CircleMarker
            center={selectedPosition}
            radius={10}
            pathOptions={{
              color: "#9ee7c1",
              fillColor: "#5bd6a0",
              fillOpacity: 0.9,
            }}
          >
            <Popup>Selected complaint location</Popup>
          </CircleMarker>
        )}

        {complaints.map((complaint) => {
          const latitude = Number(complaint.latitude);
          const longitude = Number(complaint.longitude);

          if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            return null;
          }

          const markerColor = getMarkerColor(complaint.priority);

          return (
            <CircleMarker
              key={complaint.id}
              center={[latitude, longitude]}
              radius={9}
              pathOptions={{
                color: markerColor,
                fillColor: markerColor,
                fillOpacity: 0.85,
              }}
            >
              <Popup>
                <div>
                  <strong>{complaint.title}</strong>
                  <br />
                  Category: {complaint.category}
                  <br />
                  Priority: {complaint.priority}
                  <br />
                  Status: {complaint.status}
                  <br />
                  Location: {complaint.location}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}