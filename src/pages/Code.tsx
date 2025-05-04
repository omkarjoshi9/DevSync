    import React from 'react'
    import '../App.css'
    import { ThemeProvider } from "../components/theme-provider"
    import { ModeToggle } from '../components/mode-toggle'
    import { Button } from '@/components/ui/button'
    import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
    import CodeEditor from '../components/CodeEditor'
import Footer from '@/components/Footer'
import { useNavigate } from 'react-router-dom';

    const Code = () => {
        const navigate = useNavigate();

    return (
        <ThemeProvider>
        <div className="flex flex-col h-screen">
            {/* Header */}
            <div className="flex justify-between p-4">
            <div className="flex items-center gap-4">
                <img src="/devsync_no_name.png" alt="DevSync Logo" className="h-8 w-8" />
                <a href="/" className="text-2xl font-semibold  pb-2">DevSync</a>
            </div>
            <div className="flex-grow" />
            <div className="flex items-center gap-4">
                <ModeToggle />
                <h2 className="text-2xl font-semibold pb-2">#123568</h2>
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

            {/* Editor*/}
            <div className="flex-grow">
            <CodeEditor />
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
    export default Code