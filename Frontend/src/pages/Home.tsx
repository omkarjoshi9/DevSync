import React, { useState } from 'react'
import '../App.css'
import { ThemeProvider } from "../components/theme-provider"
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Sparkles, Shield, Users } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'

const highlights = [
  {
    title: 'Realtime co-editing',
    description:
      'Stay perfectly in sync while pairing, mentoring, or demoing new ideas.',
    icon: Sparkles,
  },
  {
    title: 'Enterprise-grade security',
    description:
      'SSO-ready rooms, role-based access, and session level audit trails.',
    icon: Shield,
  },
  {
    title: 'Human-first experience',
    description:
      'Presence indicators, inline chat, and rich notes make remote feel local.',
    icon: Users,
  },
]

const Home = () => {
  const navigate = useNavigate()
  const { isAuthenticated, user, loading: authLoading } = useAuth()
  const [roomId, setRoomId] = useState('#122032')
  const [joinRoomId, setJoinRoomId] = useState('')
  const [joinPassword, setJoinPassword] = useState('')
  const [createPassword, setCreatePassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  console.log('Home render:', { isAuthenticated, user, authLoading })

  const generateNewRoomId = () => {
    // Generate a random 6-character alphanumeric ID
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    let newId = '#'
    for (let i = 0; i < 6; i++) {
      newId += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setRoomId(newId)
  }

  const handleCreateRoom = async (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    
    console.log('handleCreateRoom called', { isAuthenticated, loading })
    
    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to login')
      navigate('/login')
      return
    }

    if (loading) {
      console.log('Already loading, ignoring click')
      return
    }

    setLoading(true)
    setError('')

    try {
      const requestData = {
        password: createPassword || undefined,
        language: 'javascript',
      }
      console.log('Creating room with data:', requestData)
      
      const response = await api.createRoom(requestData)
      console.log('Create room response:', response)

      if (response.success && response.data) {
        // Navigate to the code editor with the room
        const roomId = response.data.room?.roomId
        console.log('Room created successfully, roomId:', roomId)
        console.log('Full response data:', response.data)
        if (roomId) {
          // Remove # if present, as the URL will handle it
          const cleanRoomId = roomId.toString().replace('#', '')
          console.log('Navigating to /code with roomId:', cleanRoomId)
          navigate(`/code?roomId=${cleanRoomId}`, { replace: true })
        } else {
          setError('Room created but room ID not found in response')
          console.error('Room response missing roomId:', response.data)
        }
      } else {
        const errorMsg = response.error?.message || response.message || 'Failed to create room'
        setError(errorMsg)
        console.error('Create room failed:', response)
      }
    } catch (err: any) {
      console.error('Create room error:', err)
      setError(err?.message || 'An error occurred while creating the room')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinRoom = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    if (!joinRoomId) {
      setError('Please enter a room ID')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Remove # if user included it
      const cleanRoomId = joinRoomId.replace('#', '')
      const response = await api.joinRoom({
        roomId: cleanRoomId,
        password: joinPassword || undefined,
      })

      if (response.success && response.data) {
        // Navigate to the code editor with the room
        navigate(`/code?roomId=${response.data.room.roomId}`)
      } else {
        setError(response.error?.message || 'Failed to join room')
      }
    } catch (err) {
      setError('An error occurred while joining the room')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ThemeProvider>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <Header />

        <main className="flex flex-1 flex-col gap-16 pb-16">
          <section className="relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-indigo-500/25 blur-3xl opacity-60" />
            <div className="container relative mx-auto grid gap-10 px-4 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="space-y-8">
                <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-4 py-1 text-sm text-muted-foreground shadow-sm">
                  Collaboration that feels in-person
                </span>
                <div className="space-y-6">
                  <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
                    Build together in a shared IDE that keeps context, code, and
                    humans aligned.
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Spin up a secure session in seconds, invite your crew, and
                    co-edit with millisecond accuracy. DevSync removes the delay
                    between idea and iteration.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    size="lg"
                    variant="outline"
                    className="backdrop-blur"
                    onClick={() => navigate('/about')}
                  >
                    See how teams use DevSync
                  </Button>
                </div>
              </div>

              <Card className="border border-border/60 bg-card/90 shadow-xl shadow-primary/10 backdrop-blur">
                <CardHeader>
                  <CardTitle>Drop into a Dev Room</CardTitle>
                  <CardDescription>
                    Join an existing session or mint a fresh room for your next
                    pairing sprint.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {error && (
                    <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                      {error}
                    </div>
                  )}
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">
                      Join an existing space
                    </p>
                    <Input 
                      placeholder="Enter room ID" 
                      value={joinRoomId}
                      onChange={(e) => setJoinRoomId(e.target.value)}
                      disabled={loading}
                    />
                    <Input 
                      type="password" 
                      placeholder="Room password" 
                      value={joinPassword}
                      onChange={(e) => setJoinPassword(e.target.value)}
                      disabled={loading}
                    />
                    <Button 
                      type="button"
                      className="w-full" 
                      onClick={handleJoinRoom}
                      disabled={loading}
                    >
                      {loading ? 'Joining...' : 'Join session'}
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">
                      Create a new space
                    </p>
                    <div className="flex gap-2">
                      <Input 
                        value={roomId} 
                        readOnly 
                        className="bg-background/70"
                      />
                      <Button 
                        variant="secondary" 
                        onClick={generateNewRoomId}
                        disabled={loading}
                      >
                        New ID
                      </Button>
                    </div>
                    <Input
                      type="password"
                      placeholder="Add optional password"
                      className="bg-background/70"
                      value={createPassword}
                      onChange={(e) => setCreatePassword(e.target.value)}
                      disabled={loading}
                    />
                    <Button 
                      type="button"
                      className="w-full" 
                      onClick={(e) => {
                        console.log('Button clicked!', e)
                        handleCreateRoom(e)
                      }}
                      disabled={loading}
                    >
                      {loading ? 'Creating...' : 'Create Room'}
                    </Button>
                  </div>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground">
                  Sessions auto-expire after 24h. Upgrade for persistent rooms.
                </CardFooter>
              </Card>
            </div>
          </section>

          <section className="container mx-auto px-4">
            <div className="rounded-3xl border border-border/70 bg-card/70 p-8 shadow-lg shadow-primary/5 backdrop-blur">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-widest text-primary">
                    Why DevSync
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold">
                    Bring whiteboard energy to distributed teams
                  </h2>
                  <p className="mt-3 max-w-2xl text-muted-foreground">
                    From onboarding to incident response, DevSync keeps
                    engineers in tight feedback loops with ephemeral, secure
                    spaces.
                  </p>
                </div>
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => navigate('/contact')}
                >
                  Talk to us
                </Button>
              </div>
              <div className="mt-10 grid gap-6 md:grid-cols-3">
                {highlights.map(({ title, description, icon: Icon }) => (
                  <Card
                    key={title}
                    className="border-none bg-background/80 p-6 shadow-md shadow-primary/5 backdrop-blur"
                  >
                    <Icon className="h-6 w-6 text-primary" />
                    <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {description}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  )
}

export default Home
