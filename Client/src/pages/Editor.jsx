import { useState, useEffect } from 'react'
import MonacoEditor from '@monaco-editor/react'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'

function Editor() {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [session, setSession] = useState(null)
  const { roomId } = useParams()
  const navigate = useNavigate()

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

  useEffect(() => {
    fetchSession()
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
        onChange={(value) => setCode(value)}
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