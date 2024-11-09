BEGIN;

-- Create the notes table
CREATE TABLE IF NOT EXISTS notes (
    id bigserial PRIMARY KEY,
    title text NOT NULL,
    content text NOT NULL,
    owner bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
    updated_at timestamp(0) with time zone NOT NULL DEFAULT NOW()
);

COMMIT;
