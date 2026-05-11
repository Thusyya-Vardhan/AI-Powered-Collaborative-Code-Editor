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
          <button onClick={() => navigate('/dashboard')} style={{ marginLeft: '10px' }}>
            Back to Dashboard
          </button>
        </div>
      </div>

      <MonacoEditor
        height="90vh"
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
    </div>
  )
}

export default Editor