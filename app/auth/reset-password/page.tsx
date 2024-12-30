'use client';

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { useState } from "react";

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
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
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Check Your Email</h1>
            <p className="text-muted-foreground">
              We've sent you instructions to reset your password. Please check your email.
            </p>
          </div>
          
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => window.location.href = '/auth/signin'}
          >
            Return to Sign In
          </Button>
        </div>
      </div>
    );
  }

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
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Reset Password</h1>
          <p className="text-muted-foreground">Enter your email to receive reset instructions</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-background/50 border-border"
          />

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full bg-primary hover:bg-primary/90"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Reset Instructions'}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground">
          Remember your password?{' '}
          <Button variant="link" className="p-0 h-auto" onClick={() => window.location.href = '/auth/signin'}>
            Sign in
          </Button>
        </p>
      </div>
    </div>
  );
} 