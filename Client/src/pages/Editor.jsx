import { useState, useEffect, useRef } from 'react'
import MonacoEditor from '@monaco-editor/react'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'

const socket = io('http://localhost:5000')

function Editor() {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [session, setSession] = useState(null)
  const [output, setOutput] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [error, setError] = useState('')
  const { roomId } = useParams()
  const navigate = useNavigate()
  const isRemoteChange = useRef(false)

  const token = localStorage.getItem('token')

  const fetchSession = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/sessions/${roomId}`, {
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

  const languageIds = {
    javascript: 63,
    python: 71,
    cpp: 54,
    java: 62
  }

  const runCode = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/execute',
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
      const res = await axios.post(`http://localhost:5000/api/ai/${type}`,
        { code, language, error: output },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setAiResponse(res.data.response)
    } catch (err) {
      setAiResponse('Error: ' + err.message)
    }
    setAiLoading(false)
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
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px' }}>
        <h2>{session?.name}</h2>
        <div>
          <span>Room ID: {roomId}</span>
          <button onClick={runCode} style={{ marginLeft: '10px' }}>Run</button>
          <button onClick={() => askAI('explain')} style={{ marginLeft: '10px' }}>Explain</button>
          <button onClick={() => askAI('debug')} style={{ marginLeft: '10px' }}>Debug</button>
          <button onClick={() => askAI('suggest')} style={{ marginLeft: '10px' }}>Suggest</button>
          <button onClick={() => navigate('/dashboard')} style={{ marginLeft: '10px' }}>Back</button>
        </div>
      </div>

      <MonacoEditor
        height="60vh"
        language={language}
        value={code}
        onChange={handleCodeChange}
        theme="vs-dark"
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          wordWrap: 'on'
        }}
      />

      <div style={{ display: 'flex', height: '25vh' }}>
        <pre style={{ background: '#1e1e1e', color: '#fff', padding: '10px', width: '50%', overflow: 'auto' }}>
          {output || 'Output will appear here...'}
        </pre>
        <pre style={{ background: '#0d1117', color: '#58a6ff', padding: '10px', width: '50%', overflow: 'auto' }}>
          {aiLoading ? 'Thinking...' : aiResponse || 'AI response will appear here...'}
        </pre>
      </div>
    </div>
  )
}

export default Editor