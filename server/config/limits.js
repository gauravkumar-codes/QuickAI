// [free per day, premium per day]. Tune to your real Gemini and Cloudinary free quotas.
export const LIMITS = { article: [5, 20], title: [10, 40], resume: [3, 10], image: [3, 10], bgremove: [2, 10], objremove: [3, 10] }
export const limitFor = (tool, premium) => LIMITS[tool][premium ? 1 : 0]

// Cloudinary's free plan has a small monthly credit budget shared by ALL users.
// Background and object removal both use these credits. Check your Cloudinary dashboard for real usage.
export const CLOUDINARY_MONTHLY_LIMIT = Number(process.env.CLOUDINARY_MONTHLY_LIMIT) || 20

// Cloudflare's free image allowance (10,000 Neurons a day) is shared by ALL users. One image costs roughly 43-58 Neurons,
// so 100 a day stays safely under it. Resets at 00:00 UTC.
export const CLOUDFLARE_DAILY_LIMIT = Number(process.env.CLOUDFLARE_DAILY_LIMIT) || 100
