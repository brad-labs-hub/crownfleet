"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Cloud, FileSpreadsheet } from "lucide-react";

function getAuthUrls() {
  if (typeof window === "undefined") return { oneDrive: "", google: "" };
  const origin = window.location.origin;
  const oneDrive = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${process.env.NEXT_PUBLIC_ONEDRIVE_CLIENT_ID ?? ""}&response_type=code&redirect_uri=${origin}/api/auth/onedrive/callback&scope=Files.Read%20offline_access`;
  const google = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ""}&redirect_uri=${origin}/api/auth/google/callback&response_type=code&scope=https://www.googleapis.com/auth/drive.readonly`;
  return { oneDrive, google };
}

export function ImportSection() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const { oneDrive, google } = getAuthUrls();
  const hasOneDriveConfig = !!process.env.NEXT_PUBLIC_ONEDRIVE_CLIENT_ID;
  const hasGoogleConfig = !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-sm text-red-600">
          {error === "config"
            ? "OAuth not configured. Set client ID/secret in env."
            : error}
        </p>
      )}
      <div className="flex gap-4">
        <Button variant="outline" className="flex items-center gap-2" asChild disabled={!hasOneDriveConfig}>
          <a href={oneDrive}>
            <Cloud className="h-4 w-4" />
            Connect OneDrive
          </a>
        </Button>
        <Button variant="outline" className="flex items-center gap-2" asChild disabled={!hasGoogleConfig}>
          <a href={google}>
            <FileSpreadsheet className="h-4 w-4" />
            Connect Google Drive
          </a>
        </Button>
      </div>
      {(!hasOneDriveConfig || !hasGoogleConfig) && (
        <p className="text-sm text-muted-foreground">
          Set NEXT_PUBLIC_ONEDRIVE_CLIENT_ID and NEXT_PUBLIC_GOOGLE_CLIENT_ID in
          .env.local to enable cloud imports.
        </p>
      )}
    </div>
  );
}
