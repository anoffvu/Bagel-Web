'use client'

import { Button } from './components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './components/ui/card'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const router = useRouter()

  const handleSignIn = () => {
    console.log('Signing in')
    router.push('/api/auth/signin')
  }

  return (
    <div className='relative min-h-screen bg-background overflow-hidden'>
      {/* Gradient background */}
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#17003d,transparent_70%)]' />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      {/* Ambient light effects */}
      <div className='absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-20%,hsl(var(--primary))_5%,transparent_60%)] blur-3xl opacity-30' />
      <div className='absolute inset-0 bg-[radial-gradient(circle_800px_at_80%_50%,hsl(var(--primary))_5%,transparent_60%)] blur-3xl opacity-20' />
      <div className='absolute inset-0 bg-[radial-gradient(circle_800px_at_20%_50%,hsl(var(--primary))_5%,transparent_60%)] blur-3xl opacity-20' />

      <div className='relative'>
        {/* Navigation */}
        <nav className='absolute top-0 right-0 p-6'>
          <Button
            variant='ghost'
            className='text-muted-foreground hover:text-foreground'
            onClick={handleSignIn}
          >
            Sign In
          </Button>
        </nav>

        <div className='container mx-auto px-4 py-24'>
          <div className='text-center mb-12 space-y-6'>
            <div className='inline-block'>
              <h1 className='text-7xl font-bold text-foreground leading-tight'>
                Meet Bagel Bot
              </h1>
              <div className='h-1 w-full bg-gradient-to-r from-primary to-[#9f24f2] rounded-full mt-2' />
            </div>
            <p className='text-xl text-muted-foreground max-w-[600px] mx-auto py-8'>
              Your intelligent Discord bot that brings AI-powered community
              connections, engagement, and marketing content generation.
            </p>

            <div className='flex items-center justify-center gap-4'>
              <Button
                size='lg'
                className='bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 h-12 transition-all hover:scale-105 group'
                onClick={handleSignIn}
              >
                Get Started
                <span className='ml-2 text-xs text-primary-foreground/80 group-hover:text-primary-foreground'>
                  — Free Trial
                </span>
              </Button>
              <Button
                size='lg'
                variant='outline'
                className='border-primary text-foreground hover:bg-primary/10 rounded-full px-8 h-12 transition-all hover:scale-105'
                onClick={() => router.push('/docs/commands')}
              >
                View Documentation
              </Button>
            </div>
          </div>

          <div className='grid md:grid-cols-3 gap-6 relative'>
            <Card className='group bg-card/50 border-border backdrop-blur-xl hover:border-primary/50 transition-all hover:-translate-y-1'>
              <CardHeader>
                <CardTitle className='text-xl text-foreground'>Sage</CardTitle>
                <CardDescription>
                  Chat with a bot trained on your community's knowledge
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className='text-muted-foreground'>
                  Allow members to ask questions, get explanations, and have
                  meaningful discussions with our AI assistant that uses in
                  community learning and direct citations from members.
                </p>
              </CardContent>
            </Card>

            <Card className='group bg-card/50 border-border backdrop-blur-xl hover:border-primary/50 transition-all hover:-translate-y-1'>
              <CardHeader>
                <CardTitle className='text-xl text-foreground'>
                  Member Matching
                </CardTitle>
                <CardDescription>
                  Connect with like-minded members using AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className='text-muted-foreground'>
                  Plug into your #introductions channel and connect community
                  members with similar interests, background, and goals. All
                  based on Bagel's matchmaking AI.
                </p>
              </CardContent>
            </Card>

            <Card className='group bg-card/50 border-border backdrop-blur-xl hover:border-primary/50 transition-all hover:-translate-y-1'>
              <CardHeader>
                <CardTitle className='text-xl text-foreground'>
                  Weekly Summaries
                </CardTitle>
                <CardDescription>
                  Never miss important community moments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className='text-muted-foreground'>
                  Create a weekly newsletter to summarize your community's
                  activity and learnings to allow members to quickly catch up,
                  stay engaged, and get value each week.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className='text-center mt-12'>
            <p className='text-muted-foreground'>
              Turn community chatter, #introductions, and weekly summaries into
              higher engagement, retention, and actionable insights.
            </p>
            <p className='text-muted-foreground mb-4 mt-16'>
              Start with {process.env.NEXT_PUBLIC_TRIAL_MESSAGE_LIMIT || 20}{' '}
              free messages
            </p>
            <Button
              variant='outline'
              className='border-primary text-muted-foreground hover:text-foreground hover:border-primary/90 hover:bg-primary/10'
              onClick={handleSignIn}
            >
              View Pricing
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
