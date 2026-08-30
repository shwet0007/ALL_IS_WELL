# Aal Is Well Spring Backend

Primary application backend for Aal Is Well.

## Stack

- Java 17+
- Spring Boot
- Spring MVC
- Spring Security
- JWT
- BCrypt
- Spring Data JPA
- Hibernate
- MySQL
- WebClient integrations for Groq, Sarvam, Python RAG, and Python cry analysis

## Run Locally

1. Create a MySQL database named `aal_is_well`, or keep the default JDBC URL with `createDatabaseIfNotExist=true`.
2. Export the values from `.env.example` in your shell.
3. Use a non-empty `JWT_SECRET` with at least 32 characters.
4. Start the app:

```bash
mvn spring-boot:run
```

The backend runs on `http://localhost:3001` by default, matching the current React API base URL.

## Important Migration Notes

- Application authentication uses `/api/auth/register`, `/api/auth/login`, Spring Security, JWT, BCrypt, and MySQL user records.
- Firebase Cloud Messaging is still represented by `FcmNotificationService` and device token storage on the MySQL user row.
- Python RAG and cry-analysis services remain separate services and are called over HTTP.
- JPA uses `ddl-auto=update` for local migration speed. Use Flyway/Liquibase migrations before production.
