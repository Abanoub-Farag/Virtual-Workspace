# Virtual Workspace Backend

A backend application for the Virtual Workspace platform, built with **Java** and **Spring Boot**. The project uses **PostgreSQL** for data persistence and secures endpoints via **JWT Authentication**. 

The backend is modularized into feature-based packages (`accounts`, `rooms`, `security`), ensuring clean architecture and separation of concerns.

---

## 🚀 Features

### 1. User Authentication & Security
- **JWT-based Security:** Stateless session management using JSON Web Tokens.
- **Registration & Login:** Users can create accounts and securely log in.
- **Role-based Access Control:** Supports user roles (e.g., `ROLE_USER`) and secures endpoints so only authenticated users can access core features.

### 2. User Profiles
- **Automatic Profile Setup:** When a user registers, a `Profile` entity is automatically created and linked to their account via events (`ProfileSetupListener`).
- **Profile Management:** Users can view their profile and update details like bio, gender, and date of birth.
- **Ownership Verification:** Updating a profile is secured using method-level security (`@PreAuthorize`) to ensure that users can only edit their *own* profiles.

### 3. Room Management
- **Create Rooms:** Authenticated users can create virtual rooms with a title and description.
- **Browse Rooms:** Users can fetch a list of all available rooms or retrieve specific data for a single room.

---

## 🛠 Tech Stack

- **Java**
- **Spring Boot 3** (Spring Web, Spring Security, Spring Data JPA)
- **PostgreSQL** (Relational Database)
- **JWT (JSON Web Tokens)** (Authentication/Authorization)
- **Hibernate / JPA** (ORM)
- **Lombok** (Boilerplate reduction)
- **Maven** (Dependency Management)

---

## 🌐 API Endpoints

All endpoints are prefixed with `/api/v1`.

### 🔐 Authentication (`/auth`)
*These endpoints are public and do not require an authorization token.*

| Method | Endpoint          | Description                                | Request Body                            |
|--------|-------------------|--------------------------------------------|-----------------------------------------|
| `POST` | `/auth/register`  | Register a new user account.               | `firstName`, `lastName`, `email`, `password` |
| `POST` | `/auth/login`     | Authenticate a user and return a JWT.      | `email`, `password`                     |

### 👤 User Profiles (`/profile`)
*Requires a valid JWT token.*

| Method | Endpoint          | Description                                | Request Body                            |
|--------|-------------------|--------------------------------------------|-----------------------------------------|
| `GET`  | `/profile/{id}`   | Retrieve profile data for a specific user. | -                                       |
| `POST` | `/profile/{id}`   | Update profile data (Only the profile owner). | `bio`, `gender`, `dateOfBirth`       |

### 🏠 Rooms (`/rooms`)
*Requires a valid JWT token.*

| Method | Endpoint          | Description                                | Request Body                            |
|--------|-------------------|--------------------------------------------|-----------------------------------------|
| `GET`  | `/rooms`          | Get a list of all rooms.                   | -                                       |
| `POST` | `/rooms`          | Create a new room.                         | `title`, `description`                  |
| `GET`  | `/rooms/{id}`     | Get data for a specific room by its ID.    | -                                       |

---

## 📁 Project Structure

The codebase follows a domain-driven package structure:

```
backend/src/main/java/app/virtual_workspace/
 ├── accounts/          # User, Profile entities, authentication, and user events
 │    ├── controllers/  # AuthController, ProfileController
 │    ├── dtos/         # Data Transfer Objects for Auth & Profiles
 │    ├── events/       # UserRegisteredEvent and ProfileSetupListener
 │    ├── models/       # User, Profile, Role, Gender
 │    ├── repositories/ # Spring Data JPA repositories
 │    └── services/     # Business logic for auth and user profiles
 │
 ├── rooms/             # Room entity and management features
 │    ├── controllers/  # RoomController
 │    ├── dtos/         # Room-related requests/responses
 │    ├── models/       # Room entity
 │    ├── repositories/ # Room JPA repository
 │    └── services/     # Room business logic
 │
 └── security/          # Security configurations and filters
      ├── JwtAuthFilter.java    # Intercepts requests to validate JWTs
      ├── JwtService.java       # JWT token generation and parsing
      └── SecurityConfig.java   # Spring Security configuration and bean definitions
```

## ⚙️ Setup & Configuration

The application is configured to connect to a PostgreSQL database by default. Update the `backend/src/main/resources/application.properties` to point to your local or remote database:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/postgres
spring.datasource.username=postgres
spring.datasource.password=postgres
spring.jpa.hibernate.ddl-auto=update
```

To run the project, navigate to the `backend` directory and execute:
```bash
./mvnw spring-boot:run
```
