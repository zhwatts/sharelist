import express, { Request, Response } from 'express'

const app = express()
const PORT = process.env['PORT'] ?? 3001

app.use(express.json())

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(JSON.stringify({ level: 'info', message: `API listening on port ${PORT}`, port: PORT }))
})
