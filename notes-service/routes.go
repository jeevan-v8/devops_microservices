package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"notesHandler/internal/repository"
	"strconv"
)

type App struct {
	Repository *repository.Queries
	Server     *http.ServeMux
	Ctx        context.Context
}

func NewApp(repo *repository.Queries, ctx context.Context) *App {
  app :=  &App{
		Repository: repo,
		Server:     http.NewServeMux(),
		Ctx:        ctx,
	}
  app.initializeRoutes()
  return app
}

func (app *App) StartServer(addr string) error {
	log.Printf("Starting server on %s\n", addr)
	return http.ListenAndServe(addr, app.Server)
}

func (a *App) initializeRoutes() {
	// Wrap each route with jsonMiddleware
	a.Server.Handle("/notes", jsonMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			a.findAllNotesHandler(w, r)
		case http.MethodPost:
			a.createNewNoteHandler(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})))

	a.Server.Handle("/notes/user", jsonMiddleware(http.HandlerFunc(a.getUserNotesHandler)))
	a.Server.Handle("/notes/update", jsonMiddleware(http.HandlerFunc(a.updateNoteHandler)))
	a.Server.Handle("/notes/delete", jsonMiddleware(http.HandlerFunc(a.deleteNoteHandler)))
}

// Handler to fetch all notes
func (a *App) findAllNotesHandler(w http.ResponseWriter, _ *http.Request) {
	notes, err := a.Repository.FindAllNotes(a.Ctx)
	if err != nil {
		http.Error(w, "Error fetching notes", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(notes)
}

// Handler to create a new note
func (a *App) createNewNoteHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid method", http.StatusMethodNotAllowed)
		return
	}
	var reqBody struct {
		Title   string `json:"title"`
		Content string `json:"content"`
	}
	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}
	token, err := getTokenFromHeader(r)
	if err != nil {
		http.Error(w, "Auth token not set", http.StatusUnauthorized)
		return
	}
	user, err := a.Repository.GetUserFromToken(a.Ctx, Hash(token))
	createdNote, err := a.Repository.CreateNewNote(a.Ctx, repository.CreateNewNoteParams{
		Title:   reqBody.Title,
		Content: reqBody.Content,
		Owner:   user.ID,
	})
	if err != nil {
		http.Error(w, "Error creating note", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(createdNote)
}

// Handler to update a note
func (a *App) updateNoteHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Invalid method", http.StatusMethodNotAllowed)
		return
	}
	var note struct {
		Title   string `json:"title"`
		Content string `json:"content"`
	}
	if err := json.NewDecoder(r.Body).Decode(&note); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}
	idStr := r.URL.Query().Get("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}
	updatedNote, err := a.Repository.UpdateNote(a.Ctx, repository.UpdateNoteParams{
		Title:   note.Title,
		Content: note.Content,
		ID:      id,
	})
	if err != nil {
		http.Error(w, "Error updating note", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(updatedNote)
}

// Handler to delete a note
func (a *App) deleteNoteHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Invalid method", http.StatusMethodNotAllowed)
		return
	}
	idStr := r.URL.Query().Get("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}
	deletedNote, err := a.Repository.DeleteNote(a.Ctx, id)
	if err != nil {
		http.Error(w, "Error deleting note", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(deletedNote)
}

// Handler to get notes by user ID
func (a *App) getUserNotesHandler(w http.ResponseWriter, r *http.Request) {
	token, err := getTokenFromHeader(r)
	if err != nil {
		http.Error(w, "Auth token not set", http.StatusUnauthorized)
		return
	}
	user, err := a.Repository.GetUserFromToken(a.Ctx, Hash(token))
	if err != nil {
		log.Print(err)
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}
	notes, err := a.Repository.GetUserNotes(a.Ctx, user.ID)
	if err != nil {
		http.Error(w, "Error fetching user notes", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(notes)
}
func jsonMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		next.ServeHTTP(w, r)
	})
}
