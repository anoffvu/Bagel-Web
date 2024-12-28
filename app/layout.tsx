import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { getServerSession } from 'next-auth'
import AuthProvider from './components/providers/session-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BagelBot - AI Discord Assistant',
  description: 'Your intelligent Discord companion powered by AI',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession()

  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} dark bg-black antialiased`}>
        <AuthProvider session={session}>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
} 