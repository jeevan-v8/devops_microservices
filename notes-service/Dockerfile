# Build stage
FROM golang:1.22-alpine AS builder
# Install git to download dependencies
RUN apk add --no-cache git
# Set working directory
WORKDIR /app
# Copy go mod files and download dependencies
COPY go.mod go.sum ./
RUN go mod download
# Copy the rest of the source code
COPY . .
# Build the Go binary with output name 'notesHandler'
RUN go build -o notesHandler

# Final stage - create a lightweight image
FROM alpine:latest
# Set working directory
WORKDIR /app
# Copy the built binary from the builder stage
COPY --from=builder /app/notesHandler .
# Expose the port your application uses
EXPOSE 3001
# Run the application using shell form to allow environment variable expansion
CMD ./notesHandler --DATABASE_URL=${DATABASE_URL}
