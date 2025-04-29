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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

function App() {

  return (
    <>
    <ThemeProvider>    
    <div className="flex justify-between"> 
        <div className="p-4 flex justify-center gap-4">
            <img src="../public/DevSync_logo.png" alt="DevSync Logo" className="h-8 w-8" />

              <h2 className=" cursor-pointer scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0">
                DevSync
              </h2>
        </div>
        <div className='flex-grow'></div>
        <div className="p-4 flex gap-4">
              <ModeToggle/>
              <h2 className="flex flex-start scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0">
                #123568
              </h2>
        </div>
        <div className="p-4">
          {isLoggedIn ? (
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          ):(
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
          )
          }
        </div> 
      </div>
      <div className="w-full px-4 gap-1.5">
        <Textarea placeholder="Code Here..." id="message" />
      </div>
    </ThemeProvider>     
    </>
  )
}

function isLoggedIn(){

}
export default App
