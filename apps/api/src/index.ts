import express, { Request, Response } from 'express'
import type { ApiResult } from '@sharelist/shared'

const app = express()
const PORT = process.env['PORT'] ?? 3001

app.use(express.json())

app.get('/health', (_req: Request, res: Response) => {
  const result: ApiResult<{ status: string }> = { data: { status: 'ok' }, error: null }
  res.json(result)
})

app.listen(PORT, () => {
  console.log(JSON.stringify({ level: 'info', message: `API listening on port ${PORT}`, port: PORT }))
})
