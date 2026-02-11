# 🚀 Helpdesk Backend

The core API service for the Helpdesk application. This service acts as an **API Gateway**, handling authentication, routing, and business logic before communicating with the underlying **Database Service**.

## 🏗️ Architecture

The backend is built with Node.js and Express. It follows a modular structure where each feature is encapsulated in its own directory:

- `01-auth`: Authentication & Authorization (JWT)
- `02-users`: User management & Profiles
- `03-tickets`: Ticket lifecycle, AI routing, and assignment
- `04-attachments`: File upload and download handling
- `05-sla`: SLA tracking and breach detection
- `06-notifications`: Real-time notification logic
- `07-kb`: Knowledge Base article management
- `08-reports`: Analytics and reporting
- `admin`: Specialized administrative controls

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- [npm](https://www.npmjs.com/)

### Setup & Installation

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Configuration**:
    Create a `.env` file in the `backend` directory with the following variables:
    ```env
    PORT=4000
    DB_API=http://localhost:5000/api/  # URL of the Database Service
    JWT_SECRET=your_secret_key_here
    ```

### Running the Server

- **Development Mode** (with hot reload):
    ```bash
    npm run dev:server
    ```

- **Production Mode**:
    ```bash
    npm start
    ```

---

## 📡 API Endpoints

All routes (except `/auth`) require a valid JWT in the `Authorization` header: `Bearer <token>`.

### 🔐 Auth
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Login and receive JWT |

### 🎫 Tickets
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/tickets` | Create a new ticket (AI analyzed) |
| `GET` | `/tickets` | List tickets (filtered by role/department) |
| `GET` | `/tickets/:id` | Get ticket details |
| `PATCH` | `/tickets/:id` | Update ticket properties |
| `PATCH` | `/tickets/:id/assign` | Assign agent to ticket |
| `GET` | `/tickets/:id/history` | View ticket activity log |

### 👤 Users
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/users` | List all users (Admin only) |
| `POST` | `/users` | Create new user (Admin only) |
| `PUT` | `/users/:id` | Update user details |
| `PATCH` | `/users/:id/status` | Toggle user active/inactive |

### 📚 Knowledge Base
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/kb` | List all articles |
| `GET` | `/kb/search` | Search KB articles |
| `POST` | `/kb` | Create new article |
| `PUT` | `/kb/:id` | Update article |
| `DELETE` | `/kb/:id` | Remove article |

### 🔔 Notifications
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/notifications` | Get user notifications |
| `POST` | `/notifications` | Create notification |

### 📊 Reports & Admin
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/reports/summary` | Ticket analytics (Admin only) |
| `GET` | `/admin/dashboard` | System overview |
| `PATCH` | `/admin/user/:id/role` | Change user role |

---

## 📂 Project Structure

```text
backend/
├── 01-auth/           # JWT & Auth logic
├── 02-users/          # User management
├── 03-tickets/        # Ticket CRUD & AI logic
├── 04-attachments/    # File upload handling
├── 05-sla/            # Service Level Agreements
├── 06-notifications/  # Notification logic
├── 07-kb/             # Knowledge Base
├── 08-reports/        # Analytical reports
├── admin/             # Admin-only routes
├── utils/             # Helpers (AI, Files, etc.)
└── server.js          # Entry point
```
