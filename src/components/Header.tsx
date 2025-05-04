import React from 'react'
import { ModeToggle } from '../components/mode-toggle'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const navigate = useNavigate();

  return (
    <div className="flex justify-between p-4">
      <div className="flex items-center gap-4">
        <img src="/devsync_no_name.png" alt="DevSync Logo" className="h-8 w-8" />
        <a href="/" className="text-2xl font-semibold pb-2">DevSync</a>
      </div>
      
      <div className="flex items-center gap-1">
        <ModeToggle />
        <div className='px-2'>
          {isLoggedIn() ? (
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          ) : (
            <Button onClick={() => navigate('/login')}>Login</Button>
          )}
        </div>
      </div>
    </div>
  )
}

function isLoggedIn() {
  return false
}

export default Header
