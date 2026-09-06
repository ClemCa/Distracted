# syntax=docker/dockerfile:1

# ---- Stage 1: Build the React frontend into src/main/resources/static ----
FROM node:22-alpine AS frontend-build
WORKDIR /app/frontend

# Install frontend dependencies (layer cached)
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# Build and emit into /app/src/main/resources/static
COPY frontend/ ./
RUN npm run build:spring

# ---- Stage 2: Package the Spring Boot jar (frontend static files included) ----
FROM eclipse-temurin:26-jdk AS backend-build
WORKDIR /app

# Maven wrapper (downloads Maven 3.9.16 on first run)
COPY .mvn .mvn
COPY mvnw pom.xml ./

# Cache dependencies before copying the sources
COPY src ./src
COPY --from=frontend-build /app/src/main/resources/static ./src/main/resources/static

RUN sh ./mvnw -B -DskipTests clean package

# Compile a zero-dependency healthcheck probe (no curl/wget in the runtime image)
RUN printf '%s\n' \
      'import java.net.HttpURLConnection;' \
      'import java.net.URI;' \
      'public class HealthCheck {' \
      '  public static void main(String[] args) throws Exception {' \
      '    HttpURLConnection c = (HttpURLConnection) URI.create("http://localhost:8081/health").toURL().openConnection();' \
      '    c.setConnectTimeout(2000);' \
      '    c.setReadTimeout(2000);' \
      '    c.setRequestMethod("GET");' \
      '    System.exit(c.getResponseCode() == 200 ? 0 : 1);' \
      '  }' \
      '}' > HealthCheck.java \
    && javac HealthCheck.java

# ---- Stage 3: Runtime ----
FROM eclipse-temurin:26-jre-noble AS runner
WORKDIR /data

COPY --from=backend-build /app/target/*.jar app.jar
COPY --from=backend-build /app/HealthCheck.class /opt/healthcheck/HealthCheck.class

# SSO credentials are injected at deploy time
ENV CLEMSSO_CLIENT_ID="" \
    CLEMSSO_CLIENT_SECRET=""

EXPOSE 8081

# ClemPloy uses this for monitoring (zero extra OS packages)
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD ["java", "-cp", "/opt/healthcheck", "HealthCheck"]

CMD ["java", "-jar", "app.jar"]
