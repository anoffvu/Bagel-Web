import { AuthOptions, User } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { createClient } from '@supabase/supabase-js'

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
    }
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name?: string | null;
  }
}

// Initialize Supabase client outside of the handler
const supabase = createClient(
  process.env.SUPABASE_API_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter your email and password')
        }

        try {
          const { data: { user }, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          })

          if (error || !user) {
            throw new Error('Invalid email or password')
          }

          const authUser = {
            id: user.id,
            email: user.email!,
            name: user.user_metadata?.name ?? null,
          } satisfies User;

          console.log('Authorized user:', authUser);
          return authUser;
        } catch (error) {
          console.error('Auth error:', error);
          throw error;
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        // Copy user properties to the token
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        console.log('JWT callback - user:', user);
        console.log('JWT callback - token after user copy:', token);
      }
      return token;
    },
    async session({ session, token }) {
      console.log('Session callback - input token:', token);
      // Copy token properties to the session
      session.user = {
        id: token.id,
        email: token.email,
        name: token.name,
      };
      console.log('Session callback - output session:', session);
      return session;
    }
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 // 30 days
      }
    },
    callbackUrl: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.callback-url' : 'next-auth.callback-url',
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development'
} 