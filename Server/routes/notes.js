const express = require('express')
const Note = require('../models/Note')
const authMiddleware = require('../middleware/auth')

const router = express.Router()

// Get all notes for logged in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id })
    res.json(notes)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Create a note
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body
    const note = await Note.create({
      title,
      content,
      user: req.user.id
    })
    res.status(201).json(note)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Update a note
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    )
    res.json(note)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Delete a note
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Note.findOneAndDelete({ _id: req.params.id, user: req.user.id })
    res.json({ message: 'Note deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router