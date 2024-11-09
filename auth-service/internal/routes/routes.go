package routes

import (
	"expvar"
	"net/http"

	"authHandler/internal/app"
	"authHandler/internal/models/permissions"
	"authHandler/internal/routes/auth"
	"authHandler/internal/routes/middleware"
)

// Add all routes
func Mux(app *app.App) http.Handler {
	mux := http.NewServeMux()

	// Routes
	middleware := middleware.New(app)
	auth := auth.New(app)

	// Register
	auth.Route(mux, middleware)

	// Example permission check
	mux.Handle(
		"GET /v1/debug/vars",
		middleware.RequirePermission(
			permissions.PermissionAdmin,
			func(w http.ResponseWriter, r *http.Request) {
				expvar.Handler().ServeHTTP(w, r)
			},
		),
	)

	// All requests should recover panics and have a User
	return middleware.RecoverPanic(
		middleware.Requests(
			middleware.User(mux),
		),
	)
}
