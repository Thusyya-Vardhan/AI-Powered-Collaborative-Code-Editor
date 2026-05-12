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
          <button onClick={runCode} style={{ marginLeft: '10px' }}>
            Run
          </button>
          <button onClick={() => navigate('/dashboard')} style={{ marginLeft: '10px' }}>
            Back to Dashboard
          </button>
        </div>
      </div>

      <MonacoEditor
        height="70vh"
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

      <pre style={{ background: '#1e1e1e', color: '#fff', padding: '10px', minHeight: '15vh' }}>
        {output || 'Output will appear here...'}
      </pre>
    </div>
  )
}

export default Editor