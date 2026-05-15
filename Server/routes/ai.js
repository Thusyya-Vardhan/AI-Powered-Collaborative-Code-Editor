const express = require('express')
const Groq = require('groq-sdk')
const authMiddleware = require('../middleware/auth')

const router = express.Router()
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// Explain code
router.post('/explain', authMiddleware, async (req, res) => {
  try {
    const { code, language } = req.body
    const response = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [{ role: 'user', content: `Explain this ${language} code in simple terms:\n\n${code}` }]
    })
    res.json({ response: response.choices[0].message.content })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Debug code
router.post('/debug', authMiddleware, async (req, res) => {
  try {
    const { code, language, error } = req.body
    const response = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [{ role: 'user', content: `Debug this ${language} code. The error is: ${error}\n\nCode:\n${code}\n\nFind the bug and suggest a fix.` }]
    })
    res.json({ response: response.choices[0].message.content })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Suggest improvements
router.post('/suggest', authMiddleware, async (req, res) => {
  try {
    const { code, language } = req.body
    const response = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [{ role: 'user', content: `Suggest improvements for this ${language} code in terms of performance, readability and best practices:\n\n${code}` }]
    })
    res.json({ response: response.choices[0].message.content })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router