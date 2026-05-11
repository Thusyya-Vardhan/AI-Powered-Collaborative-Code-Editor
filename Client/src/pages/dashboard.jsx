import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Dashboard() {
  const [notes, setNotes] = useState([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const navigate = useNavigate()

  const token = localStorage.getItem('token')

  const fetchNotes = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/notes', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setNotes(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  const createNote = async () => {
    try {
      await axios.post('http://localhost:5000/api/notes', 
        { title, content },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setTitle('')
      setContent('')
      fetchNotes()
    } catch (err) {
      console.log(err)
    }
  }

  const deleteNote = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchNotes()
    } catch (err) {
      console.log(err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  useEffect(() => {
    fetchNotes()
  }, [])

  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={handleLogout}>Logout</button>

      <h2>Create Note</h2>
      <input
        type='text'
        placeholder='Title'
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <br />
      <textarea
        placeholder='Content'
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <br />
      <button onClick={createNote}>Add Note</button>

      <h2>My Notes</h2>
      {notes.map(note => (
        <div key={note._id} style={{ border: '1px solid black', margin: '10px', padding: '10px' }}>
          <h3>{note.title}</h3>
          <p>{note.content}</p>
          <button onClick={() => deleteNote(note._id)}>Delete</button>
        </div>
      ))}
    </div>
  )
}

export default Dashboard