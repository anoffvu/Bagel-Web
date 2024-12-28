import NextAuth from "next-auth"
import { authOptions } from "./auth"

async function handler(req: Request, context: any) {
  const nextauth = await NextAuth(authOptions)
  return nextauth(req, context)
}

export { handler as GET, handler as POST } 