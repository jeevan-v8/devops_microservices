package main

import (
	"context"
	"log"
	"notesHandler/internal/repository"
	"os"

	"github.com/jackc/pgx/v5"
)

func main() {
	ctx := context.Background()

	conn, err := pgx.Connect(context.Background(), "postgres://auth-handler:password@localhost:4321/auth-handler?sslmode=disable")
	if err != nil {
		os.Exit(1)
	}
	defer conn.Close(ctx)

	repo := repository.New(conn)
	app := NewApp(repo, ctx)
	app.InitializeRoutes()
	if err := app.StartServer(":3001"); err != nil {
		log.Fatal(err)
	}
} 
