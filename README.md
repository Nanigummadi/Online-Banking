# Full-Stack Online Banking Application

A robust, cross-platform full-stack online banking system designed to simulate modern secure digital banking features. This project showcases an enterprise backend architecture communicating seamlessly with a modern frontend interface.

## Tech Stack
- **Backend:** Java 17+, Spring Boot, Spring Data JPA, RESTful APIs
- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Runtime & Package Manager:** Bun (or Node.js)
- **Database:** MySQL / PostgreSQL

##  Multi-Platform Installation Guide

Follow these environment-specific instructions to spin up the application on Windows, Linux, or macOS.

###  Prerequisites
Ensure you have the following installed on your system before proceeding:
- **Java Development Kit (JDK):** Version 17 or higher
- **Build Tool:** Maven (or use the included wrapper scripts)
- **Frontend Environment:** Bun (Recommended) or Node.js (v18+)

---

### 1. Backend Setup (Spring Boot)

####  Windows (Command Prompt / PowerShell)
Navigate to the backend directory and run the Maven wrapper:
```cmd
cd springboot-backend
.\mvnw.cmd spring-boot:run
```

#### Linux /  macOS (Terminal)
Navigate to the backend directory, grant execution permissions to the wrapper, and run it:
```bash
cd springboot-backend
chmod +x mvnw
./mvnw spring-boot:run
```

---

### 2. Frontend Setup (React + Bun)

####  Windows (Command Prompt / PowerShell)
From the root project directory, run:
```cmd
# Install node modules
bun install

# Start the development server
bun run dev
```

####  Linux /  macOS (Terminal)
From the root project directory, run:
```bash
# Install node modules
bun install

# Start the development server
bun run dev
```

*Note: If you are using Node.js instead of Bun on any operating system, replace `bun install` with `npm install` and `bun run dev` with `npm run dev`.*

---

###  Default Network Ports
Once both servers are running successfully, you can access them via your browser:
- **Frontend Interface:** `http://localhost:5173` (Vite Default)
- **Backend Rest API:** `http://localhost:8080` (Spring Boot Default)

