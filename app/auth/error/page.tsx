'use client';

import { Button } from "@/app/components/ui/button";
import { useSearchParams } from "next/navigation";

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="relative min-h-screen bg-background overflow-hidden flex items-center justify-center">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#17003d,transparent_70%)]" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      
      {/* Ambient light effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-20%,hsl(var(--primary))_5%,transparent_60%)] blur-3xl opacity-30" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_80%_50%,hsl(var(--primary))_5%,transparent_60%)] blur-3xl opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_20%_50%,hsl(var(--primary))_5%,transparent_60%)] blur-3xl opacity-20" />

      <div className="relative z-10 text-center space-y-6 p-8 backdrop-blur-xl bg-card/30 border border-border rounded-lg max-w-md w-full mx-4">
        <h1 className="text-3xl font-bold text-foreground">Authentication Error</h1>
        <p className="text-muted-foreground">
          {error === "AccessDenied" 
            ? "You need to grant the required permissions to use Sage."
            : "There was an error signing you in. Please try again."}
        </p>
        
        <Button
          size="lg"
          className="w-full"
          onClick={() => window.location.href = '/'}
        >
          Return Home
        </Button>
      </div>
    </div>
  );
} 