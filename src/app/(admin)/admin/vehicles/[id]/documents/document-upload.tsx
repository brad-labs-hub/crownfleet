"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type DocType = "insurance" | "registration" | "maintenance" | "misc";

export function DocumentUpload({ vehicleId }: { vehicleId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<DocType>("insurance");
  const [provider, setProvider] = useState("");
  const [policyNumber, setPolicyNumber] = useState("");
  const [insuranceExpiry, setInsuranceExpiry] = useState("");
  const [state, setState] = useState("");
  const [registrationExpiry, setRegistrationExpiry] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    if (docType === "insurance" && (!provider.trim() || !insuranceExpiry)) {
      setError("Provider and expiry date are required for insurance.");
      return;
    }
    if (docType === "registration" && (!state.trim() || !registrationExpiry)) {
      setError("State and expiry date are required for registration.");
      return;
    }
    if ((docType === "maintenance" || docType === "misc") && !title.trim()) {
      setError("Title is required.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const ext = file.name.split(".").pop() ?? "pdf";
      const path = `${vehicleId}/${docType}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("receipts").getPublicUrl(path);

      if (docType === "insurance") {
        await supabase.from("insurance").insert({
          vehicle_id: vehicleId,
          provider: provider.trim(),
          policy_number: policyNumber.trim() || null,
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
        await supabase.from("vehicle_documents").insert({
          vehicle_id: vehicleId,
          doc_type: docType,
          title: title.trim(),
          document_url: urlData.publicUrl,
        });
      }
      setFile(null);
      setProvider("");
      setPolicyNumber("");
      setInsuranceExpiry("");
      setState("");
      setRegistrationExpiry("");
      setTitle("");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleUpload} className="space-y-4">
      <div>
        <Label htmlFor="docType">Document Type</Label>
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

      {docType === "insurance" && (
        <>
          <div>
            <Label htmlFor="provider">Provider *</Label>
            <Input
              id="provider"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              placeholder="e.g. State Farm"
              required
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
              required
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
              required
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
              required
              className="mt-1"
            />
          </div>
        </>
      )}

      {(docType === "maintenance" || docType === "misc") && (
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={docType === "maintenance" ? "e.g. Oil change receipt 2024" : "e.g. Title"}
            required
            className="mt-1"
          />
        </div>
      )}

      <div>
        <Label htmlFor="file">File *</Label>
        <Input
          id="file"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="mt-1"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={!file || loading}>
        {loading ? "Uploading…" : "Upload"}
      </Button>
    </form>
  );
}
