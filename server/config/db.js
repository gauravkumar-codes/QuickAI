import { neon } from '@neondatabase/serverless'

export const sql = neon(process.env.DATABASE_URL)

export const initDb = async () => {
  await sql`create table if not exists creations (
    id serial primary key, user_id text not null, prompt text not null, content text not null,
    type text not null, publish boolean default false, likes text[] default '{}',
    asset_id text, created_at timestamptz default now())`
  await sql`alter table creations add column if not exists asset_id text`
  await sql`create index if not exists creations_user_idx on creations (user_id, created_at desc)`
  await sql`create index if not exists creations_public_idx on creations (publish, created_at desc)`
  await sql`create table if not exists usage (
    user_id text, day date, tool text, count int default 0, primary key (user_id, day, tool))`
}
