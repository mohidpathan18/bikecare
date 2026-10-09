FROM eclipse-temurin:27-jdk

WORKDIR /app

# The project is intentionally built with javac and its already-vendored SQLite driver.
COPY src/main/java/com/bikecare/BikeCareApplication.java /app/BikeCareApplication.java
COPY src/main/resources/sqlite-jdbc.jar /app/sqlite-jdbc.jar
COPY src/main/resources/static/ /app/src/main/resources/static/

RUN mkdir -p /app/classes /var/data \
    && javac --add-modules jdk.httpserver -encoding UTF-8 -d /app/classes /app/BikeCareApplication.java

ENV PORT=8080
ENV BIKECARE_DB=/var/data/bikecare.db

EXPOSE 8080

CMD ["java", "--add-modules", "jdk.httpserver", "--enable-native-access=ALL-UNNAMED", "-cp", "/app/classes:/app/sqlite-jdbc.jar", "BikeCareApplication"]
