# Virtual Workspace - Backend Architecture ⚙️

This directory contains the backend for the Virtual Workspace platform. It is engineered with a strong emphasis on **scalability, security, and enterprise-grade best practices**. 

👉 **Looking for the frontend?** Check out the [Frontend Documentation](../frontend/README.md)

If you are an HR professional or technical recruiter reading this: This codebase demonstrates a deep understanding of modern backend engineering, robust architectural patterns, and production-ready Java development.

## 🚀 Technology Stack

- **Core**: Java 21, Spring Boot 3/4
- **Database**: PostgreSQL (Production) & H2 (Testing)
- **Caching & Rate Limiting**: Redis, Bucket4j
- **Security**: Spring Security, JWT (`jjwt`), BCrypt
- **Database Migrations**: Flyway
- **Mapping**: MapStruct
- **API Documentation**: OpenAPI 3 / Swagger

## 🏗️ Architectural Highlights & Professionalism

The backend is strictly divided into cohesive modules, ensuring separation of concerns and maintainability:

### 1. Advanced Security & Authentication
- **Stateless JWT**: Implemented a custom JWT filter chain for completely stateless authentication, drastically reducing database hits on protected routes.
- **Method-Level Security**: Extensive use of `@PreAuthorize` to ensure that resource ownership is strictly enforced (e.g., only a task owner can delete a task).
- **Protection Measures**: Passwords are never stored in plain text (BCrypt hashing). 

### 2. High-Performance & Scalability Considerations
- **Redis Caching**: Utilized for fast data retrieval and to alleviate database load.
- **Rate Limiting**: Integrated **Bucket4j** with Redis to prevent API abuse and DDoS attacks, demonstrating a production-first mindset.
- **Optimized Pagination**: Uses Spring Data JPA's `Slice` rather than `Page` for high-volume endpoints (like retrieving rooms), which avoids the expensive `COUNT` query on large datasets.

### 3. Real-Time Presence & Background Processing
- **Heartbeat Mechanism**: Users in a room maintain an active status via a heartbeat API. 
- **Automated Eviction**: A background `@Scheduled` task routinely sweeps and disconnects users who have dropped off, keeping the room state accurate without manual intervention.
- **Event-Driven Design**: Uses `ApplicationEventPublisher` (e.g., automatically generating a Profile when an Account is registered), decoupling domain logic and keeping services clean.

### 4. Clean Code & Maintainability
- **DTO Pattern & MapStruct**: Strict isolation between database entities and API responses using DTOs, mapped efficiently at compile-time by MapStruct.
- **Global Exception Handling**: A centralized `@RestControllerAdvice` ensures that the frontend always receives predictable, structured JSON error responses, regardless of where an exception occurs.
- **Flyway Migrations**: Database schemas are version-controlled, ensuring reliable deployments across multiple environments.

## 🌐 API Overview (Base: `/api/v1`)

- **`/auth`**: Registration and Login.
- **`/profile`**: User profile management.
- **`/rooms`**: CRUD for virtual rooms, joining rooms, and heartbeat signaling. Includes `/favorites` sub-routes for bookmarking.
- **`/tasks`**: Comprehensive task management.

## 🛠️ Setup & Execution

1. **Prerequisites**: Java 21, PostgreSQL (port `5432`), Redis.
2. **Database Configuration**: 
   Ensure `src/main/resources/application.properties` points to your PostgreSQL instance. Flyway will handle the schema setup automatically.
3. **Run**:
   ```bash
   ./mvnw spring-boot:run
   ```
4. **Explore the API**:
   Navigate to `http://localhost:8080/swagger-ui.html` for the interactive OpenAPI documentation.
