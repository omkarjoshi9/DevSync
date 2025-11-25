import { ModeToggle } from "@/components/mode-toggle"
import { SignupForm } from "@/components/signup-form"
import { ThemeProvider } from "@/components/theme-provider"

export default function SignupPage() {
  return (
    <ThemeProvider>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <div className="relative flex flex-1 flex-col lg:flex-row">
          <div className="relative hidden flex-1 flex-col justify-between overflow-hidden rounded-b-3xl bg-gradient-to-br from-emerald-400/40 via-indigo-900 to-black px-10 py-12 text-white shadow-2xl lg:flex">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.15),_transparent_55%)]" />
            <div className="relative z-10 max-w-md space-y-6">
              <p className="text-sm uppercase tracking-[0.4em] text-white/70">
                Welcome to DevSync
              </p>
              <h2 className="text-4xl font-semibold leading-tight">
                Spin up collaborative rooms your teammates actually enjoy.
              </h2>
              <p className="text-base text-white/70">
                Create an account to host unlimited ephemeral rooms, capture
                rich notes, and invite collaborators with a single secure link.
              </p>
            </div>
            <div className="relative z-10 space-y-2 text-sm text-white/70">
              <p>• SOC2-ready infrastructure.</p>
              <p>• Pairing, interviews, onboarding workflows.</p>
              <p>• Built for hybrid teams shipping 24/7.</p>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
            <div className="w-full max-w-md rounded-3xl border border-border/70 bg-card/80 p-8 shadow-2xl shadow-primary/10 backdrop-blur">
              <div className="mb-8 flex items-center justify-between">
                <a href="/" className="text-2xl font-semibold tracking-tight">
                  DevSync
                </a>
                <ModeToggle />
              </div>
              <SignupForm />
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}
