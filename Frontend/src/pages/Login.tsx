import { LoginForm } from "@/components/login-form"
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"

export default function LoginPage() {
  return (
    <ThemeProvider>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <div className="relative flex flex-1 flex-col lg:flex-row">
          <div className="relative hidden flex-1 flex-col justify-between overflow-hidden rounded-b-3xl bg-gradient-to-br from-primary/30 via-indigo-900 to-black px-10 py-12 text-white shadow-2xl lg:flex">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_55%)]" />
            <div className="relative z-10 max-w-md space-y-6">
              <p className="text-sm uppercase tracking-[0.4em] text-white/70">
                DevSync Sessions
              </p>
              <h2 className="text-4xl font-semibold leading-tight">
                Step into a shared IDE that keeps your team perfectly aligned.
              </h2>
              <p className="text-base text-white/70">
                Login to pick up exactly where you left off. Your rooms, notes,
                and code context stay synced across every device.
              </p>
            </div>
            <div className="relative z-10 space-y-2 text-sm text-white/70">
              <p>• Enterprise SSO & passwordless supported.</p>
              <p>• Role-based access, per-room controls.</p>
              <p>• Zero setup—just invite and build.</p>
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
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}
