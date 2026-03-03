"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Upload, FileText, X } from "lucide-react";

type DocType = "insurance" | "registration" | "maintenance" | "misc";

type Vehicle = { id: string; make: string; model: string; year: number };

export function BulkImportForm({ vehicles }: { vehicles: Vehicle[] }) {
  const [vehicleId, setVehicleId] = useState("");
  const [docType, setDocType] = useState<DocType>("maintenance");
  const [files, setFiles] = useState<File[]>([]);
  const [applyToAll, setApplyToAll] = useState(true);
  const [provider, setProvider] = useState("");
  const [policyNumber, setPolicyNumber] = useState("");
  const [insuranceExpiry, setInsuranceExpiry] = useState("");
  const [state, setState] = useState("");
  const [registrationExpiry, setRegistrationExpiry] = useState("");
  const [titles, setTitles] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    const allowed = selected.filter(
      (f) =>
        f.type === "application/pdf" ||
        f.type.startsWith("image/")
    );
    setFiles((prev) => [...prev, ...allowed]);
    setTitles((prev) => {
      const next = { ...prev };
      allowed.forEach((f, i) => {
        const idx = files.length + i;
        next[idx] = f.name.replace(/\.[^.]+$/, "") || f.name;
      });
      return next;
    });
    e.target.value = "";
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setTitles((prev) => {
      const next = { ...prev };
      delete next[index];
      const rekey: Record<number, string> = {};
      Object.entries(next).forEach(([k, v]) => {
        const ki = parseInt(k, 10);
        if (ki > index) rekey[ki - 1] = v;
        else rekey[ki] = v;
      });
      return rekey;
    });
  }

  function setTitle(index: number, title: string) {
    setTitles((prev) => ({ ...prev, [index]: title }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!vehicleId || files.length === 0) {
      setError("Select a vehicle and at least one file.");
      return;
    }
    if (docType === "insurance" && (!provider.trim() || !insuranceExpiry)) {
      setError("Provider and expiry date are required for insurance.");
      return;
    }
    if (docType === "registration" && (!state.trim() || !registrationExpiry)) {
      setError("State and expiry date are required for registration.");
      return;
    }
    if (docType === "maintenance" || docType === "misc") {
      const missing = files.some((_, i) => !(titles[i] ?? "").trim());
      if (missing) {
        setError("Every file needs a title for maintenance/misc.");
        return;
      }
    }

    setLoading(true);
    setProgress({ current: 0, total: files.length });

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split(".").pop() ?? "pdf";
        const path = `${vehicleId}/${docType}-${Date.now()}-${i}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("receipts")
          .upload(path, file, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("receipts").getPublicUrl(path);

        if (docType === "insurance") {
          await supabase.from("insurance").insert({
            vehicle_id: vehicleId,
            provider: provider.trim(),
            policy_number: applyToAll ? (policyNumber.trim() || null) : null,
            expiry_date: insuranceExpiry,
            document_url: urlData.publicUrl,
          });
        } else if (docType === "registration") {
          await supabase.from("registrations").insert({
            vehicle_id: vehicleId,
            state: state.trim(),
            expiry_date: registrationExpiry,
            document_url: urlData.publicUrl,
          });
        } else {
          const title = (titles[i] ?? file.name).trim().replace(/\.[^.]+$/, "") || file.name;
          await supabase.from("vehicle_documents").insert({
            vehicle_id: vehicleId,
            doc_type: docType,
            title,
            document_url: urlData.publicUrl,
          });
        }
        setProgress((p) => ({ ...p, current: i + 1 }));
      }
      router.refresh();
      setFiles([]);
      setTitles({});
      setProgress({ current: 0, total: 0 });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold text-foreground">Import</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="vehicle">Vehicle *</Label>
            <select
              id="vehicle"
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className="w-full mt-1 px-4 py-2 border border-input rounded-md bg-background text-foreground"
            >
              <option value="">— Select vehicle —</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.year} {v.make} {v.model}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="docType">Document type *</Label>
            <select
              id="docType"
              value={docType}
              onChange={(e) => setDocType(e.target.value as DocType)}
              className="w-full mt-1 px-4 py-2 border border-input rounded-md bg-background text-foreground"
            >
              <option value="insurance">Insurance</option>
              <option value="registration">Registration</option>
              <option value="maintenance">Maintenance</option>
              <option value="misc">Misc</option>
            </select>
          </div>

          {(docType === "insurance" || docType === "registration") && (
            <div className="space-y-3 p-4 rounded-lg border border-border bg-muted/30">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={applyToAll}
                  onChange={(e) => setApplyToAll(e.target.checked)}
                />
                Apply same details to all files
              </label>
              {docType === "insurance" && (
                <>
                  <div>
                    <Label htmlFor="provider">Provider *</Label>
                    <Input
                      id="provider"
                      value={provider}
                      onChange={(e) => setProvider(e.target.value)}
                      placeholder="e.g. State Farm"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="policyNumber">Policy number</Label>
                    <Input
                      id="policyNumber"
                      value={policyNumber}
                      onChange={(e) => setPolicyNumber(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="insuranceExpiry">Expiry date *</Label>
                    <Input
                      id="insuranceExpiry"
                      type="date"
                      value={insuranceExpiry}
                      onChange={(e) => setInsuranceExpiry(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </>
              )}
              {docType === "registration" && (
                <>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. NY"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="registrationExpiry">Expiry date *</Label>
                    <Input
                      id="registrationExpiry"
                      type="date"
                      value={registrationExpiry}
                      onChange={(e) => setRegistrationExpiry(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>Files * (PDF, JPG, PNG)</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-2 py-8 px-4 rounded-xl border-2 border-dashed border-primary/50 bg-primary/5 hover:bg-primary/10 hover:border-primary transition-colors text-foreground"
            >
              <Upload className="w-10 h-10 text-primary" />
              <span className="font-medium">Add files</span>
              <span className="text-sm text-muted-foreground">PDF, JPG or PNG — multiple allowed</span>
            </button>
            {files.length > 0 && (
              <ul className="space-y-2 mt-2">
                {files.map((file, i) => (
                  <li key={`${file.name}-${i}`} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20">
                    <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
                    {(docType === "maintenance" || docType === "misc") ? (
                      <Input
                        value={titles[i] ?? file.name}
                        onChange={(e) => setTitle(i, e.target.value)}
                        placeholder="Title"
                        className="flex-1 h-8"
                      />
                    ) : (
                      <span className="flex-1 truncate text-sm text-foreground">{file.name}</span>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(i)}
                      className="shrink-0"
                      aria-label="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {progress.total > 0 && loading && (
            <p className="text-sm text-muted-foreground">
              Uploaded {progress.current} of {progress.total}…
            </p>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={loading || files.length === 0}>
            {loading ? "Importing…" : `Import ${files.length} file${files.length !== 1 ? "s" : ""}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
