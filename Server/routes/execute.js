const express = require('express')
const { exec } = require('child_process')
const authMiddleware = require('../middleware/auth')

const router = express.Router()

router.post('/', authMiddleware, async (req, res) => {
  const { code, language } = req.body

  let command

  if (language === 'python') {
  command = `python -c "${code.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`
  } else if (language === 'javascript') {
    command = `node -e "${code.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`
  } else {
    return res.status(400).json({ message: 'Language not supported yet' })
  }

  exec(command, { timeout: 5000 }, (error, stdout, stderr) => {
    if (stderr) return res.json({ output: stderr })
    if (error) return res.json({ output: error.message })
    res.json({ output: stdout })
  })
})

module.exports = router