import { sql } from '../config/db.js'

const PAGE_SIZE = 12
const MAX_STORED_CHARS = 50_000

export const save = ({ userId, prompt, content, type, publish = false, assetId = null }) =>
  sql`insert into creations (user_id, prompt, content, type, publish, asset_id)
    values (${userId}, ${prompt.slice(0, 500)}, ${content.slice(0, MAX_STORED_CHARS)}, ${type}, ${publish}, ${assetId})`

const paged = (rows) => ({ creations: rows.slice(0, PAGE_SIZE), hasMore: rows.length > PAGE_SIZE })

export const listMine = async (userId, page) => {
  const rows = await sql`select id, prompt, content, type, publish, created_at from creations
    where user_id = ${userId} order by created_at desc limit ${PAGE_SIZE + 1} offset ${(page - 1) * PAGE_SIZE}`
  const [stats] = await sql`select count(*)::int as total, (count(*) filter (where type = 'image'))::int as images
    from creations where user_id = ${userId}`
  return { ...paged(rows), stats }
}

// Other users' ids are never exposed: only a like count and whether YOU liked it.
export const listPublished = async (userId, page) => {
  const rows = await sql`select id, prompt, content, cardinality(likes) as like_count, (${userId} = any(likes)) as liked, created_at
    from creations where publish = true order by created_at desc limit ${PAGE_SIZE + 1} offset ${(page - 1) * PAGE_SIZE}`
  return paged(rows)
}

export const toggleLike = async (id, userId) => {
  const [row] = await sql`update creations set likes = case
      when ${userId} = any(likes) then array_remove(likes, ${userId})
      else array_append(likes, ${userId}) end
    where id = ${id} and publish = true
    returning cardinality(likes) as like_count, (${userId} = any(likes)) as liked`
  return row
}

export const togglePublish = async (id, userId) => {
  const [row] = await sql`update creations set publish = not publish where id = ${id} and user_id = ${userId} and type = 'image' returning publish`
  return row
}

export const deleteCreation = async (id, userId) => {
  const [row] = await sql`delete from creations where id = ${id} and user_id = ${userId} returning asset_id`
  return row
}
