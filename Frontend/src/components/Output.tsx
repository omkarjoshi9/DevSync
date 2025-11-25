import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from './ui/textarea'

interface OutputProps {
  input: string;
  output: string;
  error: string | null;
  isLoading: boolean;
  executionTime?: number;
  onInputChange: (value: string) => void;
}

const Output = ({ input, output, error, isLoading, executionTime, onInputChange }: OutputProps) => {
  return (
    <div className="flex h-full flex-col gap-4 text-sm">
      <Card className="flex flex-1 flex-col border border-border/60 bg-background/80 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Input</CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <Textarea
            placeholder="e.g. 3 7 42"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            className="h-full rounded-xl border border-border/60 bg-background/70 font-mono text-xs shadow-inner resize-none"
          />
        </CardContent>
      </Card>

      <Card className="flex flex-1 flex-col border border-border/60 bg-background/90 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-sm font-semibold">Output</CardTitle>
            {executionTime !== undefined && executionTime > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Execution time: {executionTime}ms
              </p>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="flex h-full flex-col gap-2 rounded-xl border border-border/60 bg-black/80 p-4 font-mono text-sm overflow-auto">
            {isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent"></div>
                <span>Running...</span>
              </div>
            ) : error ? (
              <div className="text-red-400 whitespace-pre-wrap break-words font-mono text-sm">
                {error}
              </div>
            ) : output !== undefined && output !== null ? (
              <div className="text-green-400 whitespace-pre-wrap break-words font-mono text-sm">
                {output || '(No output)'}
              </div>
            ) : (
              <p className="text-muted-foreground">Output will appear here</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Output
