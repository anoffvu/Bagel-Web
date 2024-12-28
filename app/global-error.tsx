'use client';
 
import { Button } from "@/app/components/ui/button";
import { useRouter } from "next/navigation";
 
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <html>
      <body>
        <div className="min-h-screen bg-background flex flex-col items-center justify-center">
          <div className="space-y-4 text-center">
            <h1 className="text-4xl font-bold text-foreground">Something went wrong!</h1>
            <p className="text-muted-foreground">
              {error.message || 'An unexpected error occurred'}
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => router.push('/')}
                variant="outline"
              >
                Go Home
              </Button>
              <Button
                onClick={() => reset()}
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
} 