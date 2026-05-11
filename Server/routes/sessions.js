const express = require('express')
const { v4: uuidv4 } = require('uuid')
const Session = require('../models/Session')
const authMiddleware = require('../middleware/auth')

const router = express.Router()

// Create a room
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { name, language } = req.body
    const roomId = uuidv4()

    const session = await Session.create({
      roomId,
      name,
      language,
      owner: req.user.id,
      members: [req.user.id]
    })

    res.status(201).json(session)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get all rooms for logged in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const sessions = await Session.find({ members: req.user.id })
    res.json(sessions)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get a single room by roomId
router.get('/:roomId', authMiddleware, async (req, res) => {
  try {
    const session = await Session.findOne({ roomId: req.params.roomId })
    if (!session) {
      return res.status(404).json({ message: 'Room not found' })
    }
    res.json(session)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Join a room
router.post('/join/:roomId', authMiddleware, async (req, res) => {
  try {
    const session = await Session.findOne({ roomId: req.params.roomId })
    if (!session) {
      return res.status(404).json({ message: 'Room not found' })
    }

    if (!session.members.includes(req.user.id)) {
      session.members.push(req.user.id)
      await session.save()
    }

    res.json(session)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router