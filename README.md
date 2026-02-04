# 📚 Library Management System (MERN Stack)

> A production-grade, full-stack Library Management System built with **Node.js, Express, MongoDB, and React**. Designed with a modular architecture simulating microservices, this system features Role-Based Access Control (RBAC), centralized error handling, and a modern UI.

![Status](https://img.shields.io/badge/status-Active-green.svg)
![Stack](https://img.shields.io/badge/stack-MERN-orange.svg)

---

## 🌟 Key Features

### 🔐 Authentication & Security
- **JWT Authentication**: Secure stateless authentication using JSON Web Tokens.
- **RBAC (Role-Based Access Control)**: Distinct guards for `Student` and `Admin` routes.
- **Admin Approval Workflow**: New student accounts are locked (`isApproved: false`) until manually authorized by an Admin.
- **Password Hashing**: Bcrypt encryption for user passwords.

### 👨‍🎓 Student Portal
- **Dashboard**: View personal borrow history and due amounts.
- **Book Browser**: Search and view available books with real-time stock updates.
- **Borrowing System**: One-click borrowing (auto-validates availability and duplicate borrows).
- **Return System**: Easy return process.

### 👩‍💼 Admin Portal
- **Dashboard**: High-level view of library stats.
- **Book Management**: Full CRUD (Create, Read, Update, Delete) capability for the library catalog.
- **Student Management**: View registered students and **Approve** pending accounts.
- **Lending Monitor**: Track all borrowed books, who has them, and their due status.

### ⚙️ Backend Architecture
- **Modular Monolith**: Codebase organized into distinct "services" (`auth-service`, `admin-service`, `student-service`) sharing a single runtime.
- **Centralized Error Handling**: Custom middleware transforms all system errors into a standardized JSON response format.
- **Auto-Generated Documentation**: Integrated **Swagger UI** for live API testing.

---

## 📂 Project Structure

```bash
📦 library-management-system
 ┣ 📂 config              # Swagger & Database configuration
 ┣ 📂 middleware          # Auth & Error handling middleware
 ┣ 📂 services            # Microservice logic
 ┃ ┣ 📂 admin-service     # Admin controllers & routes
 ┃ ┣ 📂 auth-service      # Auth controllers, User model & routes
 ┃ ┗ 📂 student-service   # Student controllers, Borrow model & routes
 ┣ 📂 client              # React Frontend (Vite)
 ┃ ┣ 📂 src
 ┃ ┃ ┣ 📂 components      # Protected Routes & UI components
 ┃ ┃ ┣ 📂 context         # Global Auth State
 ┃ ┃ ┗ 📂 pages           # Dashboards & Auth Pages
 ┣ 📂 utils               # Helper functions (ResponseHandler)
 ┣ 📜 server.js           # Entry point
 ┗ 📜 README.md           # Documentation
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v14+)
- [MongoDB](https://www.mongodb.com/try/download/community) (Running locally on port 27017)

### 1. Backend Setup
The backend runs on port **5000**.

1.  **Clone the repository** and navigate to the root folder.
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Configure Environment**:
    Create a `.env` file in the root (optional, defaults provided):
    ```env
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/library-system
    JWT_SECRET=supersecretkey123
    ```
4.  **Start Server**:
    ```bash
    npm start
    ```

### 2. Frontend Setup
The frontend runs on port **5173**.

1.  Navigate to the client folder:
    ```bash
    cd client
    ```
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Start Development Server**:
    ```bash
    npm run dev
    ```
4.  Open `http://localhost:5173` in your browser.

---

## 📡 API Documentation (Swagger)

We use **Swagger UI** for interactive API documentation. 
Once the backend is running, visit:

👉 **[http://localhost:5000/api-docs](http://localhost:5000/api-docs)**

This interface allows you to:
- See all available endpoints.
- Test APIs directly from the browser.
- View required request schemas and example responses.

### Sample API Response (Standardized)
All success/error responses follow this format:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "books": [...],
    "totalPages": 5
  },
  "errorCode": null
}
```

---

## 🧪 Testing

### Postman
A `postman_collection.json` is included in the root directory. Import it into Postman to instantly access pre-configured requests.

### User Flow Walkthrough
1.  **Register as Student**: Go to `/signup`. Create an account. You will see a "Pending Approval" message.
2.  **Login as Admin**: Use default admin credentials (or create one using Postman with `role: "admin"`).
3.  **Approve Student**: In Admin Dashboard -> "Manage Students", click **Approve** next to the new student.
4.  **Login as Student**: Now you can login and borrow books.

---

## 🛠 Troubleshooting

**Q: Server fails with `EADDRINUSE`?**
A: Port 5000 is occupied. Kill the process using:
`kill -9 $(lsof -t -i:5000)` (Mac/Linux) or change PORT in `.env`.

**Q: "Account not approved" error?**
A: This is intentional. You must approve new student accounts via the Admin Dashboard.

**Q: "MongoDB Connection Error"?**
A: Ensure your local MongoDB service is running (`brew services start mongodb-community` on Mac).

---


