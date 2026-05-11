const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const authRoutes = require('./routes/auth')
const authMiddleware = require('./middleware/auth')

const app = express()

app.use(cors())
app.use(express.json())

mongoose.connect('mongodb://localhost:27017/studyplatform')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err))

app.use('/api/auth', authRoutes)

app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({ message: `Hello user ${req.user.id}` })
})

app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' })
})

app.listen(5000, () => {
  console.log('Server running on port 5000')
})