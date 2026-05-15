import { useState, useEffect, useRef } from 'react'
import MonacoEditor from '@monaco-editor/react'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import API_URL from '../config'

const socket = io('API_URL')

function Editor() {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [session, setSession] = useState(null)
  const [output, setOutput] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const { roomId } = useParams()
  const navigate = useNavigate()
  const isRemoteChange = useRef(false)

  const token = localStorage.getItem('token')

  const fetchSession = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/sessions/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSession(res.data)
      setCode(res.data.code)
      setLanguage(res.data.language)
    } catch (err) {
      console.log(err)
    }
  }

  const handleCodeChange = (value) => {
    setCode(value)
    socket.emit('code-change', { roomId, code: value })
  }

  const runCode = async () => {
    setOutput('Running...')
    try {
      const res = await axios.post(`${API_URL}/api/execute`,
        { code, language },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setOutput(res.data.output || 'No output')
    } catch (err) {
      setOutput('Error: ' + err.message)
    }
  }

  const askAI = async (type) => {
    setAiLoading(true)
    setAiResponse('')
    try {
      const res = await axios.post(`${API_URL}/api/ai/${type}`,
        { code, language, error: output },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setAiResponse(res.data.response)
    } catch (err) {
      setAiResponse('Error: ' + err.message)
    }
    setAiLoading(false)
  }

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId)
  }

  useEffect(() => {
    fetchSession()
    socket.emit('join-room', roomId)

    socket.on('code-update', (newCode) => {
      isRemoteChange.current = true
      setCode(newCode)
    })

    return () => {
      socket.off('code-update')
    }
  }, [])

  return (
    <div className="h-screen bg-gray-950 text-white flex flex-col">
      {/* Navbar */}
      <div className="border-b border-gray-800 px-4 py-3 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-blue-400 font-bold">CodeCollab</h1>
          <span className="text-gray-300 font-medium">{session?.name}</span>
          <span className="text-gray-600 text-xs bg-gray-800 px-2 py-1 rounded">
            {session?.language}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyRoomId}
            className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded transition"
          >
            Copy Room ID
          </button>
          <button
            onClick={runCode}
            className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-1.5 rounded transition"
          >
            ▶ Run
          </button>
          <button
            onClick={() => askAI('explain')}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5 rounded transition"
          >
            Explain
          </button>
          <button
            onClick={() => askAI('debug')}
            className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm px-3 py-1.5 rounded transition"
          >
            Debug
          </button>
          <button
            onClick={() => askAI('suggest')}
            className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-3 py-1.5 rounded transition"
          >
            Suggest
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-400 hover:text-white text-sm px-3 py-1.5 rounded transition"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor */}
        <div className="flex-1 flex flex-col">
          <MonacoEditor
            height="65%"
            language={language}
            value={code}
            onChange={handleCodeChange}
            theme="vs-dark"
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              wordWrap: 'on',
              padding: { top: 10 }
            }}
          />
          {/* Output */}
          <div className="h-[35%] border-t border-gray-800 bg-gray-900">
            <div className="px-4 py-2 border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
              Output
            </div>
            <pre className="p-4 text-sm text-green-400 overflow-auto h-full font-mono">
              {output || 'Output will appear here...'}
            </pre>
          </div>
        </div>

        {/* AI Panel */}
        <div className="w-80 border-l border-gray-800 bg-gray-900 flex flex-col">
          <div className="px-4 py-2 border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
            AI Assistant
          </div>
          <div className="p-4 overflow-auto flex-1">
            {aiLoading ? (
              <p className="text-blue-400 text-sm animate-pulse">Thinking...</p>
            ) : aiResponse ? (
              <p className="text-gray-300 text-sm whitespace-pre-wrap">{aiResponse}</p>
            ) : (
              <p className="text-gray-600 text-sm">Click Explain, Debug, or Suggest to get AI assistance.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Editor