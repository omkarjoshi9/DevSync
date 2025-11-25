import { ModeToggle } from '../components/mode-toggle'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from '@/components/ui/button'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

type Collaborator = {
  name: string
  avatar?: string
  role?: string
}

interface HeaderProps {
  collaborators?: Collaborator[]
  roomId?: string
}

const Header = ({ collaborators = [], roomId }: HeaderProps) => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-4">
        <div className="flex items-center gap-3">
          <img src="/devsync_no_name.png" alt="DevSync Logo" className="h-9 w-9" />
          <div className="flex flex-col leading-tight">
            <span className="text-xl font-semibold tracking-tight">DevSync</span>
            <span className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
              Build together
            </span>
          </div>
        </div>

        <nav className="hidden items-center gap-1 rounded-full border border-border/50 bg-card/60 px-3 py-1 text-sm shadow-sm md:flex">
          {navLinks.map(({ label, to }) => (
            <NavLink
              key={label}
              to={to}
              className={({ isActive }) =>
                [
                  'rounded-full px-3 py-2 transition-colors',
                  isActive
                    ? 'bg-primary/15 text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                ].join(' ')
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {roomId && (
            <span className="hidden rounded-full border border-border/70 px-4 py-2 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground sm:inline-flex">
              Room {roomId}
            </span>
          )}
          {collaborators && collaborators.length > 0 && (
            <div className="hidden items-center gap-1 rounded-full border border-border/60 bg-card/70 px-2 py-1 sm:flex">
              {collaborators.map((person, index) => (
                <Avatar
                  key={person.name || index}
                  className="h-8 w-8 border border-background bg-background"
                  title={`${person.name} (${person.role || 'participant'})`}
                >
                  <AvatarImage src={person.avatar} />
                  <AvatarFallback className="text-xs font-semibold uppercase">
                    {person.name
                      ?.split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2) || 'U'}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
          )}
          <ModeToggle />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="focus:outline-none">
                  <Avatar className="h-10 w-10 border border-border/70 cursor-pointer hover:opacity-80 transition-opacity">
                    <AvatarImage src={user.avatarUrl} />
                    <AvatarFallback>
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="secondary" onClick={() => navigate('/login')}>
              Sign in
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
