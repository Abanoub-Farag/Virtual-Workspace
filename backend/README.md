# Virtual Workspace - Backend Architecture ⚙️

This directory contains the backend for the Virtual Workspace platform. It is engineered with a strong emphasis on **scalability, security, and enterprise-grade best practices**. 

👉 **Looking for the frontend?** Check out the [Frontend Documentation](../frontend/README.md)

If you are an HR professional or technical recruiter reading this: This codebase demonstrates a deep understanding of modern backend engineering, robust architectural patterns, and production-ready Java development.

## 🚀 Technology Stack & Technical Deep Dive

- **Core**: Java 21, Spring Boot 3/4
- **Database**: PostgreSQL (Production) & H2 (Testing)
- **Caching & Rate Limiting**: Redis, Bucket4j
- **Security**: Spring Security, JWT (`jjwt` 0.12.x), BCrypt
- **Database Migrations**: Flyway (`spring-boot-starter-flyway` v4.1.0)
- **Mapping**: MapStruct (v1.5.5)
- **API Documentation**: OpenAPI 3 / Swagger (`springdoc-openapi-starter-webmvc-ui`)

## 🏗️ Architectural Highlights & Professionalism

The backend is strictly divided into cohesive modules, ensuring separation of concerns and maintainability:

### 1. Advanced Security & Authentication
- **Stateless JWT**: Implemented a custom JWT filter chain that intercepts requests, validates the signature, and sets the `SecurityContext`. This completely stateless approach drastically reduces database hits on protected routes. The tokens are signed using HMAC-SHA256.
- **Method-Level Security**: Extensive use of `@PreAuthorize` to ensure that resource ownership is strictly enforced (e.g., `@PreAuthorize("#task.userId == authentication.principal.id")` ensures only a task owner can delete a task).
- **Protection Measures**: Passwords are never stored in plain text (BCrypt hashing with a strength of 10+ rounds). 

### 2. High-Performance & Scalability Considerations
- **Redis Caching**: Utilized for fast data retrieval and to alleviate database load, specifically for storing active user sessions and heartbeat timestamps.
- **Rate Limiting**: Integrated **Bucket4j** with Redis to prevent API abuse and DDoS attacks, demonstrating a production-first mindset. Configured to allow a burst of requests with a steady refill rate per IP/User.
- **Optimized Pagination**: Uses Spring Data JPA's `Slice` rather than `Page` for high-volume endpoints (like retrieving rooms). `Slice` avoids the expensive `COUNT(*)` query on large datasets, significantly improving query performance.

### 3. Real-Time Presence & Background Processing
- **Heartbeat Mechanism**: Users in a room maintain an active status via a `/heartbeat` API endpoint. 
- **Automated Eviction**: A background `@Scheduled` task routinely sweeps the Redis cache and disconnects users who have missed consecutive heartbeats, keeping the room state accurate without manual intervention.
- **Event-Driven Design**: Uses Spring's `ApplicationEventPublisher`. For example, when an Account is successfully registered, an `AccountCreatedEvent` is published and asynchronously consumed to generate a default Profile, decoupling domain logic.

### 4. Clean Code & Maintainability
- **DTO Pattern & MapStruct**: Strict isolation between database entities and API responses using DTOs, mapped efficiently at compile-time by MapStruct. This prevents lazy-loading exceptions and accidental exposure of sensitive fields.
- **Global Exception Handling**: A centralized `@RestControllerAdvice` ensures that the frontend always receives predictable, structured JSON error responses (including `timestamp`, `status`, `error`, and `path`), regardless of where an exception occurs.
- **Flyway Migrations**: Database schemas are version-controlled via SQL scripts in `src/main/resources/db/migration`, ensuring reliable, repeatable deployments across multiple environments.

## 🌐 API Overview (Base: `/api/v1`)

- **`/auth`**: Registration and Login. Returns JWT Bearer tokens.
- **`/profile`**: User profile management.
- **`/rooms`**: CRUD for virtual rooms, joining rooms, and heartbeat signaling. Includes `/favorites` sub-routes for bookmarking.
- **`/tasks`**: Comprehensive task management.

## 🛠️ Setup & Execution

1. **Prerequisites**: Java 21, PostgreSQL (port `5432`), Redis.
2. **Database Configuration**: 
   Ensure `src/main/resources/application.properties` points to your PostgreSQL instance:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/postgres
   spring.datasource.username=postgres
   spring.datasource.password=postgres
   ```
   Flyway will automatically execute migrations to set up the schemas on startup.
3. **Run**:
   ```bash
   ./mvnw spring-boot:run
   ```
4. **Explore the API**:
   Navigate to `http://localhost:8080/swagger-ui.html` for the interactive OpenAPI documentation.
