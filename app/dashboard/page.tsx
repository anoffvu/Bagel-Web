'use client';

import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Session } from "next-auth";
import { useRouter } from 'next/navigation';
import { Textarea } from "@/app/components/ui/textarea";
import { Pencil } from "lucide-react";
import { useToast } from "@/app/components/ui/use-toast";

// Update the session type to match our NextAuth configuration
interface ExtendedSession extends Session {
  user: {
    id: string;
    email: string;
    name?: string | null;
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Guild {
  id: string;
  name: string;
  hasActiveSubscription: boolean;
  messagesProcessed: string;
  lastActiveAt: string;
  subscriptionExpiryDate: string;
  description: string | null;
}

export default function Dashboard() {
  const { data: session, status } = useSession() as { data: ExtendedSession | null, status: "loading" | "authenticated" | "unauthenticated" };
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingDescription, setEditingDescription] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchGuilds = async () => {
      try {
        if (status !== "authenticated") {
          console.log('Not authenticated yet');
          return;
        }

        // Get the user ID from the token endpoint
        const tokenResponse = await fetch('/api/auth/token');
        const tokenData = await tokenResponse.json();
        console.log('Token data:', tokenData);

        if (!tokenData.id) {
          console.log('No user ID in token data');
          return;
        }

        const { data, error } = await supabase
          .from('guilds')
          .select('*, guild_users!inner(*)')
          .eq('guild_users.supabase_user_id', tokenData.id)
          .order('name');

        if (error) {
          console.error('Supabase query error:', error);
          throw error;
        }
        
        console.log('Fetched guilds:', data);

        setGuilds(data.map((guild) => ({
          ...guild,
          lastActiveAt: guild.last_active_at,
          messagesProcessed: guild.messages_processed.toString(),
          hasActiveSubscription: guild.has_active_subscription,
          subscriptionExpiryDate: guild.subscription_expiry_date,
          description: guild.description,
        })));
      } catch (error) {
        console.error('Error fetching guilds:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGuilds();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('guild-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'guilds'
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setGuilds(currentGuilds => 
              currentGuilds.map(guild => 
                guild.id === payload.new.id ? {
                  ...guild,
                  hasActiveSubscription: payload.new.has_active_subscription,
                  subscriptionExpiryDate: payload.new.subscription_expiry_date,
                  lastActiveAt: payload.new.last_active_at,
                  messagesProcessed: payload.new.messages_processed.toString(),
                } : guild
              )
            );
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [status]);

  const handleSubscribe = async (guildId: string) => {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guildId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (!data.url) {
        throw new Error('No checkout URL returned from server');
      }

      window.location.href = data.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  const handleUpdateDescription = async (guildId: string, description: string) => {
    try {
      await supabase
        .from('guilds')
        .update({ description })
        .eq('id', guildId);

      setGuilds(currentGuilds =>
        currentGuilds.map(guild =>
          guild.id === guildId ? { ...guild, description } : guild
        )
      );
      setEditingDescription(null);
    } catch (error) {
      console.error('Error updating description:', error);
    }
  };

  if (status === "loading") {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground">Loading...</p>
    </div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground mt-2">Manage your Discord server subscriptions</p>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">
                Signed in as {session.user?.email}
              </p>
              <Button
                variant="outline"
                onClick={handleLogout}
              >
                Sign Out
              </Button>
            </div>
          </div>

          <div>
            <Button
              className="mt-4 bg-[#5865F2] hover:bg-[#4752C4] text-white"
              onClick={() => {
                const baseUrl = 'https://discord.com/oauth2/authorize';
                const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/discord/callback`;
                
                // Create URL object for proper parameter handling
                const url = new URL(baseUrl);
                
                // Add required OAuth2 parameters
                url.searchParams.set('client_id', process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID ?? '');
                url.searchParams.set('permissions', process.env.NEXT_PUBLIC_DISCORD_BOT_PERMISSIONS ?? '0');
                url.searchParams.set('response_type', 'code');
                url.searchParams.set('scope', 'bot identify');
                url.searchParams.set('redirect_uri', redirectUri);
                
                console.log('Redirecting to Discord OAuth URL:', url.toString());
                // Navigate in the same window
                window.location.href = url.toString();
              }}
            >
              Add Bot to Server
            </Button>
          </div>

          {isLoading ? (
            <p className="text-muted-foreground">Loading servers...</p>
          ) : (
            <div className="grid gap-6">
              {guilds.map((guild) => (
                <Card key={guild.id}>
                  <CardHeader>
                    <CardTitle>{guild.name}</CardTitle>
                    <CardDescription>Server subscription and usage details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Community Description: </label>
                      {editingDescription === guild.id ? (
                        <div className="space-y-2">
                          <Textarea
                            placeholder="Describe your community..."
                            defaultValue={guild.description || ''}
                            className="min-h-[100px]"
                            data-guild-id={guild.id}
                            onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                              if (e.key === 'Enter' && e.metaKey) {
                                handleUpdateDescription(guild.id, (e.target as HTMLTextAreaElement).value);
                              }
                            }}
                          />
                          <div className="flex gap-2">
                            <Button
                              variant="default"
                              onClick={() => handleUpdateDescription(guild.id, (document.querySelector(`textarea[data-guild-id="${guild.id}"]`) as HTMLTextAreaElement)?.value || '')}
                            >
                              Save
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setEditingDescription(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 group">
                          <p className="text-sm text-muted-foreground">
                            {guild.description || 'No description set'}
                          </p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 -mr-1.5"
                            onClick={() => setEditingDescription(guild.id)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Subscription Status</span>
                      <span className={guild.hasActiveSubscription ? "text-emerald-500" : "text-yellow-500"} >
                        {guild.hasActiveSubscription ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {guild.hasActiveSubscription && guild.subscriptionExpiryDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Valid Until</span>
                        <span className="text-foreground">
                          {new Date(guild.subscriptionExpiryDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Messages Processed</span>
                      <span className="text-foreground">{guild.messagesProcessed}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Last Active</span>
                      <span className="text-foreground">
                        {new Date(guild.lastActiveAt).toLocaleDateString()}
                      </span>
                    </div>
                    {!guild.hasActiveSubscription && (
                      <Button
                        className="w-full bg-primary hover:bg-primary/90 mt-4"
                        onClick={() => handleSubscribe(guild.id)}
                      >
                        Subscribe Server
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 