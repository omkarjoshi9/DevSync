import '../App.css'
import { ThemeProvider } from "../components/theme-provider"
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Users } from 'lucide-react'

const About = () => {
  return (
    <ThemeProvider>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <Header />

        <main className="flex-1 space-y-12 pb-16">
          <section className="border-b border-border/70 bg-muted/20 py-12">
            <div className="container mx-auto px-4">
              <p className="text-sm uppercase tracking-[0.3em] text-primary">
                Meet DevSync
              </p>
              <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_0.6fr]">
                <div className="space-y-5">
                  <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
                    Purpose-built for teams who ship together—even when apart.
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    DevSync blends the fidelity of an IDE with the presence of a
                    war room. We obsess over details that keep engineers focused
                    on problems, not process.
                  </p>
                </div>
                <Card className="border-primary/20 bg-card/70 shadow-lg shadow-primary/10 backdrop-blur">
                  <CardHeader>
                    <CardTitle>What we believe</CardTitle>
                    <CardDescription>
                      Collaboration tools should stay out of the way and surface
                      context exactly when you need it.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 text-sm text-muted-foreground">
                    <p>• Remote-first shouldn’t mean compromise.</p>
                    <p>• Security and speed can—and must—coexist.</p>
                    <p>• Great tooling amplifies trust within teams.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          <section className="container mx-auto px-4">
            <Card className="bg-card/75 p-6 shadow-lg shadow-primary/5">
              <CardHeader className="flex flex-col gap-2 border-b border-border/60 pb-6">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border/60 px-3 py-1 text-xs uppercase tracking-[0.3em] text-primary">
                  Team
                  <Users className="h-4 w-4" />
                </div>
                <CardTitle>Omkar Joshi</CardTitle>
                <CardDescription>Full-stack developer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6 text-muted-foreground">
                <p>
                  Omkar steers DevSync’s product surface—from crafting the live
                  editor experience to ensuring the infrastructure feels
                  effortless for every collaborator. He blends systems thinking
                  with a human eye for delightful details.
                </p>
                <p>
                  When teams ask for a new ritual or workflow, Omkar is usually
                  the first to prototype it, stress-test it with customers, and
                  ship it with polish.
                </p>
              </CardContent>
            </Card>
          </section>
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  )
}

export default About
