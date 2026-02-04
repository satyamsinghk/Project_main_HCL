# Library Management System

A full-stack Library Management System built with the **MERN Stack** (MongoDB, Express, React, Node.js), featuring a modular "microservice-like" folder structure, Role-Based Access Control (RBAC), and centralized error handling.

## 🏗 Architecture

The project follows a **Modular Monolith** architecture. While it runs as a single Express server, the codebase is organized into distinct services to simulate microservice boundaries:

- **Auth Service**: Handles User Registration, Login, and JWT generation.
- **Admin Service**: Manages Books (CRUD), Students, and Approval flows.
- **Student Service**: Handles Book browsing, Borrowing, and Returning.

### Tech Stack
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose Schema)
- **Frontend**: React (Vite), Context API
- **Documentation**: Swagger UI, Postman

---

## 📂 MongoDB Schema

### 1. User
- `name` (String)
- `email` (String, Unique)
- `password` (String, Hashed)
- `role` (Enum: 'student', 'admin')
- `isApproved` (Boolean) - *Required for Student Login*

### 2. Book
- `title` (String)
- `author` (String)
- `totalCopies` (Number)
- `availableCopies` (Number)
- `isbn` (String, Unique)

### 3. Registration (Borrow Record)
- `userId` (Ref: User)
- `bookId` (Ref: Book)
- `issueDate` (Date)
- `returnDate` (Date)
- `status` (Enum: 'borrowed', 'returned')

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js installed
- MongoDB installed and running locally on port `27017`

### 1. Backend Setup
```bash
# Install dependencies
npm install

# Start the server (Runs on port 5000)
npm start
```
*Environment Variables (.env) are pre-configured for local dev.*

### 2. Frontend Setup
```bash
cd client

# Install dependencies
npm install

# Start React Dev Server (Runs on port 5173)
npm run dev
```
Access the App at: `http://localhost:5173`

---

## 📡 API Documentation

### Swagger UI
Full interactive API documentation is available at:
👉 **[http://localhost:5000/api-docs](http://localhost:5000/api-docs)**

### API List

#### Auth Service
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/register` | Register new user (Alternative) |
| POST | `/api/auth/login` | Login and get JWT |

#### Student Service
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/api/student/books` | List available books (Paginated) |
| POST | `/api/student/borrow` | Borrow a book |
| POST | `/api/student/return` | Return a book |
| GET | `/api/student/mybooks` | View borrow history |

#### Admin Service
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/api/admin/books` | List all books (Paginated) |
| POST | `/api/admin/books` | Add a new book |
| PUT | `/api/admin/books/:id` | Update a book |
| DELETE | `/api/admin/books/:id` | Delete a book |
| GET | `/api/admin/students` | List all students |
| PUT | `/api/admin/approve/:id` | Approve student account |
| GET | `/api/admin/borrowed-books` | View all borrowed books |

---

## 🧪 Testing with Postman
A `postman_collection.json` file is included in the root directory.

1. Open Postman.
2. Click **Import**.
3. Select `postman_collection.json`.
4. Run requests (Environment variables for the URL are not needed, defaults to `localhost:5000`).

---

## 🛡 Security & Validation
- **JWT Authentication**: All protected routes require a valid Bearer Token.
- **RBAC**: Middleware ensures only Admins can access Admin routes.
- **Input Validation**: Mongoose models enforce schema rules.
- **Centralized Error Handling**: All errors return a standard JSON format.
