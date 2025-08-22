# Hello World Rust App

A simple Rust application that prints "Hello, world!" and can be run locally with Docker.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

## Quick Start

1. **Clone or download this repository**

2. **Open a terminal/command prompt and navigate to the project folder**
   ```bash
   cd path/to/hello_world
   ```

3. **Build the Docker image**
   ```bash
   docker build -t hello_world:latest .
   ```

4. **Run the container**
   ```bash
   docker run --rm hello_world
   ```

You should see the output:
```
Hello, world!
```
