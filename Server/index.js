const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const authRoutes = require('./routes/auth')
const sessionRoutes = require('./routes/sessions')

const app = express()

app.use(cors())
app.use(express.json())

mongoose.connect('mongodb://localhost:27017/studyplatform')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err))

app.use('/api/auth', authRoutes)
app.use('/api/sessions', sessionRoutes)

app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' })
})

app.listen(5000, () => {
  console.log('Server running on port 5000')
})