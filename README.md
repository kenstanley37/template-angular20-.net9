
# Angular 20 + .NET 9 Web API Template App

A starter template demonstrating a full-stack application using Angular 20 on the frontend and .NET 9 Web API on the backend. This project showcases modern Angular features combined with Angular Material components and secure backend JWT + social authentication.

---

## Table of Contents

- [Features](#features)  
- [Architecture Overview](#architecture-overview)  
- [Getting Started](#getting-started)  
- [Environment Configuration](#environment-configuration)  
- [Running the Application](#running-the-application)  
- [Production Setup](#production-setup)  
- [Contributing](#contributing)  
- [License](#license)  

---

## Features

- JWT Authentication (login, logout, token refresh)  
- Social login support (Google, Facebook, etc.)  
- Backend-driven frontend configuration (e.g., theme, settings)  
- Angular Material UI components & responsive design  
- Secure API endpoints with role-based authorization  
- Environment-based configuration for development and production  

---

## Architecture Overview

### Frontend

- **Angular 20**: Latest Angular framework leveraging Signals, standalone components, and modern best practices  
- **Angular Material**: UI component library for consistent and accessible design  
- **Auth Module**: Manages JWT and social login flows  
- **Configuration Module**: Loads and applies settings fetched from the backend at runtime  

### Backend

- **.NET 9 Web API**: RESTful API with controllers, services, and EF Core for data access  
- **Authentication**: JWT-based with refresh tokens, social login integrations  
- **Configuration Service**: Serves frontend configuration (e.g., theme, API URLs)  
- **Security**: Environment-based secrets, role-based authorization, HTTPS enforced  

---

## Getting Started

### Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/9.0)  
- [Node.js 18+](https://nodejs.org/en/download/) and npm  
- [Angular CLI 16+](https://angular.io/cli)  

---

### Backend Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/your-repo.git
   cd your-repo/backend
   ```

2. Set environment variables (see [Environment Configuration](#environment-configuration)).

3. Apply database migrations (if using EF Core):

   ```bash
   dotnet ef database update
   ```

4. Run the API:

   ```bash
   dotnet run
   ```

   By default, API runs at `https://localhost:5001`.

---

### Frontend Setup

1. Navigate to the frontend folder:

   ```bash
   cd ../frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure the API base URL:

   - Modify `src/environments/environment.ts` for development  
   - Or use backend-driven config during runtime  

4. Run the Angular app:

   ```bash
   ng serve
   ```

5. Open your browser at [http://localhost:4200](http://localhost:4200).

---

## Environment Configuration

### Recommended: Use a Secret Manager for Production

Use Azure Key Vault, AWS Secrets Manager, or similar to securely store:

- Database connection strings  
- JWT secret keys  
- OAuth client IDs and secrets  

---

### Environment Variables

**Windows PowerShell**

```powershell
$env:ConnectionStrings__DefaultConnection="Server=your-server;Database=AuthDb;User Id=sa;Password=your-password;TrustServerCertificate=True"
$env:Jwt__Key="your-secure-key-here-32-chars-long"
$env:Jwt__Issuer="https://your-api-domain"
$env:Jwt__Audience="https://your-api-domain"
$env:Frontend__Url="https://your-frontend-domain"
$env:Api__BaseUrl="https://your-api-domain/api"
```

**Linux / macOS (Bash)**

```bash
export ConnectionStrings__DefaultConnection="Server=your-server;Database=AuthDb;User Id=sa;Password=your-password;TrustServerCertificate=True"
export Jwt__Key="your-secure-key-here-32-chars-long"
export Jwt__Issuer="https://your-api-domain"
export Jwt__Audience="https://your-api-domain"
export Frontend__Url="https://your-frontend-domain"
export Api__BaseUrl="https://your-api-domain/api"
```

---

## Running the Application

- Run backend API first  
- Start frontend Angular app  
- Access frontend and login with JWT or social accounts  
- Explore UI components and themes  
- Extend with your own features!

---

## Contributing

Contributions are welcome! Please:

- Fork the repo  
- Create a feature branch  
- Write tests for new features  
- Follow existing code style and conventions  
- Submit a pull request with a clear description  

---

## License

MIT License © [Your Name or Organization]

---

If you want, I can also help generate sample code snippets for authentication, social login integration, or Angular Material usage — just ask!
