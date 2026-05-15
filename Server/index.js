require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const http = require('http')
const { Server } = require('socket.io')
const authRoutes = require('./routes/auth')
const sessionRoutes = require('./routes/sessions')
const aiRoutes = require('./routes/ai')
const executeRoutes = require('./routes/execute')

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
})

app.use(cors())
app.use(express.json())

mongoose.connect('mongodb://localhost:27017/studyplatform')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err))

app.use('/api/auth', authRoutes)
app.use('/api/sessions', sessionRoutes)
app.use('/api/execute', executeRoutes)
app.use('/api/ai', aiRoutes)

io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  socket.on('join-room', (roomId) => {
    socket.join(roomId)
    console.log(`User ${socket.id} joined room ${roomId}`)
  })

  socket.on('code-change', ({ roomId, code }) => {
    socket.to(roomId).emit('code-update', code)
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

server.listen(5000, () => {
  console.log('Server running on port 5000')
})