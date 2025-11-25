import '../App.css'
import { ThemeProvider } from "../components/theme-provider"

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Mail, MessageSquare, Phone, Clock } from 'lucide-react'

const contactMethods = [
  {
    title: 'Talk to us',
    description: '+1 (415) 555‑0138 · Mon–Fri, 9a–6p PT',
    icon: Phone,
  },
  {
    title: 'Drop a line',
    description: 'team@devsync.app',
    icon: Mail,
  },
  {
    title: 'Slack us',
    description: 'Join the DevSync community for live updates.',
    icon: MessageSquare,
  },
  {
    title: 'Response time',
    description: 'We reply within one business day.',
    icon: Clock,
  },
]

const Contact = () => {
  return (
    <ThemeProvider>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1 bg-muted/20">
          <div className="container mx-auto grid gap-8 px-4 py-16 lg:grid-cols-[1.1fr_0.9fr]">
            <Card className="order-2 border border-border/70 bg-card/80 shadow-xl shadow-primary/5 backdrop-blur lg:order-1">
              <CardHeader>
                <CardTitle>Tell us about your team</CardTitle>
                <CardDescription>
                  Share a bit of context and we’ll route you to the right
                  humans—no bots.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                      Your name
                    </p>
                    <Input placeholder="Jordan Parks" />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                      Email
                    </p>
                    <Input type="email" placeholder="you@company.com" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                      Team size
                    </p>
                    <Input placeholder="15 engineers" />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                      Use case
                    </p>
                    <Input placeholder="Pairing, interviews,..." />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                    Message
                  </p>
                  <Textarea
                    placeholder="Walk us through your workflow, pain points, or timeline..."
                    className="min-h-[160px]"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="lg">Send message</Button>
                  <p className="text-sm text-muted-foreground">
                    Expect a response within 24 hours.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="order-1 border border-border/70 bg-gradient-to-br from-primary/10 via-card/90 to-primary/5 p-6 text-foreground shadow-lg backdrop-blur lg:order-2">
              <CardHeader>
                <CardTitle>We’re here for real-time teams</CardTitle>
                <CardDescription>
                  Reach out any time—we love hearing how you collaborate.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {contactMethods.map(({ title, description, icon: Icon }) => (
                  <div
                    key={title}
                    className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/60 p-4 shadow-sm"
                  >
                    <Icon className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-semibold">{title}</p>
                      <p className="text-sm text-muted-foreground">
                        {description}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  )
}

export default Contact
