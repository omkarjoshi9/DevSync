import { Editor } from '@monaco-editor/react'
import { useRef, useState, useEffect, useCallback } from 'react'
import { useTheme } from './theme-provider'

import { CODE_SNIPPETS, LANGUAGE_VERSIONS } from '@/constants'
import LanguageSelector from './LanguageSelector'
import Output from './Output'
import { Button } from '@/components/ui/button'
import { Play } from 'lucide-react'

interface CodeEditorProps {
  initialCode?: string;
  initialLanguage?: string;
  onCodeChange?: (code: string) => void;
  onLanguageChange?: (language: string) => void;
  onRun?: (code: string, language: string, input: string) => void;
  output?: string;
  error?: string | null;
  isExecuting?: boolean;
  executionTime?: number;
  input?: string;
  onInputChange?: (value: string) => void;
}

const CodeEditor = ({ 
  initialCode, 
  initialLanguage = 'javascript',
  onCodeChange,
  onLanguageChange,
  onRun,
  output = '',
  error = null,
  isExecuting = false,
  executionTime,
  input = '',
  onInputChange
}: CodeEditorProps) => {
  const editorRef = useRef<any>(null)
  const { theme } = useTheme()
  const isRemoteChangeRef = useRef(false)
  const changeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [localInput, setLocalInput] = useState(input)

  // Initialize language state - only set from initialLanguage if provided, otherwise keep current
  const [language, setLanguage] = useState(() => {
    return initialLanguage || 'javascript'
  })
  
  const defaultSnippet = initialLanguage 
    ? (CODE_SNIPPETS[initialLanguage as keyof typeof CODE_SNIPPETS] || CODE_SNIPPETS.javascript)
    : CODE_SNIPPETS.javascript
  const [value, setValue] = useState(() => {
    return initialCode || defaultSnippet
  })

  // Track last known remote code to prevent unnecessary updates
  const lastRemoteCodeRef = useRef<string>('')
  const lastLocalCodeRef = useRef<string>('')
  const isTypingRef = useRef(false)
  
  // Update value when initialCode changes (from WebSocket)
  // Only update if it's actually different and from a remote source
  useEffect(() => {
    // Skip if user is actively typing (recent local change)
    if (isTypingRef.current) {
      return
    }
    
    // Only update if initialCode is different from both current value AND last known remote code
    // This prevents updates when user is typing (their changes haven't been reflected in initialCode yet)
    if (initialCode !== undefined && 
        initialCode !== value && 
        initialCode !== lastRemoteCodeRef.current &&
        initialCode.length > 0) {
      
      // Save cursor position before updating
      let savedPosition = null
      let savedSelection = null
      
      if (editorRef.current) {
        savedPosition = editorRef.current.getPosition()
        savedSelection = editorRef.current.getSelection()
      }
      
      // Mark as remote change and update
      isRemoteChangeRef.current = true
      lastRemoteCodeRef.current = initialCode
      setValue(initialCode)
      
      // Restore cursor position after update
      setTimeout(() => {
        if (editorRef.current && savedPosition) {
          // Only restore if position is still valid (within document bounds)
          const model = editorRef.current.getModel()
          if (model) {
            const lineCount = model.getLineCount()
            const maxColumn = model.getLineMaxColumn(savedPosition.lineNumber)
            
            const validPosition = {
              lineNumber: Math.min(savedPosition.lineNumber, lineCount),
              column: Math.min(savedPosition.column, maxColumn)
            }
            
            editorRef.current.setPosition(validPosition)
            if (savedSelection) {
              editorRef.current.setSelection(savedSelection)
            }
            editorRef.current.focus()
          }
        }
        isRemoteChangeRef.current = false
      }, 10) // Very short delay to let React update
    }
  }, [initialCode, value])

  // Track if language has been manually set by user
  const languageSetByUserRef = useRef(false)
  
  // Update language when initialLanguage changes (only on first load, not after user changes it)
  useEffect(() => {
    if (initialLanguage && initialLanguage !== language && !languageSetByUserRef.current) {
      // Only update if user hasn't manually changed the language
      setLanguage(initialLanguage)
      if (initialCode) {
        setValue(initialCode)
      } else {
        const snippet = CODE_SNIPPETS[initialLanguage as keyof typeof CODE_SNIPPETS]
        setValue(snippet || CODE_SNIPPETS.javascript)
      }
    }
  }, [initialLanguage, initialCode, language])

  // Sync input prop
  useEffect(() => {
    if (input !== undefined) {
      setLocalInput(input)
    }
  }, [input])

  const resolveTheme = () => (theme === 'light' ? 'vs' : 'vs-dark')

  const onMount = (editor: any) => {
    editorRef.current = editor
    editor.focus()
  }

  const onSelect = (lang: string) => {
    // Only change language if user explicitly selects a different one
    if (lang !== language) {
      languageSetByUserRef.current = true // Mark that user has set the language
      setLanguage(lang)
      onLanguageChange?.(lang)
      // Only change code if user is switching languages (not from remote updates)
      if (!isRemoteChangeRef.current) {
        const snippet = CODE_SNIPPETS[lang as keyof typeof CODE_SNIPPETS] || CODE_SNIPPETS.javascript
        setValue(snippet)
        onCodeChange?.(snippet)
      }
    }
  }

  const handleRun = () => {
    console.log('Run button clicked!', { hasOnRun: !!onRun, valueLength: value.length, language, inputLength: localInput.length })
    if (onRun) {
      console.log('Calling onRun with:', { code: value.substring(0, 50) + '...', language, input: localInput })
      onRun(value, language, localInput)
    } else {
      console.error('onRun is not defined!')
    }
  }

  const handleInputChange = (newInput: string) => {
    setLocalInput(newInput)
    onInputChange?.(newInput)
  }

  const handleEditorChange = useCallback((newValue: string | undefined) => {
    const code = newValue ?? ''
    
    // Don't trigger change events for remote updates
    if (isRemoteChangeRef.current) {
      return
    }

    // Mark that user is typing
    isTypingRef.current = true
    lastLocalCodeRef.current = code
    setValue(code)
    
    // Debounce the change callback
    if (changeTimeoutRef.current) {
      clearTimeout(changeTimeoutRef.current)
    }

    changeTimeoutRef.current = setTimeout(() => {
      onCodeChange?.(code)
      // Clear typing flag after debounce period
      isTypingRef.current = false
    }, 300) // 300ms debounce
  }, [onCodeChange])

  const currentVersion = LANGUAGE_VERSIONS[language as keyof typeof LANGUAGE_VERSIONS] || LANGUAGE_VERSIONS.javascript

  return (
    <div className="flex h-full w-full flex-col gap-3 rounded-2xl border border-border/60 bg-card/70 p-3 shadow-lg shadow-primary/5">
      <div className="flex flex-1 flex-col gap-3 overflow-hidden lg:flex-row">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border/60 bg-background/80">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-3 py-2 text-xs">
            <div className="flex items-center gap-2">
              <LanguageSelector language={language} onSelect={onSelect} />
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold capitalize">
                  {language}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Version {currentVersion}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
                Runtime
                <span className="rounded-full border border-border/60 px-2 py-0.5 font-mono text-[11px] normal-case tracking-normal text-primary">
                  DevSync sandbox
                </span>
              </div>
              <Button 
                className="gap-2 rounded-full px-4 py-2 text-xs"
                onClick={handleRun}
                disabled={isExecuting}
              >
                <Play className="h-3.5 w-3.5" />
                {isExecuting ? 'Running...' : 'Run'}
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language={language}
              theme={resolveTheme()}
              value={value}
              onMount={onMount}
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 13,
                fontLigatures: true,
                smoothScrolling: true,
                padding: { top: 10, bottom: 10 },
                automaticLayout: true,
                wordWrap: 'on',
              }}
              onChange={handleEditorChange}
              keepCurrentModel={true}
            />
          </div>
        </div>

        <div className="flex h-full flex-shrink-0 lg:w-[600px]">
          <Output 
            input={localInput}
            output={output}
            error={error}
            isLoading={isExecuting}
            executionTime={executionTime}
            onInputChange={handleInputChange}
          />
        </div>
      </div>
    </div>
  )
}

export default CodeEditor
