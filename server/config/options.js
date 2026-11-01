// Allowed values. The server builds the prompts, so the client can only pick from these lists.
export const LENGTHS = [800, 1200, 1600]
export const CATEGORIES = ['General', 'Technology', 'Business', 'Health', 'Lifestyle', 'Education', 'Travel', 'Food']

// What each style adds to the image prompt (FLUX follows descriptive wording well)
export const STYLE_PROMPTS = {
  'Realistic': 'photorealistic, natural lighting, highly detailed',
  'Ghibli style': 'hand-painted anime film look, soft watercolor background, gentle colors, whimsical',
  'Anime style': 'anime illustration, clean line art, vibrant colors, cel shading',
  'Cartoon style': 'colorful cartoon illustration, bold outlines, playful',
  'Fantasy style': 'epic fantasy art, dramatic lighting, magical atmosphere, intricate detail',
  'Realistic style': 'realistic photo style, sharp focus, true-to-life colors',
  '3D style': '3D render, soft studio lighting, smooth materials, high detail',
  'Portrait style': 'portrait photography, shallow depth of field, expressive, professional lighting',
}
export const STYLES = Object.keys(STYLE_PROMPTS)
