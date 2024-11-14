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
# Build the binary - adjust the path based on your project structure
RUN go build -o server ./cmd/api

# Final stage - create a lightweight image
FROM alpine:latest
# Add CA certificates for HTTPS connections
RUN apk --no-cache add ca-certificates
# Set working directory
WORKDIR /app
# Copy the built binary from the builder stage
COPY --from=builder /app/server .

# Expose the port (default to 8080 if not set)
EXPOSE ${PORT:-8080}

# Run the server with all environment variables
CMD ./server \
    -env=${ENV} \
    -port=${PORT} \
    -db-dsn=${DSN} \
    -smtp-host=${SMTP_HOST} \
    -smtp-port=${SMTP_PORT} \
    -smtp-username=${SMTP_USERNAME} \
    -smtp-password=${SMTP_PASSWORD} \
    -smtp-sender=${SMTP_SENDER}
