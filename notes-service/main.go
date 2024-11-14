package main

import (
	"context"
	"flag"
	"log"
	"notesHandler/internal/repository"
	"os"

	"github.com/jackc/pgx/v5"
)

func main() {
	dbURL := flag.String("DATABASE_URL", "", "Database connection URL")

	// Parse the flags
	flag.Parse()

	// Use the flag value
	if *dbURL == "" {
		log.Println("No DATABASE_URL provided.")
    os.Exit(1)
	} 
  log.Print("DB url: ", *dbURL)
	ctx := context.Background()
	conn, err := pgx.Connect(context.Background(), *dbURL)
	if err != nil {
		log.Printf("Database connection failed")
		os.Exit(1)
	}
	defer conn.Close(ctx)

	repo := repository.New(conn)
	app := NewApp(repo, ctx)
	if err := app.StartServer(":3001"); err != nil {
		log.Fatal(err)
	}
}
