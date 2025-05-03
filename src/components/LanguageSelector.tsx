import { LANGUAGE_VERSIONS } from '@/constants';
import React from 'react';
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
const languages = Object.entries(LANGUAGE_VERSIONS);

const LanguageSelector = ({language,onSelect}) => {
    const [position, setPosition] = React.useState("bottom")
  return (
    <div>
        <div className='px-10 py-2 pb-4'>
        <p className="text-sm pb-2 text-muted-foreground">
            Language:
        </p>
          <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">{language}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Select Language</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={language} onValueChange={setPosition}>
              {
                languages.map(([language, version]) => (
                  <DropdownMenuRadioItem value={language} onClick={() => onSelect(language)}>
                    <div className="flex justify-between items-center text-sm">
                      <span>{language}</span>
                      <span className="text-muted-foreground ml-2">{version}</span>
                    </div>
                  </DropdownMenuRadioItem>
                ))                
              }
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export default LanguageSelector