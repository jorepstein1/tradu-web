-- App tables for user history and persisted Mochi credentials.
--
-- Auth is handled by Neon Auth (Better Auth), which manages its own tables in
-- the `neon_auth` schema (user, session, account, ...). We intentionally do NOT
-- add a foreign key into that managed schema — `user_id` stores the Better Auth
-- user id (text) and is indexed, keeping these tables decoupled from the
-- managed auth schema.

CREATE TABLE IF NOT EXISTS search_history (
  id          SERIAL PRIMARY KEY,
  user_id     TEXT NOT NULL,
  word        TEXT NOT NULL,
  direction   TEXT NOT NULL,  -- 'esen' or 'enes'
  searched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS search_history_user_id_idx ON search_history(user_id);

CREATE TABLE IF NOT EXISTS user_mochi_settings (
  user_id       TEXT PRIMARY KEY,
  mochi_api_key TEXT,
  mochi_deck_id TEXT,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
