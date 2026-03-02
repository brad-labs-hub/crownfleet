import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-background">
      <h1 className="text-3xl font-bold text-neutral-900 mb-2">
        Fleet Manager
      </h1>
      <p className="text-muted-foreground mb-8 text-center max-w-md">
        Manage your family fleet of vehicles, maintenance records, receipts, and
        more.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="px-6 py-3 bg-primary text-primary-foreground text-white rounded-lg font-medium hover:bg-primary/90 transition"
        >
          Sign In
        </Link>
        <Link
          href="/signup"
          className="px-6 py-3 border border border-input rounded-lg font-medium hover:bg-neutral-100 transition"
        >
          Sign Up
        </Link>
      </div>
    </main>
  );
}
