// Imported right after dotenv so a bad .env stops the server with a clear message.
import { checkEnv, checkOptionalEnv } from './env.js'

const problems = checkEnv()
if (problems.length) {
  console.error('\nQuickAI cannot start. Fix server/.env:\n' + problems.map((p) => `  - ${p}`).join('\n') + '\n')
  process.exit(1)
}
for (const w of checkOptionalEnv()) console.warn(`Warning: ${w}`)
