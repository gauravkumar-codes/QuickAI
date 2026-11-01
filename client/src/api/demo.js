import demoImage from '../assets/ai_gen_img_1.png'
import { dummyCreationData, dummyPublishedCreationData } from '../assets/assets'

// Sample data for running the frontend without a backend (when VITE_BASE_URL is not set)
const published = dummyPublishedCreationData.map(({ likes, ...c }) => ({ ...c, like_count: likes.length, liked: false }))
const usage = Object.fromEntries(['article', 'title', 'resume', 'image', 'bgremove', 'objremove'].map((t) => [t, { used: 1, limit: 5 }]))

export const demo = (path, body) => {
  const route = path.split('?')[0]
  if (route.endsWith('/get-user-creations')) return {
    creations: dummyCreationData, hasMore: false,
    stats: { total: dummyCreationData.length, images: dummyCreationData.filter((c) => c.type === 'image').length },
  }
  if (route.endsWith('/get-published-creations')) return { creations: published, hasMore: false }
  if (route.endsWith('/get-usage')) return { premium: false, usage }
  if (/\/(toggle-like-creation|toggle-publish|delete-creation)$/.test(route)) return {}

  const file = body instanceof FormData ? (body.get('image') || body.get('resume')) : null
  if (route.includes('image') && !file) return { content: demoImage }
  if (file && file.type?.startsWith('image/')) return { content: URL.createObjectURL(file) }
  if (route.includes('resume')) return { content: '# Resume review (demo)\n\n**Strengths**\n* Clear structure\n* Relevant skills listed\n\n**Improvements**\n* Add measurable results\n* Shorten the summary' }
  if (route.includes('title')) return { content: '**Titles**\n\n* Beyond the Basics: A Fresh Look\n* 10 Things Nobody Tells You\n* The Complete Guide for Beginners' }
  return { content: '# Demo article\n\nConnect your backend by setting **VITE_BASE_URL** in .env.\n\n## Why it matters\n\n* Fast to write\n* Easy to edit' }
}
