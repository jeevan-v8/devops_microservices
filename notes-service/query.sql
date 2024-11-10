-- name: FindAllNotes :many
SELECT * FROM notes;

-- name: CreateNewNote :one
INSERT INTO notes (title, content, owner)
VALUES ($1, $2, $3)
RETURNING *;

-- name: UpdateNote :one
UPDATE notes
SET title = $1, content = $2, updated_at = NOW()
WHERE id = $3
RETURNING *;

-- name: DeleteNote :one
DELETE FROM notes
WHERE id = $1
RETURNING *;

-- name: GetUserNotes :many
SELECT * FROM notes
WHERE owner = $1;

-- name: GetUserFromToken :one
SELECT users.id, users.email, users.password, users.activated, users.created_at, users.version
FROM users
INNER JOIN tokens
ON users.id = tokens.user_id
WHERE tokens.hash = $1;

