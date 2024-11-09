package middleware

import (
	"authHandler/internal/app"
	"authHandler/internal/models/permissions"
	"authHandler/internal/models/users"
	"authHandler/internal/rest"
	"authHandler/internal/xlogger"
)

type Middleware struct {
	logger      xlogger.Logger
	permissions permissions.PermissionsRepository
	rest        *rest.Rest
	users       users.UsersRepository
}

func New(app *app.App) *Middleware {
	return &Middleware{
		logger:      app.Logger,
		permissions: app.Models.Permissions,
		rest:        app.Rest,
		users:       app.Models.Users,
	}
}
