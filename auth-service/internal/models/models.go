package models

import (
	"database/sql"

	"authHandler/internal/models/permissions"
	"authHandler/internal/models/tokens"
	"authHandler/internal/models/users"
)

// Encapsulates all the models
type Models struct {
	Permissions permissions.PermissionsRepository
	Tokens      tokens.TokensRepository
	Users       users.UsersRepository
}

func New(db *sql.DB) *Models {
	return &Models{
		Permissions: permissions.Repository(db),
		Tokens:      tokens.Repository(db),
		Users:       users.Repository(db),
	}
}
