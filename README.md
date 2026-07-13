# Virtual Workspace API

A modular, high-performance backend application built with **Java 21**, **Spring Boot 3/4**, and **PostgreSQL**. It provides a secure API for managing users, virtual rooms, and tasks, utilizing **JWT** for stateless authentication, **Redis** for caching, and **Bucket4j** for API rate limiting.

---

## 🏗 Architecture & Modules

- **Accounts:** User registration, stateless JWT authentication, and automated event-driven profile generation (`ApplicationEventPublisher`).
- **Rooms:** Creation, retrieval (using optimized `Slice` pagination), and updating of virtual workspaces. Includes a "Favorites" feature to bookmark rooms.
- **Room Members:** Real-time presence tracking. Users can join rooms and maintain active status through a heartbeat mechanism, with a background `@Scheduled` task automatically disconnecting inactive users.
- **Tasks:** Full CRUD operations for task management tied to individual users.
- **Security:** Stateless custom JWT filter chain, BCrypt password hashing, and strict method-level security (`@PreAuthorize`) for ownership verification.
- **Exception Handling:** Global error handling (`@RestControllerAdvice`) returning structured JSON error responses across all modules.

---

## 🛠 Tech Stack & Tools

- **Framework**: Java 21 & Spring Boot
- **Database**: PostgreSQL (Production) & H2 (Testing)
- **Migrations**: Flyway (`spring-boot-starter-flyway`)
- **Security & Auth**: Spring Security & JWT (`jjwt`)
- **Caching & Rate Limiting**: Redis (`spring-boot-starter-data-redis`) & Bucket4j
- **DTO Mapping**: MapStruct
- **API Documentation**: Swagger / OpenAPI 3 (`springdoc-openapi-starter-webmvc-ui`)
- **Boilerplate Reduction**: Lombok

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
| `PUT` | `/profile` | Update own profile. | Profile owner only. |

### 🏠 Rooms (`/rooms`) - *Requires JWT*
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/rooms` | Get all rooms (Paginated `Slice`). | Any authenticated user. |
| `POST`| `/rooms` | Create a new room. | Any authenticated user. |
| `GET` | `/rooms/{roomId}`| Get specific room details. | Any authenticated user. |
| `PUT` | `/rooms/{roomId}`| Update a room. | Room owner only. |
| `DELETE`|`/rooms/{roomId}`| Delete a room. | Room owner only. |

### 👥 Room Members (`/rooms`) - *Requires JWT*
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/rooms/{roomId}/join` | Join a specific room. |
| `PUT` | `/rooms/{roomId}/heartbeat`| Send active status heartbeat. |

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

1. **Prerequisites:**
   - Java 21+ installed.
   - PostgreSQL running on default port (`5432`).
   - Redis running locally or accessible.

2. **Database Setup:** 
   Update `backend/src/main/resources/application.properties` with your PostgreSQL credentials:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/postgres
   spring.datasource.username=postgres
   spring.datasource.password=postgres
   ```
   *(Note: Flyway will automatically execute migrations to set up the schemas on startup).*

3. **Run Application:**
   Navigate to the backend directory and run:
   ```bash
   ./mvnw spring-boot:run
   ```

4. **API Documentation:**
   Once running, access the Swagger UI at:
   `http://localhost:8080/swagger-ui.html`
