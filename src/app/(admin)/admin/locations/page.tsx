"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MapPin, Car } from "lucide-react";
import type { Location } from "@/types/database";

// Dynamically import the map so it's never server-rendered (Leaflet needs DOM)
const LocationMap = dynamic(() => import("./location-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-muted/30 rounded-lg">
      <p className="text-muted-foreground text-sm">Loading map…</p>
    </div>
  ),
});

type GeoLocation = { lat: number; lng: number };
type LocationWithCount = Location & { vehicle_count: number } & Partial<GeoLocation>;
type MappableLocation = Location & { vehicle_count: number; lat: number; lng: number };

const supabase = createClient();

// Nominatim geocode (OpenStreetMap, no API key required)
async function geocodeAddress(address: string): Promise<GeoLocation | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: { "User-Agent": "FleetManager/1.0" },
    });
    const data = await res.json();
    if (data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
    return null;
  } catch {
    return null;
  }
}

export default function AdminLocationsPage() {
  const [locations, setLocations] = useState<LocationWithCount[]>([]);
  const [mappable, setMappable] = useState<MappableLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [geocoding, setGeocoding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [showAdd, setShowAdd] = useState(false);
  const [addCode, setAddCode] = useState("");
  const [addName, setAddName] = useState("");
  const [addAddress, setAddAddress] = useState("");
  const [addSubmitting, setAddSubmitting] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCode, setEditCode] = useState("");
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [locRes, vehRes] = await Promise.all([
        supabase.from("locations").select("id, code, name, address, created_at").order("name"),
        supabase.from("vehicles").select("location_id"),
      ]);
      if (locRes.error) throw locRes.error;

      const counts: Record<string, number> = {};
      (vehRes.data ?? []).forEach((v) => {
        if (v.location_id) counts[v.location_id] = (counts[v.location_id] ?? 0) + 1;
      });

      const withCount: LocationWithCount[] = (locRes.data ?? []).map((l) => ({
        ...l,
        vehicle_count: counts[l.id] ?? 0,
      }));
      setLocations(withCount);
      return withCount;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load locations");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const geocodeAll = useCallback(async (locs: LocationWithCount[]) => {
    if (locs.length === 0) return;
    setGeocoding(true);
    const results: MappableLocation[] = [];
    for (const loc of locs) {
      const geo = await geocodeAddress(loc.address);
      if (geo) results.push({ ...loc, lat: geo.lat, lng: geo.lng });
      // Small delay to respect Nominatim rate limit (1 req/sec)
      await new Promise((r) => setTimeout(r, 300));
    }
    setMappable(results);
    setGeocoding(false);
  }, []);

  useEffect(() => {
    load().then((locs) => {
      if (locs.length > 0) geocodeAll(locs);
    });
  }, [load, geocodeAll]);

  // Scroll selected row into view
  useEffect(() => {
    if (selectedId && rowRefs.current[selectedId]) {
      rowRefs.current[selectedId]!.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [selectedId]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddSubmitting(true);
    setError(null);
    try {
      const { error } = await supabase.from("locations").insert({
        code: addCode.trim(),
        name: addName.trim(),
        address: addAddress.trim(),
      });
      if (error) throw error;
      setAddCode(""); setAddName(""); setAddAddress(""); setShowAdd(false);
      const locs = await load();
      geocodeAll(locs);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add location");
    } finally {
      setAddSubmitting(false);
    }
  }

  function startEdit(loc: Location) {
    setEditingId(loc.id);
    setEditCode(loc.code);
    setEditName(loc.name);
    setEditAddress(loc.address);
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setEditSubmitting(true);
    setError(null);
    try {
      const { error } = await supabase
        .from("locations")
        .update({ code: editCode.trim(), name: editName.trim(), address: editAddress.trim() })
        .eq("id", editingId);
      if (error) throw error;
      setEditingId(null);
      const locs = await load();
      geocodeAll(locs);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update location");
    } finally {
      setEditSubmitting(false);
    }
  }

  async function handleDelete(loc: LocationWithCount) {
    const message =
      loc.vehicle_count > 0
        ? `"${loc.name}" has ${loc.vehicle_count} vehicle(s). Their location will be cleared. Delete anyway?`
        : `Delete "${loc.name}"?`;
    if (!confirm(message)) return;
    setDeletingId(loc.id);
    setError(null);
    try {
      const { error } = await supabase.from("locations").delete().eq("id", loc.id);
      if (error) throw error;
      if (selectedId === loc.id) setSelectedId(null);
      const locs = await load();
      geocodeAll(locs);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete location");
    } finally {
      setDeletingId(null);
    }
  }

  function handleSelectFromMap(id: string) {
    setSelectedId(id);
  }

  function handleSelectFromList(id: string) {
    setSelectedId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">Locations</h1>
        <div className="flex items-center gap-3">
          {geocoding && (
            <span className="text-xs text-muted-foreground animate-pulse">Geocoding addresses…</span>
          )}
          {!showAdd && (
            <Button type="button" onClick={() => setShowAdd(true)}>
              Add Location
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 text-destructive px-4 py-2 text-sm">{error}</div>
      )}

      {/* Map */}
      {!loading && (
        <Card className="overflow-hidden">
          <div className="h-[420px] w-full relative">
            {mappable.length > 0 ? (
              <LocationMap
                locations={mappable}
                selectedId={selectedId}
                onSelect={handleSelectFromMap}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-2 bg-muted/20">
                <MapPin className="h-8 w-8 text-muted-foreground/50" />
                <p className="text-muted-foreground text-sm">
                  {geocoding ? "Geocoding addresses…" : "No locations to display on map"}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Add form */}
      {showAdd && (
        <Card>
          <CardHeader className="pb-2">
            <h2 className="text-lg font-semibold text-foreground">New Location</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-4 max-w-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="add-code">Code</Label>
                  <Input
                    id="add-code"
                    value={addCode}
                    onChange={(e) => setAddCode(e.target.value)}
                    placeholder="e.g. 858"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="add-name">Name</Label>
                  <Input
                    id="add-name"
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    placeholder="Display name"
                    required
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="add-address">Address</Label>
                <Input
                  id="add-address"
                  value={addAddress}
                  onChange={(e) => setAddAddress(e.target.value)}
                  placeholder="Full address for map pin"
                  required
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={addSubmitting}>
                  {addSubmitting ? "Adding…" : "Add"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowAdd(false); setAddCode(""); setAddName(""); setAddAddress(""); }}
                  disabled={addSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Locations list */}
      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : (
        <div className="space-y-3" ref={listRef}>
          <p className="text-sm text-muted-foreground">
            {locations.length} location{locations.length !== 1 ? "s" : ""} — click a row or map pin to highlight
          </p>
          {locations.map((loc) => (
            <div
              key={loc.id}
              ref={(el) => { rowRefs.current[loc.id] = el; }}
            >
              <Card
                className={`transition-all duration-200 cursor-pointer ${
                  selectedId === loc.id
                    ? "ring-2 ring-primary shadow-md"
                    : "hover:shadow-sm"
                }`}
                onClick={() => {
                  if (editingId !== loc.id) handleSelectFromList(loc.id);
                }}
              >
                <CardContent className="p-4">
                  {editingId === loc.id ? (
                    <form
                      onSubmit={handleSaveEdit}
                      className="space-y-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                          <Label htmlFor="edit-code">Code</Label>
                          <Input
                            id="edit-code"
                            value={editCode}
                            onChange={(e) => setEditCode(e.target.value)}
                            required
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-name">Name</Label>
                          <Input
                            id="edit-name"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            required
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-address">Address</Label>
                          <Input
                            id="edit-address"
                            value={editAddress}
                            onChange={(e) => setEditAddress(e.target.value)}
                            required
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" disabled={editSubmitting}>
                          {editSubmitting ? "Saving…" : "Save"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={(e) => { e.stopPropagation(); setEditingId(null); }}
                          disabled={editSubmitting}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 p-1.5 rounded-full transition-colors ${
                            selectedId === loc.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <MapPin className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-foreground">{loc.name}</p>
                            <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-mono">
                              {loc.code}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">{loc.address}</p>
                          {loc.vehicle_count > 0 && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                              <Car className="h-3 w-3" />
                              {loc.vehicle_count} vehicle{loc.vehicle_count !== 1 ? "s" : ""}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(loc)}
                        >
                          Rename
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleDelete(loc)}
                          disabled={deletingId === loc.id}
                        >
                          {deletingId === loc.id ? "Deleting…" : "Remove"}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
          {locations.length === 0 && !showAdd && (
            <p className="text-muted-foreground text-center py-8">No locations. Add one to get started.</p>
          )}
        </div>
      )}
    </div>
  );
}
