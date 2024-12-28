import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../[...nextauth]/auth';

export async function GET(request: Request, context: any) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session in token route:', session);
    
    if (!session?.user) {
      return new Response(
        JSON.stringify({ error: 'Not authenticated' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error getting session:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 