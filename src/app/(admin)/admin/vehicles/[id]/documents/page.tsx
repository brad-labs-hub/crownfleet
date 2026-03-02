import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DocumentUpload } from "./document-upload";
import { InsuranceList, RegistrationsList, VehicleDocumentsList } from "./document-lists";
import { AddInsuranceForm, AddRegistrationForm } from "./insurance-registration-forms";

export default async function VehicleDocumentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: vehicle, error } = await supabase
    .from("vehicles")
    .select("id, make, model, year, insurance(*), registrations(*)")
    .eq("id", id)
    .single();

  if (error || !vehicle) notFound();

  const { data: vehicleDocuments } = await supabase
    .from("vehicle_documents")
    .select("id, doc_type, title, document_url, notes, created_at")
    .eq("vehicle_id", id)
    .order("created_at", { ascending: false });

  const docs = vehicleDocuments ?? [];
  const maintenanceDocs = docs.filter((d) => d.doc_type === "maintenance");
  const miscDocs = docs.filter((d) => d.doc_type === "misc");

  const insuranceItems = (vehicle.insurance as unknown as { id: string; provider: string; policy_number: string | null; expiry_date: string; document_url: string | null }[]) ?? [];
  const registrationItems = (vehicle.registrations as unknown as { id: string; state: string; expiry_date: string; document_url: string | null }[]) ?? [];

  return (
    <div className="space-y-6">
      <Link
        href={`/admin/vehicles/${id}`}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back
      </Link>
      <h1 className="text-2xl font-bold text-foreground">
        Documents — {vehicle.year} {vehicle.make} {vehicle.model}
      </h1>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center flex-wrap gap-2">
            <h2 className="font-semibold text-foreground">Insurance</h2>
            <AddInsuranceForm vehicleId={id} />
          </div>
        </CardHeader>
        <CardContent>
          {insuranceItems.length ? (
            <InsuranceList items={insuranceItems} />
          ) : (
            <p className="text-muted-foreground text-sm">No insurance records. Use the button above to add one.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center flex-wrap gap-2">
            <h2 className="font-semibold text-foreground">Registrations</h2>
            <AddRegistrationForm vehicleId={id} />
          </div>
        </CardHeader>
        <CardContent>
          {registrationItems.length ? (
            <RegistrationsList items={registrationItems} />
          ) : (
            <p className="text-muted-foreground text-sm">No registration records. Use the button above to add one.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-foreground">Document Vault</h2>
          <p className="text-sm text-muted-foreground">
            Upload maintenance or misc vehicle documents (receipts, service records, title, etc.)
          </p>
        </CardHeader>
        <CardContent>
          <DocumentUpload vehicleId={id} />
        </CardContent>
      </Card>

      {maintenanceDocs.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-foreground">Maintenance Documents</h2>
          </CardHeader>
          <CardContent>
            <VehicleDocumentsList items={maintenanceDocs} />
          </CardContent>
        </Card>
      )}

      {miscDocs.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-foreground">Misc Documents</h2>
          </CardHeader>
          <CardContent>
            <VehicleDocumentsList items={miscDocs} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
