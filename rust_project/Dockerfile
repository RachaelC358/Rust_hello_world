# Stage 1: Build stage
FROM rust:1.83 AS builder

WORKDIR /app

# Copy manifest files
COPY Cargo.toml Cargo.lock ./

# Copy source code
COPY src ./src

# Build the application in release mode
RUN cargo build --release

# Stage 2: Runtime stage
FROM debian:bookworm-slim

# Install runtime dependencies if needed
RUN apt-get update && apt-get install -y \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user for security
RUN useradd --create-home --shell /bin/bash app

# Copy the compiled binary from the builder stage
COPY --from=builder /app/target/release/hello_world /usr/local/bin/hello_world

# Make the binary executable
RUN chmod +x /usr/local/bin/hello_world

# Switch to non-root user
USER app

# Set the entrypoint
ENTRYPOINT ["hello_world"]