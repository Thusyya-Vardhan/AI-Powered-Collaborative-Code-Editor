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
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <div className="border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-400">CodeCollab</h1>
        <button
          onClick={handleLogout}
          className="text-gray-400 hover:text-white text-sm transition"
        >
          Logout
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Create Room */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Create Room</h2>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Room name"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
              />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
              </select>
              <button
                onClick={createRoom}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition"
              >
                Create
              </button>
            </div>
          </div>

          {/* Join Room */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Join Room</h2>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Paste room ID"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={joinRoom}
                className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition"
              >
                Join
              </button>
            </div>
          </div>
        </div>

        {/* My Rooms */}
        <h2 className="text-lg font-semibold mb-4">My Rooms</h2>
        {sessions.length === 0 ? (
          <p className="text-gray-500">No rooms yet. Create one to get started.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map(session => (
              <div
                key={session._id}
                className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-blue-500 transition cursor-pointer"
                onClick={() => navigate(`/editor/${session.roomId}`)}
              >
                <h3 className="font-semibold text-white mb-1">{session.name}</h3>
                <p className="text-gray-400 text-sm mb-3">{session.language}</p>
                <p className="text-gray-600 text-xs truncate">{session.roomId}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard