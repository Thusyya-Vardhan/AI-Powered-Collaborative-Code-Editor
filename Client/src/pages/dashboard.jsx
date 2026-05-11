import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Dashboard() {
  const [sessions, setSessions] = useState([])
  const [roomName, setRoomName] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [joinRoomId, setJoinRoomId] = useState('')
  const navigate = useNavigate()

  const token = localStorage.getItem('token')

  const fetchSessions = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/sessions', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSessions(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  const createRoom = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/sessions/create',
        { name: roomName, language },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      navigate(`/editor/${res.data.roomId}`)
    } catch (err) {
      console.log(err)
    }
  }

  const joinRoom = async () => {
    try {
      await axios.post(`http://localhost:5000/api/sessions/join/${joinRoomId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      navigate(`/editor/${joinRoomId}`)
    } catch (err) {
      console.log(err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={handleLogout}>Logout</button>

      <h2>Create Room</h2>
      <input
        type='text'
        placeholder='Room name'
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
      />
      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option value='javascript'>JavaScript</option>
        <option value='python'>Python</option>
        <option value='cpp'>C++</option>
        <option value='java'>Java</option>
      </select>
      <button onClick={createRoom}>Create</button>

      <h2>Join Room</h2>
      <input
        type='text'
        placeholder='Paste room ID'
        value={joinRoomId}
        onChange={(e) => setJoinRoomId(e.target.value)}
      />
      <button onClick={joinRoom}>Join</button>

      <h2>My Rooms</h2>
      {sessions.map(session => (
        <div key={session._id} style={{ border: '1px solid black', margin: '10px', padding: '10px' }}>
          <h3>{session.name}</h3>
          <p>Language: {session.language}</p>
          <p>Room ID: {session.roomId}</p>
          <button onClick={() => navigate(`/editor/${session.roomId}`)}>Open</button>
        </div>
      ))}
    </div>
  )
}

export default Dashboard