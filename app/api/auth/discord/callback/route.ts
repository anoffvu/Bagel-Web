import { NextResponse } from 'next/server';
import { associateUserWithGuild, trackGuild } from '@/app/services/guild';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../[...nextauth]/auth';

const DISCORD_API_URL = 'https://discord.com/api/v10';

export async function GET(request: Request) {
  try {
    // Get the user's session first
    const session = await getServerSession(authOptions);
    console.log('Session state:', {
      exists: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
    });
    
    if (!session?.user?.id) {
      console.log('No authenticated session found');
      // Store the original URL as the callback URL
      const callbackUrl = request.url;
      return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`, request.url));
    }

    // Validate environment variables first
    if (!process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID) {
      console.error('Missing NEXT_PUBLIC_DISCORD_CLIENT_ID environment variable');
      return NextResponse.redirect(new URL('/auth/error?error=ConfigError&details=Missing+client+ID', request.url));
    }

    if (!process.env.DISCORD_CLIENT_SECRET) {
      console.error('Missing DISCORD_CLIENT_SECRET environment variable');
      return NextResponse.redirect(new URL('/auth/error?error=ConfigError&details=Missing+client+secret', request.url));
    }

    if (!process.env.NEXT_PUBLIC_APP_URL) {
      console.error('Missing NEXT_PUBLIC_APP_URL environment variable');
      return NextResponse.redirect(new URL('/auth/error?error=ConfigError&details=Missing+app+URL', request.url));
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const guildId = searchParams.get('guild_id');
    
    if (!code || !guildId) {
      console.error('Missing required parameters:', { code: !!code, guildId: !!guildId });
      return NextResponse.redirect(new URL('/auth/error?error=NoCode', request.url));
    }

    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/discord/callback`;
    console.log('OAuth2 Configuration:', {
      clientId: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID,
      redirectUri,
      hasClientSecret: !!process.env.DISCORD_CLIENT_SECRET,
      guildId,
      hasCode: !!code
    });

    // Exchange code for access token
    const tokenResponse = await fetch(`${DISCORD_API_URL}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorText,
        requestBody: {
          client_id: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID,
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
        }
      });
      throw new Error(`Failed to get access token: ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('Successfully obtained access token');

    const userResponse = await fetch(`${DISCORD_API_URL}/users/@me`, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user information');
    }

    const userData = await userResponse.json();

    // Get guild information
    const guildResponse = await fetch(`${DISCORD_API_URL}/guilds/${guildId}`, {
      headers: {
        Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      },
    });

    if (!guildResponse.ok) {
      throw new Error('Failed to get guild information');
    }

    const guildData = await guildResponse.json();
    
    // Use the Discord user ID from the OAuth response
    const discordUserId = userData.id;
    // Use the authenticated user's ID from the session
    const supabaseUserId = session.user.id;
    
    if (!supabaseUserId) {
      throw new Error('No Supabase user ID provided');
    }
    
    // Store the guild and associate it with both user IDs
    await trackGuild({ id: guildId, name: guildData.name } as any, discordUserId);
    await associateUserWithGuild(guildId, discordUserId, supabaseUserId);
    
    // Redirect to success page or dashboard
    return NextResponse.redirect(new URL('/dashboard?success=true', request.url));
  } catch (error) {
    console.error('OAuth callback error:', error);
    // Include error details in the redirect
    const errorMessage = error instanceof Error ? encodeURIComponent(error.message) : 'Unknown error';
    return NextResponse.redirect(new URL(`/auth/error?error=OAuthError&details=${errorMessage}`, request.url));
  }
} 