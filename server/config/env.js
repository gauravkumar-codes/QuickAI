// Pure check (easy to test). Returns a list of human-readable problems.
const REQUIRED = ['CLERK_PUBLISHABLE_KEY', 'CLERK_SECRET_KEY', 'GEMINI_API_KEY', 'DATABASE_URL', 'CLOUDINARY_URL']

// Settings that only switch off one feature when missing
export const checkOptionalEnv = (env = process.env) => {
  const warnings = []
  if (!env.CLOUDFLARE_ACCOUNT_ID?.trim() || !env.CLOUDFLARE_API_TOKEN?.trim())
    warnings.push('CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN not set: Generate Images will be unavailable')
  return warnings
}

export const checkEnv = (env = process.env) => {
  const problems = REQUIRED.filter((k) => !env[k]?.trim()).map((k) => `${k} is missing or empty`)
  if (env.DATABASE_URL && !/^postgres(ql)?:\/\//.test(env.DATABASE_URL.trim()))
    problems.push('DATABASE_URL must start with postgresql:// (paste only the URL, not the whole psql command)')
  if (env.CLOUDINARY_URL && !/^cloudinary:\/\/[^:]+:[^@]+@.+/.test(env.CLOUDINARY_URL.trim()))
    problems.push('CLOUDINARY_URL must look like cloudinary://<api_key>:<api_secret>@<cloud_name>')
  if (env.CLERK_SECRET_KEY && !env.CLERK_SECRET_KEY.startsWith('sk_'))
    problems.push('CLERK_SECRET_KEY must start with sk_ (you may have pasted the publishable key)')
  return problems
}
