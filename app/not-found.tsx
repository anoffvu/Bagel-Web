'use client';

import { Button } from "@/app/components/ui/button";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold text-foreground">404 - Page Not Found</h1>
        <p className="text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button
          onClick={() => router.push('/')}
          variant="outline"
        >
          Go Home
        </Button>
      </div>
    </div>
  );
} 