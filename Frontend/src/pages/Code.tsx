import { useEffect, useState, useCallback } from 'react'
import '../App.css'
import { ThemeProvider } from "../components/theme-provider"
import Header from '@/components/Header'
import CodeEditor from '../components/CodeEditor'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useWebSocket } from '@/hooks/useWebSocket'

interface Participant {
  name: string
  avatar?: string
  role?: string
}

const Code = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const roomIdParam = searchParams.get('roomId')
  const [roomId, setRoomId] = useState<string | undefined>(undefined)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [roomCode, setRoomCode] = useState<string>('')
  const [roomLanguage, setRoomLanguage] = useState<string>('javascript')
  const [output, setOutput] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionTime, setExecutionTime] = useState<number | undefined>(undefined)
  const [input, setInput] = useState<string>('')

  console.log('Code component render:', { roomIdParam, isAuthenticated, authLoading, roomId })

  // Handle code updates from WebSocket
  const handleCodeUpdate = useCallback((code: string, userId: string) => {
    console.log('Received code update from user:', userId)
    setRoomCode(code)
  }, [])

  // Handle user joined
  const handleUserJoined = useCallback((user: any) => {
    console.log('User joined:', user)
    // Refresh participants list
    if (roomId) {
      const fetchParticipants = async () => {
        try {
          const cleanRoomId = roomId.replace('#', '')
          const response = await api.getRoom(cleanRoomId)
          if (response.success && response.data) {
            const mappedParticipants = response.data.participants.map((p: any) => ({
              name: `${p.firstName} ${p.lastName}`,
              avatar: p.avatarUrl,
              role: p.role,
            }))
            setParticipants(mappedParticipants)
          }
        } catch (error) {
          console.error('Failed to refresh participants:', error)
        }
      }
      fetchParticipants()
    }
  }, [roomId])

  // Handle user left
  const handleUserLeft = useCallback((userId: string) => {
    console.log('User left:', userId)
    setParticipants(prev => prev.filter(p => p.name !== userId))
  }, [])

  // Handle WebSocket errors
  const handleWebSocketError = useCallback((error: { message: string; code: string }) => {
    console.error('WebSocket error:', error)
  }, [])

  // Initialize WebSocket connection
  const { isConnected, sendCodeChange } = useWebSocket({
    roomId: roomId || '',
    onCodeUpdate: handleCodeUpdate,
    onUserJoined: handleUserJoined,
    onUserLeft: handleUserLeft,
    onError: handleWebSocketError,
  })

  // Handle local code changes
  const handleCodeChange = useCallback((code: string) => {
    setRoomCode(code)
    if (isConnected && roomId) {
      sendCodeChange(code)
    }
  }, [isConnected, roomId, sendCodeChange])

  // Handle language changes
  const handleLanguageChange = useCallback((newLanguage: string) => {
    setRoomLanguage(newLanguage)
    // Optionally send language change via WebSocket
    // This can be implemented if you want to sync language across users
  }, [])

  // Handle code execution
  const handleRun = useCallback(async (code: string, language: string, inputValue: string) => {
    console.log('handleRun called in Code page:', { codeLength: code.length, language, inputValue, roomId })
    
    if (!roomId) {
      console.error('No room ID available')
      setError('No room ID available')
      return
    }

    setIsExecuting(true)
    setError(null)
    setOutput('')
    setExecutionTime(undefined)

    try {
      const cleanRoomId = roomId.replace('#', '')
      console.log('Executing code:', { roomId: cleanRoomId, language, codeLength: code.length, codePreview: code.substring(0, 100) })

      // Submit execution request
      const executeResponse = await api.executeCode({
        roomId: cleanRoomId,
        language,
        code,
        input: inputValue || undefined,
      })

      if (!executeResponse.success || !executeResponse.data) {
        setError(executeResponse.error?.message || 'Failed to execute code')
        setIsExecuting(false)
        return
      }

      const executionId = executeResponse.data.executionId
      console.log('Execution queued, ID:', executionId)

      // Poll for execution results
      let pollCount = 0
      const maxPolls = 60 // 30 seconds max (60 * 500ms)
      
      const pollInterval = setInterval(async () => {
        pollCount++
        try {
          console.log(`Polling execution status (attempt ${pollCount})...`)
          const statusResponse = await api.getExecution(executionId)
          console.log('Poll response:', statusResponse)
          
          if (statusResponse.success && statusResponse.data?.execution) {
            const execution = statusResponse.data.execution
            console.log(`[Poll ${pollCount}] Execution status:`, execution.status, { 
              hasOutput: !!execution.output, 
              hasError: !!execution.error,
              output: execution.output ? execution.output.substring(0, 50) + '...' : null,
              error: execution.error ? execution.error.substring(0, 50) + '...' : null
            })
            
            if (execution.status === 'completed' || execution.status === 'failed') {
              clearInterval(pollInterval)
              setIsExecuting(false)
              
              console.log('Execution finished!', {
                status: execution.status,
                outputLength: execution.output?.length || 0,
                errorLength: execution.error?.length || 0
              })
              
              if (execution.status === 'completed') {
                const outputText = execution.output ?? '' // Use nullish coalescing to handle null
                const errorText = execution.error ?? ''
                
                console.log('Execution completed - setting output', {
                  hasOutput: outputText !== null && outputText !== undefined,
                  outputLength: outputText?.length || 0,
                  outputPreview: outputText?.substring(0, 100),
                  hasError: errorText !== null && errorText !== undefined && errorText.trim(),
                  errorPreview: errorText?.substring(0, 100)
                })
                
                // Show error if present, otherwise show output (even if empty)
                if (errorText && errorText.trim()) {
                  setError(errorText)
                  setOutput('')
                } else {
                  // Set output even if it's an empty string (some programs produce no output)
                  setOutput(outputText === null ? '' : outputText)
                  setError(null)
                }
                setExecutionTime(execution.execution_time || execution.executionTime || 0)
              } else {
                // Status is 'failed'
                const errorText = execution.error || 'Execution failed'
                console.log('Execution failed:', errorText)
                setError(errorText)
                setOutput('')
                setExecutionTime(execution.execution_time || execution.executionTime || 0)
              }
            } else if (pollCount >= maxPolls) {
              // Timeout reached
              clearInterval(pollInterval)
              setIsExecuting(false)
              console.error('Execution timeout after', maxPolls, 'polls')
              setError('Execution timeout - code took too long to run')
            }
            // If still running or queued, continue polling
          } else {
            console.error('Poll failed:', statusResponse)
            if (pollCount >= maxPolls) {
              clearInterval(pollInterval)
              setIsExecuting(false)
              setError(statusResponse.error?.message || 'Failed to get execution status')
            }
          }
        } catch (pollError) {
          console.error('Error polling execution status:', pollError)
          if (pollCount >= maxPolls) {
            clearInterval(pollInterval)
            setIsExecuting(false)
            setError('Failed to check execution status')
          }
        }
      }, 500) // Poll every 500ms

      // Cleanup on unmount
      return () => {
        clearInterval(pollInterval)
      }

    } catch (err: any) {
      console.error('Execution error:', err)
      setIsExecuting(false)
      setError(err?.message || 'An error occurred while executing code')
    }
  }, [roomId])

  useEffect(() => {
    console.log('Code page useEffect:', { roomIdParam, isAuthenticated, authLoading })
    
    // Wait for auth to finish loading
    if (authLoading) {
      console.log('Auth still loading, waiting...')
      return
    }

    // Redirect to home if not authenticated
    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to home')
      navigate('/')
      return
    }

    if (!roomIdParam) {
      console.log('No roomId param, redirecting to home')
      navigate('/')
      return
    }

    // Store roomId with # for display, but remove # for API calls
    const formattedRoomId = roomIdParam.startsWith('#') ? roomIdParam : `#${roomIdParam}`
    const apiRoomId = roomIdParam.replace('#', '') // Remove # for API calls
    console.log('Formatted roomId (display):', formattedRoomId)
    console.log('API roomId (no #):', apiRoomId)
    setRoomId(formattedRoomId)
    
    // Fetch room data and participants
    const fetchRoomData = async () => {
      try {
        setLoading(true)
        console.log('Fetching room data for:', apiRoomId)
        const response = await api.getRoom(apiRoomId)
        console.log('Room data response:', response)
        if (response.success && response.data) {
          // Map participants to the format expected by Header
          const mappedParticipants = response.data.participants.map((p: any) => ({
            name: `${p.firstName} ${p.lastName}`,
            avatar: p.avatarUrl,
            role: p.role,
          }))
          setParticipants(mappedParticipants)
          console.log('Participants set:', mappedParticipants)
          
          // Set initial code and language from room
          if (response.data.room) {
            setRoomCode(response.data.room.code || '')
            setRoomLanguage(response.data.room.language || 'javascript')
          }
        } else {
          // Room not found or access denied
          console.error('Room fetch failed:', response)
          navigate('/')
        }
      } catch (error) {
        console.error('Failed to fetch room data:', error)
        navigate('/')
      } finally {
        setLoading(false)
      }
    }
    
    fetchRoomData()
  }, [roomIdParam, isAuthenticated, authLoading, navigate])

  if (authLoading || loading) {
    return (
      <ThemeProvider>
        <div className="flex h-screen flex-col items-center justify-center bg-background text-foreground">
          <p>{authLoading ? 'Checking authentication...' : 'Loading room...'}</p>
        </div>
      </ThemeProvider>
    )
  }

  if (!roomId) {
    return null
  }

  return (
    <ThemeProvider>
      <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
        <Header collaborators={participants} roomId={roomId} />

        <main className="flex flex-1 flex-col gap-4 overflow-hidden px-4 pb-4 pt-4">
          <div className="flex flex-1 overflow-hidden">
            <div className="flex w-full flex-1 flex-wrap gap-4 lg:flex-nowrap">
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-border/60 bg-card/80 p-4 shadow-lg shadow-primary/5">
                <div className="flex-1 overflow-hidden rounded-2xl border border-border/60 bg-background/60">
                  <CodeEditor 
                    initialCode={roomCode}
                    initialLanguage={roomLanguage}
                    onCodeChange={handleCodeChange}
                    onLanguageChange={handleLanguageChange}
                    onRun={handleRun}
                    output={output}
                    error={error}
                    isExecuting={isExecuting}
                    executionTime={executionTime}
                    input={input}
                    onInputChange={setInput}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ThemeProvider>
  )
}

export default Code