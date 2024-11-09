package main

import (
	"fmt"
	"net/http"
	"strings"
)

func getTokenFromHeader(r *http.Request) (string, error) {
	// Get the Authorization header
	authHeader := r.Header.Get("Authorization")

	// Check if the Authorization header is in the correct format
	if authHeader == "" {
		return "", fmt.Errorf("missing Authorization header")
	}

	// The expected format is "Bearer <token>"
	parts := strings.SplitN(authHeader, " ", 2)
	if len(parts) != 2 || parts[0] != "Bearer" {
		return "", fmt.Errorf("invalid Authorization header format")
	}

	// Return the token part
	return parts[1], nil
}
