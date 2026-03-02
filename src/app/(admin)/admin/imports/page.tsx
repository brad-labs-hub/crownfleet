import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ImportSection } from "./import-section";

export default function ImportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">Import Data</h1>
      <Card>
        <CardHeader>
          <h2 className="font-semibold">Cloud Storage Import</h2>
          <p className="text-sm text-muted-foreground">
            Connect OneDrive or Google Drive to import receipts and documents.
          </p>
        </CardHeader>
        <CardContent>
          <ImportSection />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <h2 className="font-semibold">File Upload</h2>
          <p className="text-sm text-muted-foreground">
            Upload files directly to create receipts or attach to vehicles.
          </p>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Direct file upload coming in Phase 3. Use the driver app to add
            receipts for now.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
