# Task Management System

A modern Kanban-style Task Management Dashboard built with React, TypeScript, Tailwind CSS, and ASP.NET Core Web API, using MySQL as the database.

---

## Table of Contents
- [Prerequisites](#prerequisites)
- [Tech Stack](#tech-stack)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Additional Features](#additional-features)

---

## Prerequisites

Make sure the following tools are installed on your system:

- [.NET 6 SDK](https://dotnet.microsoft.com/en-us/download)
- [Node.js v16+](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [MySQL Server](https://dev.mysql.com/downloads/mysql/)
- [MySQL Workbench](https://www.mysql.com/products/workbench/)

---

## Tech Stack

| Layer     | Technology               |
|-----------|--------------------------|
| Frontend  | React + TypeScript       |
| Styling   | Tailwind CSS             |
| Backend   | ASP.NET Core Web API     |
| Database  | MySQL                    |
| State     | useState/useEffect (No Redux) |
| Auth      | JWT Token-based auth     |
| HTTP      | Axios                    |
| Animation | Framer Motion            |

---

## Backend Setup

### 1. Clone the repository
```bash
git clone https://github.com/Maheen-khalid/MaheenKhalidTM_10P
cd task-management/backend

- SQL Server (or other preferred database)

```

### 2. Configure the database:
- Update the `appsettings.json` file with your database connection string.
- Example `appsettings.json`:
  ```json
  {
    "ConnectionStrings": {
      "DefaultConnection": "Server=your_server_name;Database=your_database_name;User Id=your_username;Password=your_password;"
    },
    ...
  }
  ```

### 3. Run Entity Framework migrations:
```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

### 4. Install dependencies:
```bash
dotnet restore
```

### 5. Running the Backend
```bash
dotnet run
```
The backend API will be available at `https://localhost:7088`


## Frontend Setup
### 1. Navigate to the frontend directory:
```bash
cd ../../frontend
```

### 2. Install dependencies:
```bash
npm install
```


### 3. Running the Frontend
```bash
npm start
```
The frontend will be available at ` http://localhost:5173/`.


# Tech Stack:
Following Tech Stack is being implemented:
- React + Typescript for frontend
- ASP.NET Core Web Api
- SQL Server Management Studio for database
- Redux for state management in React
- Serilog for Application logging (to be implemented)
- xUnit for unit testing (to be implemented)
<!-- - SonarQube for analyzing code quality (to be implemented) -->

## Additional Information
TBD

