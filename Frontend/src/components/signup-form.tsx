import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/useAuth"

declare global {
  interface Window {
    google: any;
  }
}

export function SignupForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleButtonReady, setGoogleButtonReady] = useState(false)
  const { register, googleAuth } = useAuth()
  const googleButtonRef = useRef<HTMLDivElement>(null)

  // Get Google Client ID from env
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ""

  useEffect(() => {
    // Debug: Log the client ID
    console.log('Google Client ID:', GOOGLE_CLIENT_ID ? 'Set' : 'Not set')
    console.log('All env vars:', import.meta.env)

    // Wait for Google Identity Services to load
    const initGoogleSignIn = () => {
      if (window.google && googleButtonRef.current && GOOGLE_CLIENT_ID) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleResponse,
          })

          window.google.accounts.id.renderButton(
            googleButtonRef.current,
            {
              theme: "outline",
              size: "large",
              width: "100%",
              text: "signup_with",
            }
          )
          setGoogleButtonReady(true)
        } catch (err) {
          console.error('Google button initialization failed:', err)
        }
      }
    }

    // Try immediately
    if (window.google) {
      initGoogleSignIn()
    } else {
      // Check periodically for Google script to load
      const interval = setInterval(() => {
        if (window.google) {
          clearInterval(interval)
          initGoogleSignIn()
        }
      }, 100)

      // Stop checking after 5 seconds
      setTimeout(() => clearInterval(interval), 5000)

      return () => clearInterval(interval)
    }
  }, [GOOGLE_CLIENT_ID])

  const handleGoogleResponse = async (response: any) => {
    setLoading(true)
    setError("")
    
    try {
      const result = await googleAuth(response.credential)
      if (!result.success) {
        setError(result.error || "Google authentication failed")
      }
    } catch (err) {
      setError("An error occurred during Google authentication")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await register(email, password, firstName, lastName)
      if (!result.success) {
        setError(result.error || "Registration failed")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={handleSubmit}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your details below to sign up for Devsync
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="first-name">First name</Label>
            <Input 
              id="first-name" 
              placeholder="First name" 
              required 
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="last-name">Last name</Label>
            <Input 
              id="last-name" 
              placeholder="Last name" 
              required 
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email Address</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="m@example.com" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input 
            id="password" 
            type="password" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            minLength={8}
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account..." : "Sign up"}
        </Button>
        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
        {/* Google Sign-In Button Container */}
        <div className="w-full">
          <div ref={googleButtonRef} className="w-full flex justify-center min-h-[40px]"></div>
          {/* Fallback button - shows if Google button didn't render */}
          {!googleButtonReady && (
            <Button 
              type="button" 
              variant="outline" 
              className="w-full flex items-center gap-2" 
              onClick={() => {
                if (!GOOGLE_CLIENT_ID) {
                  setError(`Google OAuth is not configured. VITE_GOOGLE_CLIENT_ID is: ${GOOGLE_CLIENT_ID || 'empty'}. Please check your .env file in the Frontend directory and restart the dev server.`)
                } else if (!window.google) {
                  setError("Google Sign-In script is still loading. Please wait a moment and try again.")
                } else {
                  setError("Google Sign-In button is initializing. Please wait.")
                }
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4">
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              Sign up with Google
            </Button>
          )}
        </div>
      </div>
      <div className="text-center text-sm">
        Already have an account?{" "}
        <a href="/login" className="underline underline-offset-4">
          Log in
        </a>
      </div>
    </form>
  )
}
