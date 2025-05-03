import './App.css'
import { ThemeProvider } from "./components/theme-provider"
import { ModeToggle } from './components/mode-toggle'
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "./components/ui/menubar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import CodeEditor from './components/codeEditor'


function App() {
  return (
    <ThemeProvider>
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="flex justify-between p-4">
          <div className="flex items-center gap-4">
            <img src="/DevSync_logo.png" alt="DevSync Logo" className="h-8 w-8" />
            <h2 className="text-2xl font-semibold  pb-2">DevSync</h2>
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
              <Menubar>
                <MenubarMenu>
                  <MenubarTrigger>Login</MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem>
                      New Tab <MenubarShortcut>Ctrl T</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem>New Window</MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem>Share</MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem>Print</MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
              </Menubar>
            )}
          </div>
        </div>

        {/* Editor*/}
        <div className="flex-grow">
          <CodeEditor />
        </div>
      </div>
    </ThemeProvider>
  );
}

function isLoggedIn() {
  return true
}

export default App
