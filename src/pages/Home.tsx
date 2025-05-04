import React from 'react'
import '../App.css'
import { ThemeProvider } from "../components/theme-provider"
import { ModeToggle } from '../components/mode-toggle'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import Footer from '@/components/Footer'
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  return (
    <ThemeProvider>
      <div className="flex flex-col min-h-screen bg-background">
        {/* Header */}
        <div className="flex justify-between p-4">
          <div className="flex-grow" />
          <div className="flex items-center gap-4">
            <ModeToggle />
          </div>
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
        {/* Main content */}
        <div className="flex flex-col md:flex-row items-stretch m-4 mt-20">
        <div className="md:w-5/10 w-full flex flex-col items-center justify-center pt-20 rounded-2xl gap-6">
  <h1 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
    Join a space
  </h1>
  <Textarea
    placeholder="SpaceID"
    className="w-[300px] h-[40px] p-2 text-base leading-normal resize-none min-h-0 box-border"
  />
  <Textarea
    placeholder="Password"
    className="w-[300px] h-[40px] p-2 text-base leading-normal resize-none min-h-0 box-border"
  />
  <Button className="w-[100px] mb-10">Join</Button>

  <h1 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
    Create a space
  </h1>
  <Textarea
    placeholder="#122032"
    className="w-[300px] h-[40px] p-2 text-base leading-normal resize-none min-h-0 box-border"
    readOnly
  />
  <Textarea
    placeholder="Password"
    className="w-[300px] h-[40px] p-2 text-base leading-normal resize-none min-h-0 box-border"
  />
  <Button className="w-[100px]">Create</Button>
</div>  
  {/* Image Section - No borders, no outlines */}
  <div className="md:w-5/10 w-full bg-transparent">
    <img
      src="/devsync.png"
      alt="Devsync Logo"
      className="w-full h-full object-contain block"
      style={{
        backgroundColor: 'transparent',
        border: 'none',
        boxShadow: 'none',
        outline: 'none',
        margin: 0,
        padding: 0
      }}
      draggable="false"
    />
  </div>
</div>
</div>
<div>
      <Footer/>
</div>
    </ThemeProvider>
  )
}

function isLoggedIn() {
  return false
}

export default Home
