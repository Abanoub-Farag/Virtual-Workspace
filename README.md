# Virtual Workspace API

A modular backend application built with **Java**, **Spring Boot 3**, and **PostgreSQL**. It provides a secure API for managing users, virtual rooms, and tasks, utilizing **JWT** for stateless authentication.

---

## 🏗 Architecture & Modules

- **Accounts:** User registration, JWT authentication, and automated profile generation.
- **Rooms:** Creation, retrieval, and updating of virtual rooms. Includes a "Favorites" feature to bookmark rooms.
- **Tasks:** CRUD operations for task management.
- **Security:** Stateless JWT filter and method-level security for ownership verification.
- **Exception Handling:** Global error handling returning structured error responses.

---

## 🌐 API Endpoints

*Base URL:* `/api/v1`

### 🔐 Authentication (`/auth`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Register new user. |
| `POST` | `/auth/login` | Authenticate and retrieve JWT. |

### 👤 Profiles (`/profile`) - *Requires JWT*
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/profile/{userId}` | Get user profile. | Any authenticated user. |
| `POST` | `/profile/{userId}` | Update profile. | Profile owner only. |

### 🏠 Rooms (`/rooms`) - *Requires JWT*
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/rooms` | Get all rooms. | Any authenticated user. |
| `POST`| `/rooms` | Create a new room. | Any authenticated user. |
| `GET` | `/rooms/{roomId}`| Get specific room details. | Any authenticated user. |
| `POST`| `/rooms/{roomId}`| Update a room. | Room owner only. |

### ⭐ Favorite Rooms (`/rooms/favorites`) - *Requires JWT*
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/rooms/favorites` | Get all favorite rooms for the authenticated user. |
| `POST` | `/rooms/favorites/{roomId}` | Add a room to user's favorites. |
| `DELETE`| `/rooms/favorites/{roomId}` | Remove a room from user's favorites. |

### ✅ Tasks (`/tasks`) - *Requires JWT*
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/tasks` | Get all tasks. | Any authenticated user. |
| `POST`| `/tasks` | Create a new task. | Any authenticated user. |
| `PUT` | `/tasks/{taskId}` | Update a task. | Task owner only. |
| `DELETE`| `/tasks/{taskId}` | Delete a task. | Task owner only. |

---

## ⚙️ Setup & Run

1. **Database Setup:** 
   Update `src/main/resources/application.properties` with your PostgreSQL credentials:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/postgres
   spring.datasource.username=postgres
   spring.datasource.password=postgres
   spring.jpa.hibernate.ddl-auto=update
   ```
2. **Run Application:**
   ```bash
   ./mvnw spring-boot:run
   ```
