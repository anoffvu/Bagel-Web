'use client';

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-foreground">Welcome to Sage</h1>
          <p className="text-muted-foreground">Sign in to manage your bot and subscription</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-background/50 border-border"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-background/50 border-border"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full bg-primary hover:bg-primary/90"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Button variant="link" className="p-0 h-auto" onClick={() => window.location.href = '/auth/signup'}>
              Sign up
            </Button>
          </p>
          <Button variant="link" className="text-sm p-0 h-auto" onClick={() => window.location.href = '/auth/reset-password'}>
            Forgot your password?
          </Button>
        </div>
      </div>
    </div>
  );
} 