const express = require('express')
const { GoogleGenerativeAI } = require('@google/generative-ai')
const authMiddleware = require('../middleware/auth')

const router = express.Router()
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

// List available models
router.get('/models', authMiddleware, async (req, res) => {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`)
    const data = await response.json()
    res.json(data)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Explain code
router.post('/explain', authMiddleware, async (req, res) => {
  try {
    const { code, language } = req.body
    const prompt = `Explain this ${language} code in simple terms:\n\n${code}`
    const result = await model.generateContent(prompt)
    res.json({ response: result.response.text() })
  } catch (err) {
    res.status(500).json({ message: err.message, details: err.response?.data })
  }
})

// Debug code
router.post('/debug', authMiddleware, async (req, res) => {
  try {
    const { code, language, error } = req.body
    const prompt = `Debug this ${language} code. The error is: ${error}\n\nCode:\n${code}\n\nFind the bug and suggest a fix.`
    const result = await model.generateContent(prompt)
    res.json({ response: result.response.text() })
  } catch (err) {
    res.status(500).json({ message: err.message, details: err.response?.data })
  }
})

// Suggest improvements
router.post('/suggest', authMiddleware, async (req, res) => {
  try {
    const { code, language } = req.body
    const prompt = `Suggest improvements for this ${language} code in terms of performance, readability and best practices:\n\n${code}`
    const result = await model.generateContent(prompt)
    res.json({ response: result.response.text() })
  } catch (err) {
    res.status(500).json({ message: err.message, details: err.response?.data })
  }
})

module.exports = router