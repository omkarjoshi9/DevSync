import React from 'react'
import { Button } from './ui/button'
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from './ui/textarea'

const Output = () => {
  return (
    <div className="flex flex-col w-full px-4 py-4 space-y-4 overflow-x-hidden">
      {/* Run button */}
      <div>
        <Button variant='outline'className="px-6 mt-6">Run</Button>
      </div>

      {/* Input area */}
      <div>
        <Textarea
          placeholder="Enter Input here"
          className="w-full h-32 font-mono text-sm"
        />
      </div>
      {/* Output card */}
      <div className="flex-1">
        <p className="text-sm mb-3 text-white">Output</p>
        <Card className="w-full bg-white text-black dark:bg-zinc-900 dark:text-zinc-100 shadow-sm font-mono text-sm">
          <CardContent className="h-126">
            <p className="text-md pb-2 text-muted-foreground">
                Output here
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Output
