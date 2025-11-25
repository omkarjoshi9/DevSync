import React from 'react'

const footerLinks = [
  { label: 'Contact', href: '/contact' },
  { label: 'About', href: '/about' },
]

const Footer: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-border/60 bg-muted/30 text-foreground">
      <div className="container mx-auto flex flex-col gap-8 px-4 py-10 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
            DevSync
          </p>
          <p className="text-lg font-semibold">Build together from anywhere.</p>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} DevSync. Crafted remotely.
          </p>
        </div>

        <nav className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {footerLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="rounded-full border border-border/60 px-4 py-2 transition hover:border-primary hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  )
}

export default Footer
