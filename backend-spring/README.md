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
2. Copy the root `.env.example` to `.env`, fill local values, then load it in your shell.
3. Use a non-empty `JWT_SECRET` with at least 32 characters.
4. Start the app:

```bash
set -a
source ../.env
set +a
mvn spring-boot:run
```

The backend runs on `http://localhost:3001` by default, matching the current React API base URL.

For RAG and cry-analysis backed features, also start the Python services:

```bash
python3 ../rag-service/main.py
```

```bash
cd ../cry-analysis
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000
```

## Important Migration Notes

- Application authentication uses `/api/auth/register`, `/api/auth/login`, Spring Security, JWT, BCrypt, and MySQL user records.
- Firebase Auth is not used. Firebase Cloud Messaging uses the Firebase Admin Java SDK when `FIREBASE_ADMIN_ENABLED=true`; device tokens remain stored on the MySQL user row.
- Python RAG and cry-analysis services remain separate services and are called over HTTP.
- JPA uses `ddl-auto=update` for local migration speed. Use Flyway/Liquibase migrations before production.
